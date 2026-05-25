'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import s from './RedisPlayground.module.scss';

// ── Redis simulation ──────────────────────────────────────────────────────────

type RStr  = { t: 'str';  v: string };
type RHash = { t: 'hash'; v: Record<string, string> };
type RList = { t: 'list'; v: string[] };
type RSet  = { t: 'set';  v: string[] };           // sorted unique array
type RZSet = { t: 'zset'; v: [string, number][] }; // [member, score][] sorted by score
type RVal  = RStr | RHash | RList | RSet | RZSet;
type RDB   = Record<string, { val: RVal; exAt?: number }>;

function tokenize(raw: string): string[] {
  const tokens: string[] = [];
  let cur = '';
  let inQ = false;
  let qChar = '';
  for (const ch of raw) {
    if (inQ) {
      if (ch === qChar) { inQ = false; }
      else { cur += ch; }
    } else if (ch === '"' || ch === "'") {
      inQ = true; qChar = ch;
    } else if (ch === ' ' || ch === '\t') {
      if (cur) { tokens.push(cur); cur = ''; }
    } else {
      cur += ch;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

interface Line {
  kind: 'cmd' | 'ok' | 'err' | 'int' | 'str' | 'nil' | 'arr';
  text: string;
}

function execCmd(db: RDB, raw: string): { lines: Line[]; db: RDB } {
  const newDB = JSON.parse(JSON.stringify(db)) as RDB;
  const now = Date.now();

  // Remove expired
  for (const k of Object.keys(newDB)) {
    if (newDB[k].exAt && newDB[k].exAt! < now) delete newDB[k];
  }

  const toks = tokenize(raw.trim());
  if (!toks.length) return { lines: [], db: newDB };

  const cmd = toks[0].toUpperCase();
  const args = toks.slice(1);

  const err  = (msg: string): { lines: Line[]; db: RDB } =>
    ({ lines: [{ kind: 'err', text: `(error) ${msg}` }], db: newDB });
  const ok   = (): { lines: Line[]; db: RDB } =>
    ({ lines: [{ kind: 'ok', text: 'OK' }], db: newDB });
  const int  = (n: number): { lines: Line[]; db: RDB } =>
    ({ lines: [{ kind: 'int', text: `(integer) ${n}` }], db: newDB });
  const nil  = (): { lines: Line[]; db: RDB } =>
    ({ lines: [{ kind: 'nil', text: '(nil)' }], db: newDB });
  const str  = (v: string): { lines: Line[]; db: RDB } =>
    ({ lines: [{ kind: 'str', text: `"${v}"` }], db: newDB });
  const arr  = (items: Line[]): { lines: Line[]; db: RDB } =>
    ({ lines: items, db: newDB });

  const getStr = (key: string): string | null => {
    const e = newDB[key];
    if (!e) return null;
    if (e.val.t !== 'str') return '__WRONGTYPE__';
    return e.val.v;
  };

  switch (cmd) {

    // ── String ──────────────────────────────────────────────────────────────
    case 'SET': {
      if (args.length < 2) return err('wrong number of arguments');
      const [key, value, ...opts] = args;
      newDB[key] = { val: { t: 'str', v: value } };
      const exIdx = opts.map(o => o.toUpperCase()).indexOf('EX');
      if (exIdx !== -1 && opts[exIdx + 1]) {
        newDB[key].exAt = now + parseInt(opts[exIdx + 1]) * 1000;
      }
      return ok();
    }
    case 'GET': {
      if (!args[0]) return err('wrong number of arguments');
      const v = getStr(args[0]);
      if (v === null) return nil();
      if (v === '__WRONGTYPE__') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      return str(v);
    }
    case 'DEL': {
      if (!args.length) return err('wrong number of arguments');
      let count = 0;
      for (const k of args) { if (newDB[k]) { delete newDB[k]; count++; } }
      return int(count);
    }
    case 'EXISTS': {
      if (!args[0]) return err('wrong number of arguments');
      return int(newDB[args[0]] ? 1 : 0);
    }
    case 'EXPIRE': {
      if (args.length < 2) return err('wrong number of arguments');
      const [key, secs] = args;
      if (!newDB[key]) return int(0);
      newDB[key].exAt = now + parseInt(secs) * 1000;
      return int(1);
    }
    case 'TTL': {
      if (!args[0]) return err('wrong number of arguments');
      const e = newDB[args[0]];
      if (!e) return int(-2);
      if (!e.exAt) return int(-1);
      return int(Math.max(0, Math.round((e.exAt - now) / 1000)));
    }
    case 'PERSIST': {
      if (!args[0]) return err('wrong number of arguments');
      const e = newDB[args[0]];
      if (!e) return int(0);
      delete e.exAt;
      return int(1);
    }
    case 'INCR': case 'DECR': {
      if (!args[0]) return err('wrong number of arguments');
      const v = getStr(args[0]);
      if (v === '__WRONGTYPE__') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const n = parseInt(v ?? '0');
      if (isNaN(n)) return err('ERR value is not an integer');
      const next = cmd === 'INCR' ? n + 1 : n - 1;
      newDB[args[0]] = { val: { t: 'str', v: String(next) }, exAt: newDB[args[0]]?.exAt };
      return int(next);
    }
    case 'INCRBY': case 'DECRBY': {
      if (args.length < 2) return err('wrong number of arguments');
      const [key, byStr] = args;
      const by = parseInt(byStr);
      if (isNaN(by)) return err('ERR value is not an integer');
      const v = getStr(key);
      if (v === '__WRONGTYPE__') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const n = parseInt(v ?? '0');
      const next = cmd === 'INCRBY' ? n + by : n - by;
      newDB[key] = { val: { t: 'str', v: String(next) }, exAt: newDB[key]?.exAt };
      return int(next);
    }

    // ── Hash ─────────────────────────────────────────────────────────────────
    case 'HSET': {
      if (args.length < 3 || (args.length - 1) % 2 !== 0) return err('wrong number of arguments');
      const [key, ...pairs] = args;
      const e = newDB[key];
      if (e && e.val.t !== 'hash') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const map: Record<string, string> = e?.val.t === 'hash' ? { ...(e.val as RHash).v } : {};
      let added = 0;
      for (let i = 0; i < pairs.length; i += 2) {
        if (!map[pairs[i]]) added++;
        map[pairs[i]] = pairs[i + 1];
      }
      newDB[key] = { val: { t: 'hash', v: map }, exAt: e?.exAt };
      return int(added);
    }
    case 'HGET': {
      if (args.length < 2) return err('wrong number of arguments');
      const [key, field] = args;
      const e = newDB[key];
      if (!e) return nil();
      if (e.val.t !== 'hash') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const v = (e.val as RHash).v[field];
      return v !== undefined ? str(v) : nil();
    }
    case 'HGETALL': {
      if (!args[0]) return err('wrong number of arguments');
      const e = newDB[args[0]];
      if (!e) return arr([]);
      if (e.val.t !== 'hash') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const map = (e.val as RHash).v;
      const lines: Line[] = [];
      Object.entries(map).forEach(([k, v], i) => {
        lines.push({ kind: 'arr', text: `${i * 2 + 1}) "${k}"` });
        lines.push({ kind: 'arr', text: `${i * 2 + 2}) "${v}"` });
      });
      return arr(lines.length ? lines : [{ kind: 'nil', text: '(empty array)' }]);
    }
    case 'HKEYS': {
      if (!args[0]) return err('wrong number of arguments');
      const e = newDB[args[0]];
      if (!e) return arr([]);
      if (e.val.t !== 'hash') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const keys = Object.keys((e.val as RHash).v);
      return arr(keys.map((k, i) => ({ kind: 'arr' as const, text: `${i + 1}) "${k}"` })));
    }
    case 'HVALS': {
      if (!args[0]) return err('wrong number of arguments');
      const e = newDB[args[0]];
      if (!e) return arr([]);
      if (e.val.t !== 'hash') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const vals = Object.values((e.val as RHash).v);
      return arr(vals.map((v, i) => ({ kind: 'arr' as const, text: `${i + 1}) "${v}"` })));
    }
    case 'HDEL': {
      if (args.length < 2) return err('wrong number of arguments');
      const [key, ...fields] = args;
      const e = newDB[key];
      if (!e) return int(0);
      if (e.val.t !== 'hash') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const map = { ...(e.val as RHash).v };
      let count = 0;
      for (const f of fields) { if (map[f] !== undefined) { delete map[f]; count++; } }
      newDB[key] = { val: { t: 'hash', v: map }, exAt: e.exAt };
      return int(count);
    }

    // ── List ─────────────────────────────────────────────────────────────────
    case 'RPUSH': case 'LPUSH': {
      if (args.length < 2) return err('wrong number of arguments');
      const [key, ...vals] = args;
      const e = newDB[key];
      if (e && e.val.t !== 'list') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const list: string[] = e?.val.t === 'list' ? [...(e.val as RList).v] : [];
      if (cmd === 'RPUSH') list.push(...vals);
      else list.unshift(...vals.reverse());
      newDB[key] = { val: { t: 'list', v: list }, exAt: e?.exAt };
      return int(list.length);
    }
    case 'LPOP': case 'RPOP': {
      if (!args[0]) return err('wrong number of arguments');
      const e = newDB[args[0]];
      if (!e) return nil();
      if (e.val.t !== 'list') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const list = [...(e.val as RList).v];
      const val = cmd === 'LPOP' ? list.shift() : list.pop();
      if (list.length === 0) delete newDB[args[0]];
      else newDB[args[0]] = { val: { t: 'list', v: list }, exAt: e.exAt };
      return val !== undefined ? str(val) : nil();
    }
    case 'LRANGE': {
      if (args.length < 3) return err('wrong number of arguments');
      const [key, startStr, stopStr] = args;
      const e = newDB[key];
      if (!e) return arr([{ kind: 'nil', text: '(empty array)' }]);
      if (e.val.t !== 'list') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const list = (e.val as RList).v;
      const len = list.length;
      let start = parseInt(startStr); if (start < 0) start = Math.max(0, len + start);
      let stop  = parseInt(stopStr);  if (stop  < 0) stop  = len + stop; stop = Math.min(stop, len - 1);
      const slice = list.slice(start, stop + 1);
      if (!slice.length) return arr([{ kind: 'nil', text: '(empty array)' }]);
      return arr(slice.map((v, i) => ({ kind: 'arr' as const, text: `${i + 1}) "${v}"` })));
    }
    case 'LLEN': {
      if (!args[0]) return err('wrong number of arguments');
      const e = newDB[args[0]];
      if (!e) return int(0);
      if (e.val.t !== 'list') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      return int((e.val as RList).v.length);
    }

    // ── Set ──────────────────────────────────────────────────────────────────
    case 'SADD': {
      if (args.length < 2) return err('wrong number of arguments');
      const [key, ...members] = args;
      const e = newDB[key];
      if (e && e.val.t !== 'set') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const set = new Set<string>(e?.val.t === 'set' ? (e.val as RSet).v : []);
      let added = 0;
      for (const m of members) { if (!set.has(m)) { set.add(m); added++; } }
      newDB[key] = { val: { t: 'set', v: Array.from(set) }, exAt: e?.exAt };
      return int(added);
    }
    case 'SREM': {
      if (args.length < 2) return err('wrong number of arguments');
      const [key, ...members] = args;
      const e = newDB[key];
      if (!e) return int(0);
      if (e.val.t !== 'set') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const set = new Set<string>((e.val as RSet).v);
      let count = 0;
      for (const m of members) { if (set.delete(m)) count++; }
      newDB[key] = { val: { t: 'set', v: Array.from(set) }, exAt: e.exAt };
      return int(count);
    }
    case 'SMEMBERS': {
      if (!args[0]) return err('wrong number of arguments');
      const e = newDB[args[0]];
      if (!e) return arr([{ kind: 'nil', text: '(empty set)' }]);
      if (e.val.t !== 'set') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const members = (e.val as RSet).v;
      return arr(members.map((m, i) => ({ kind: 'arr' as const, text: `${i + 1}) "${m}"` })));
    }
    case 'SCARD': {
      if (!args[0]) return err('wrong number of arguments');
      const e = newDB[args[0]];
      if (!e) return int(0);
      if (e.val.t !== 'set') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      return int((e.val as RSet).v.length);
    }
    case 'SISMEMBER': {
      if (args.length < 2) return err('wrong number of arguments');
      const [key, member] = args;
      const e = newDB[key];
      if (!e) return int(0);
      if (e.val.t !== 'set') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      return int((e.val as RSet).v.includes(member) ? 1 : 0);
    }
    case 'SINTER': case 'SUNION': case 'SDIFF': {
      if (!args.length) return err('wrong number of arguments');
      const sets = args.map(k => {
        const e = newDB[k];
        if (!e) return new Set<string>();
        if (e.val.t !== 'set') return null;
        return new Set<string>((e.val as RSet).v);
      });
      if (sets.some(s => s === null)) return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      let result: Set<string>;
      if (cmd === 'SINTER') {
        result = sets[0] as Set<string>;
        for (const s of sets.slice(1)) { result = new Set([...result].filter(x => (s as Set<string>).has(x))); }
      } else if (cmd === 'SUNION') {
        result = new Set<string>();
        for (const s of sets) { for (const m of s as Set<string>) result.add(m); }
      } else {
        result = sets[0] as Set<string>;
        for (const s of sets.slice(1)) { result = new Set([...result].filter(x => !(s as Set<string>).has(x))); }
      }
      const arr2 = Array.from(result);
      if (!arr2.length) return arr([{ kind: 'nil', text: '(empty set)' }]);
      return arr(arr2.map((m, i) => ({ kind: 'arr' as const, text: `${i + 1}) "${m}"` })));
    }

    // ── Sorted Set ────────────────────────────────────────────────────────────
    case 'ZADD': {
      if (args.length < 3 || (args.length - 1) % 2 !== 0) return err('wrong number of arguments');
      const [key, ...pairs] = args;
      const e = newDB[key];
      if (e && e.val.t !== 'zset') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const map = new Map<string, number>(e?.val.t === 'zset' ? (e.val as RZSet).v : []);
      let added = 0;
      for (let i = 0; i < pairs.length; i += 2) {
        const score = parseFloat(pairs[i]);
        const member = pairs[i + 1];
        if (!map.has(member)) added++;
        map.set(member, score);
      }
      const sorted: [string, number][] = Array.from(map.entries()).sort((a, b) => a[1] - b[1]);
      newDB[key] = { val: { t: 'zset', v: sorted }, exAt: e?.exAt };
      return int(added);
    }
    case 'ZINCRBY': {
      if (args.length < 3) return err('wrong number of arguments');
      const [key, incrStr, member] = args;
      const e = newDB[key];
      if (e && e.val.t !== 'zset') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const map = new Map<string, number>(e?.val.t === 'zset' ? (e.val as RZSet).v : []);
      const newScore = (map.get(member) ?? 0) + parseFloat(incrStr);
      map.set(member, newScore);
      const sorted: [string, number][] = Array.from(map.entries()).sort((a, b) => a[1] - b[1]);
      newDB[key] = { val: { t: 'zset', v: sorted }, exAt: e?.exAt };
      return { lines: [{ kind: 'str', text: `"${newScore}"` }], db: newDB };
    }
    case 'ZRANGE': case 'ZREVRANGE': {
      if (args.length < 3) return err('wrong number of arguments');
      const [key, startStr, stopStr, ...rest] = args;
      const withScores = rest.map(r => r.toUpperCase()).includes('WITHSCORES');
      const e = newDB[key];
      if (!e) return arr([{ kind: 'nil', text: '(empty array)' }]);
      if (e.val.t !== 'zset') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      let list = [...(e.val as RZSet).v];
      if (cmd === 'ZREVRANGE') list = list.reverse();
      const len = list.length;
      let start = parseInt(startStr); if (start < 0) start = Math.max(0, len + start);
      let stop  = parseInt(stopStr);  if (stop  < 0) stop  = len + stop; stop = Math.min(stop, len - 1);
      const slice = list.slice(start, stop + 1);
      if (!slice.length) return arr([{ kind: 'nil', text: '(empty array)' }]);
      const lines: Line[] = [];
      slice.forEach(([member, score], i) => {
        lines.push({ kind: 'arr', text: `${withScores ? i * 2 + 1 : i + 1}) "${member}"` });
        if (withScores) lines.push({ kind: 'int', text: `${i * 2 + 2}) "${score}"` });
      });
      return arr(lines);
    }
    case 'ZSCORE': {
      if (args.length < 2) return err('wrong number of arguments');
      const [key, member] = args;
      const e = newDB[key];
      if (!e) return nil();
      if (e.val.t !== 'zset') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const entry = (e.val as RZSet).v.find(([m]) => m === member);
      return entry ? str(String(entry[1])) : nil();
    }
    case 'ZRANK': case 'ZREVRANK': {
      if (args.length < 2) return err('wrong number of arguments');
      const [key, member] = args;
      const e = newDB[key];
      if (!e) return nil();
      if (e.val.t !== 'zset') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      const list = cmd === 'ZRANK' ? (e.val as RZSet).v : [...(e.val as RZSet).v].reverse();
      const idx = list.findIndex(([m]) => m === member);
      return idx === -1 ? nil() : int(idx);
    }
    case 'ZCARD': {
      if (!args[0]) return err('wrong number of arguments');
      const e = newDB[args[0]];
      if (!e) return int(0);
      if (e.val.t !== 'zset') return err('WRONGTYPE Operation against a key holding the wrong kind of value');
      return int((e.val as RZSet).v.length);
    }

    // ── General ───────────────────────────────────────────────────────────────
    case 'TYPE': {
      if (!args[0]) return err('wrong number of arguments');
      const e = newDB[args[0]];
      if (!e) return { lines: [{ kind: 'str', text: 'none' }], db: newDB };
      const typeMap: Record<string, string> = { str: 'string', hash: 'hash', list: 'list', set: 'set', zset: 'zset' };
      return { lines: [{ kind: 'str', text: typeMap[e.val.t] }], db: newDB };
    }
    case 'KEYS': {
      const pattern = args[0] ?? '*';
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
      const keys = Object.keys(newDB).filter(k => regex.test(k));
      if (!keys.length) return arr([{ kind: 'nil', text: '(empty array)' }]);
      return arr(keys.map((k, i) => ({ kind: 'arr' as const, text: `${i + 1}) "${k}"` })));
    }
    case 'FLUSHALL':
      return { lines: [{ kind: 'ok', text: 'OK' }], db: {} };

    default:
      return err(`ERR unknown command '${cmd}', try HELP`);
  }
}

// ── Preset scenarios ──────────────────────────────────────────────────────────

interface Preset {
  id: string;
  label: string;
  color: string;
  desc: string;
  commands: string[];
}

const PRESETS: Preset[] = [
  {
    id: 'string',
    label: '🔤 String',
    color: '#00e5a0',
    desc: 'Кеш статьи + счётчик просмотров',
    commands: [
      'SET cache:article:42 "Redis — in-memory хранилище"',
      'GET cache:article:42',
      'EXPIRE cache:article:42 3600',
      'TTL cache:article:42',
      'SET counter:views:42 0',
      'INCR counter:views:42',
      'INCR counter:views:42',
      'INCRBY counter:views:42 98',
      'GET counter:views:42',
    ],
  },
  {
    id: 'hash',
    label: '📋 Hash',
    color: '#4db8ff',
    desc: 'Сессия пользователя',
    commands: [
      'HSET session:a1b2c3 userId 42 name Alice role admin',
      'HGET session:a1b2c3 name',
      'HGETALL session:a1b2c3',
      'HSET session:a1b2c3 lastSeen 1716800000',
      'HKEYS session:a1b2c3',
      'EXPIRE session:a1b2c3 86400',
      'TTL session:a1b2c3',
    ],
  },
  {
    id: 'list',
    label: '📝 List',
    color: '#f0c040',
    desc: 'Очередь email задач',
    commands: [
      'RPUSH jobs:email send_welcome:42',
      'RPUSH jobs:email send_promo:99',
      'RPUSH jobs:email send_reset:7',
      'LLEN jobs:email',
      'LRANGE jobs:email 0 -1',
      'LPOP jobs:email',
      'LRANGE jobs:email 0 -1',
    ],
  },
  {
    id: 'set',
    label: '🔵 Set',
    color: '#9b59e0',
    desc: 'Уникальные посетители',
    commands: [
      'SADD visitors:2024-05-27 user:42 user:99 user:7',
      'SADD visitors:2024-05-27 user:42',
      'SCARD visitors:2024-05-27',
      'SADD visitors:2024-05-26 user:42 user:13',
      'SINTER visitors:2024-05-27 visitors:2024-05-26',
      'SUNION visitors:2024-05-27 visitors:2024-05-26',
    ],
  },
  {
    id: 'zset',
    label: '🏆 Sorted Set',
    color: '#ff9070',
    desc: 'Лидерборд игроков',
    commands: [
      'ZADD leaderboard 1500 alice 2300 bob 1800 carol 2100 dave',
      'ZREVRANGE leaderboard 0 -1 WITHSCORES',
      'ZRANK leaderboard alice',
      'ZINCRBY leaderboard 700 alice',
      'ZSCORE leaderboard alice',
      'ZREVRANK leaderboard alice',
      'ZCARD leaderboard',
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function RedisPlayground() {
  const [db, setDb]       = useState<RDB>({});
  const [lines, setLines] = useState<Line[]>([
    { kind: 'ok', text: '# Redis Playground — симулятор в браузере' },
    { kind: 'ok', text: '# Выбери структуру данных или введи команду' },
    { kind: 'ok', text: '# Поддерживает: String, Hash, List, Set, Sorted Set' },
  ]);
  const [input, setInput]   = useState('');
  const [active, setActive] = useState('');
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [lines]);

  const run = useCallback((cmd: string) => {
    if (!cmd.trim()) return;
    const result = execCmd(db, cmd);
    setDb(result.db);
    setLines(prev => [
      ...prev,
      { kind: 'cmd', text: cmd },
      ...result.lines,
    ]);
  }, [db]);

  const runPreset = (preset: Preset) => {
    setActive(preset.id);
    let newDb = db;
    const newLines: Line[] = [...lines];
    newLines.push({ kind: 'ok', text: `# — ${preset.desc} —` });
    for (const cmd of preset.commands) {
      const result = execCmd(newDb, cmd);
      newDb = result.db;
      newLines.push({ kind: 'cmd', text: cmd });
      newLines.push(...result.lines);
    }
    setDb(newDb);
    setLines(newLines);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input.trim());
      setInput('');
    }
  };

  const lineClass: Record<Line['kind'], string> = {
    cmd: s.lineCmd, ok: s.lineOk, err: s.lineErr,
    int: s.lineInt, str: s.lineStr, nil: s.lineNil, arr: s.lineArr,
  };

  return (
    <div className={s.playground}>
      {/* Presets */}
      <div className={s.presets}>
        <span className={s.presetsLabel}>ПРИМЕР:</span>
        {PRESETS.map(p => (
          <button
            key={p.id}
            className={`${s.preset} ${active === p.id ? s.presetActive : ''}`}
            style={{ '--pc': p.color } as React.CSSProperties}
            onClick={() => runPreset(p)}
            title={p.desc}
          >
            {p.label}
          </button>
        ))}
        <button className={s.clearBtn} onClick={() => {
          setDb({}); setLines([]); setActive('');
        }}>
          CLEAR
        </button>
      </div>

      {/* Terminal output */}
      <div className={s.terminal} ref={termRef}>
        <div className={s.welcome}>
          127.0.0.1:6379&gt; # Ready
        </div>
        {lines.map((l, i) => (
          <div key={i} className={s.line}>
            {l.kind === 'cmd' && <span className={s.prompt}>127.0.0.1:6379&gt;</span>}
            <span className={lineClass[l.kind] ?? s.lineOk}>{l.text}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className={s.inputRow}>
        <span className={s.inputPrompt}>127.0.0.1:6379&gt;</span>
        <input
          className={s.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="GET cache:article:42"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />
      </div>

      {/* Hint */}
      <div className={s.hint}>
        <span><span className={s.hintKey}>String:</span> SET GET INCR INCRBY EXPIRE TTL</span>
        <span><span className={s.hintKey}>Hash:</span> HSET HGET HGETALL HKEYS</span>
        <span><span className={s.hintKey}>List:</span> RPUSH LPOP LRANGE LLEN</span>
        <span><span className={s.hintKey}>Set:</span> SADD SMEMBERS SCARD SINTER</span>
        <span><span className={s.hintKey}>ZSet:</span> ZADD ZREVRANGE ZINCRBY ZRANK</span>
      </div>
    </div>
  );
}
