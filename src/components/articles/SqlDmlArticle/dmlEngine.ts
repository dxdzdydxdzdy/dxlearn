// Mini DML evaluator — INSERT / UPDATE / DELETE / TRUNCATE

import { DB, type Schema, type Row } from '../SqlQueriesArticle/sqlEngine';

// ── Deep clone ────────────────────────────────────────────────────────────────

export function freshDB(): Schema {
  return JSON.parse(JSON.stringify(DB));
}

export { DB };
export type { Schema, Row };

// ── Result types ──────────────────────────────────────────────────────────────

export interface DMLResult {
  type: 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE';
  table: string;
  affected: number;
  affectedIds: Set<number>;
  returning?: { columns: string[]; rows: unknown[][] };
  message: string;
  newDB: Schema;
}

export interface DMLError {
  error: string;
  newDB: Schema;
}

// ── Tokenizer ─────────────────────────────────────────────────────────────────

type TT = 'KW' | 'ID' | 'NUM' | 'STR' | 'OP' | 'COMMA' | 'LP' | 'RP' | 'STAR' | 'DOT' | 'EOF';
interface Tok { t: TT; v: string }

const DML_KWS = new Set([
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'FROM', 'TRUNCATE', 'TABLE',
  'WHERE', 'RETURNING', 'ON', 'CONFLICT', 'DO', 'NOTHING', 'EXCLUDED',
  'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'TRUE', 'FALSE',
]);

function lex(sql: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < sql.length) {
    if (/\s/.test(sql[i])) { i++; continue; }
    if (sql[i] === '-' && sql[i + 1] === '-') { while (i < sql.length && sql[i] !== '\n') i++; continue; }
    if (sql[i] === "'") {
      i++;
      let s = '';
      while (i < sql.length && sql[i] !== "'") { s += sql[i++]; }
      i++;
      toks.push({ t: 'STR', v: s });
      continue;
    }
    if (/\d/.test(sql[i])) {
      let n = '';
      while (i < sql.length && /[\d.]/.test(sql[i])) n += sql[i++];
      toks.push({ t: 'NUM', v: n });
      continue;
    }
    const two = sql.slice(i, i + 2);
    if (['<>', '<=', '>=', '!='].includes(two)) { toks.push({ t: 'OP', v: two }); i += 2; continue; }
    if ('=<>'.includes(sql[i])) { toks.push({ t: 'OP', v: sql[i++] }); continue; }
    if (['+', '/', '%'].includes(sql[i])) { toks.push({ t: 'OP', v: sql[i++] }); continue; }
    if (sql[i] === '-') { toks.push({ t: 'OP', v: '-' }); i++; continue; }
    if (sql[i] === ',') { toks.push({ t: 'COMMA', v: ',' }); i++; continue; }
    if (sql[i] === '(') { toks.push({ t: 'LP', v: '(' }); i++; continue; }
    if (sql[i] === ')') { toks.push({ t: 'RP', v: ')' }); i++; continue; }
    if (sql[i] === '*') { toks.push({ t: 'STAR', v: '*' }); i++; continue; }
    if (sql[i] === '.') { toks.push({ t: 'DOT', v: '.' }); i++; continue; }
    if (sql[i] === ';') { i++; continue; }
    if (/[a-zA-Z_]/.test(sql[i])) {
      let w = '';
      while (i < sql.length && /\w/.test(sql[i])) w += sql[i++];
      const up = w.toUpperCase();
      toks.push(DML_KWS.has(up) ? { t: 'KW', v: up } : { t: 'ID', v: w.toLowerCase() });
      continue;
    }
    i++;
  }
  toks.push({ t: 'EOF', v: '' });
  return toks;
}

// ── AST ───────────────────────────────────────────────────────────────────────

type Expr =
  | { k: 'col'; tbl?: string; col: string }
  | { k: 'lit'; val: unknown }
  | { k: 'bin'; op: string; l: Expr; r: Expr }
  | { k: 'unary'; op: string; e: Expr }
  | { k: 'isnull'; e: Expr; neg: boolean }
  | { k: 'in'; e: Expr; vals: Expr[]; neg: boolean }
  | { k: 'not'; e: Expr };

// ── Parser ────────────────────────────────────────────────────────────────────

class P {
  private i = 0;
  constructor(private t: Tok[]) {}

  pk(off = 0): Tok { return this.t[Math.min(this.i + off, this.t.length - 1)]; }
  nx(): Tok { return this.t[this.i++]; }
  eat(tt?: TT, v?: string): Tok {
    const tok = this.nx();
    if (tt && tok.t !== tt) throw new Error(`Expected ${tt}, got '${tok.v}'`);
    if (v && tok.v.toUpperCase() !== v.toUpperCase()) throw new Error(`Expected '${v}', got '${tok.v}'`);
    return tok;
  }
  is(tt: TT, v?: string, off = 0): boolean {
    const tok = this.pk(off);
    return tok.t === tt && (v === undefined || tok.v.toUpperCase() === v.toUpperCase());
  }
  try(tt: TT, v?: string): boolean {
    if (this.is(tt, v)) { this.nx(); return true; }
    return false;
  }

  parseName(): string {
    const tok = this.nx();
    if (tok.t === 'ID' || tok.t === 'KW') return tok.v.toLowerCase();
    throw new Error(`Expected name, got '${tok.v}'`);
  }

  parseReturning(): string[] | '*' {
    if (this.is('STAR')) { this.nx(); return '*'; }
    const cols: string[] = [];
    do { cols.push(this.parseName()); } while (this.try('COMMA'));
    return cols;
  }

  parseExpr(): Expr { return this.parseOr(); }

  parseOr(): Expr {
    let l = this.parseAnd();
    while (this.try('KW', 'OR')) l = { k: 'bin', op: 'OR', l, r: this.parseAnd() };
    return l;
  }

  parseAnd(): Expr {
    let l = this.parseNot();
    while (this.try('KW', 'AND')) l = { k: 'bin', op: 'AND', l, r: this.parseNot() };
    return l;
  }

  parseNot(): Expr {
    if (this.try('KW', 'NOT')) return { k: 'not', e: this.parseNot() };
    return this.parseCmp();
  }

  parseCmp(): Expr {
    const l = this.parseAdd();
    if (this.is('KW', 'IS')) {
      this.nx();
      const neg = this.try('KW', 'NOT');
      this.eat('KW', 'NULL');
      return { k: 'isnull', e: l, neg };
    }
    // NOT IN lookahead
    const negIn = this.pk().v === 'NOT' && this.pk(1).v === 'IN';
    if (negIn) this.nx(); // consume NOT
    if (this.is('KW', 'IN')) {
      this.nx();
      this.eat('LP');
      const vals: Expr[] = [];
      do { vals.push(this.parseAdd()); } while (this.try('COMMA'));
      this.eat('RP');
      return { k: 'in', e: l, vals, neg: negIn };
    }
    if (negIn) throw new Error('Expected IN after NOT');
    if (this.is('OP')) {
      const op = this.nx().v;
      return { k: 'bin', op, l, r: this.parseAdd() };
    }
    return l;
  }

  parseAdd(): Expr {
    let l = this.parseMul();
    while (this.is('OP') && ['+', '-'].includes(this.pk().v)) {
      const op = this.nx().v;
      l = { k: 'bin', op, l, r: this.parseMul() };
    }
    return l;
  }

  parseMul(): Expr {
    let l = this.parseUnary();
    while ((this.is('OP') && ['/', '%'].includes(this.pk().v)) || this.is('STAR')) {
      const op = this.nx().v;
      l = { k: 'bin', op, l, r: this.parseUnary() };
    }
    return l;
  }

  parseUnary(): Expr {
    if (this.is('OP', '-')) { this.nx(); return { k: 'unary', op: '-', e: this.parsePrimary() }; }
    return this.parsePrimary();
  }

  parsePrimary(): Expr {
    if (this.is('NUM')) return { k: 'lit', val: parseFloat(this.nx().v) };
    if (this.is('STR')) return { k: 'lit', val: this.nx().v };
    if (this.is('KW', 'NULL'))  { this.nx(); return { k: 'lit', val: null }; }
    if (this.is('KW', 'TRUE'))  { this.nx(); return { k: 'lit', val: true }; }
    if (this.is('KW', 'FALSE')) { this.nx(); return { k: 'lit', val: false }; }
    if (this.is('LP')) {
      this.nx();
      const e = this.parseExpr();
      this.eat('RP');
      return e;
    }
    if (this.is('ID') || this.is('KW', 'EXCLUDED')) {
      const first = this.nx().v.toLowerCase();
      if (this.try('DOT')) {
        const col = this.nx().v.toLowerCase();
        return { k: 'col', tbl: first, col };
      }
      return { k: 'col', col: first };
    }
    throw new Error(`Unexpected token: '${this.pk().v}'`);
  }
}

// ── Evaluator ─────────────────────────────────────────────────────────────────

function evalExpr(expr: Expr, row: Row, excluded?: Row): unknown {
  switch (expr.k) {
    case 'lit': return expr.val;
    case 'col': {
      if (expr.tbl === 'excluded' && excluded) return excluded[expr.col] ?? null;
      return row[expr.col] ?? null;
    }
    case 'unary': {
      const v = evalExpr(expr.e, row, excluded);
      if (expr.op === '-') return -(v as number);
      return null;
    }
    case 'not':   return !evalExpr(expr.e, row, excluded);
    case 'isnull': {
      const v = evalExpr(expr.e, row, excluded);
      return expr.neg ? v != null : v == null;
    }
    case 'in': {
      const v = evalExpr(expr.e, row, excluded);
      const match = expr.vals.some(x => evalExpr(x, row, excluded) === v);
      return expr.neg ? !match : match;
    }
    case 'bin': {
      const l = evalExpr(expr.l, row, excluded);
      const r = evalExpr(expr.r, row, excluded);
      switch (expr.op) {
        case '+':  return (l as number) + (r as number);
        case '-':  return (l as number) - (r as number);
        case '*':  return (l as number) * (r as number);
        case '/':  return (r as number) !== 0 ? (l as number) / (r as number) : null;
        case '%':  return (l as number) % (r as number);
        case '=':  return l === r;
        case '!=': case '<>': return l !== r;
        case '<':  return (l as number) < (r as number);
        case '>':  return (l as number) > (r as number);
        case '<=': return (l as number) <= (r as number);
        case '>=': return (l as number) >= (r as number);
        case 'AND': return Boolean(l) && Boolean(r);
        case 'OR':  return Boolean(l) || Boolean(r);
        default: return null;
      }
    }
  }
}

function matchesWhere(where: Expr | undefined, row: Row): boolean {
  if (!where) return true;
  return Boolean(evalExpr(where, row));
}

function buildReturning(
  rows: Row[],
  cols: string[] | '*',
  tableCols: string[],
): { columns: string[]; rows: unknown[][] } {
  const retCols = cols === '*' ? tableCols : cols;
  return { columns: retCols, rows: rows.map(r => retCols.map(c => r[c] ?? null)) };
}

function tableCols(db: Schema, table: string): string[] {
  return db[table]?.length ? Object.keys(db[table][0]) : [];
}

// ── Operations ────────────────────────────────────────────────────────────────

function execInsert(p: P, newDB: Schema): { table: string; affected: number; affectedIds: Set<number>; returning?: DMLResult['returning'] } {
  p.eat('KW', 'INSERT');
  p.eat('KW', 'INTO');
  const table = p.parseName();
  if (!newDB[table]) throw new Error(`Table '${table}' does not exist`);

  // Optional column list
  let cols: string[] | null = null;
  if (p.is('LP')) {
    p.nx(); cols = [];
    do { cols.push(p.parseName()); } while (p.try('COMMA'));
    p.eat('RP');
  }

  p.eat('KW', 'VALUES');

  const allVals: unknown[][] = [];
  do {
    p.eat('LP');
    const vals: unknown[] = [];
    do { vals.push(evalExpr(p.parseExpr(), {} as Row)); } while (p.try('COMMA'));
    p.eat('RP');
    allVals.push(vals);
  } while (p.try('COMMA'));

  const tCols = tableCols(newDB, table);
  const nonIdCols = tCols.filter(c => c !== 'id');
  const insertCols = cols ?? nonIdCols;

  // ON CONFLICT
  type OnConflict = 'NOTHING' | { sets: { col: string; expr: Expr }[] };
  let onConflict: OnConflict | null = null;
  let conflictTarget: string[] = [];
  if (p.is('KW', 'ON')) {
    p.nx(); p.eat('KW', 'CONFLICT');
    if (p.is('LP')) {
      p.nx();
      do { conflictTarget.push(p.parseName()); } while (p.try('COMMA'));
      p.eat('RP');
    }
    p.eat('KW', 'DO');
    if (p.try('KW', 'NOTHING')) {
      onConflict = 'NOTHING';
    } else {
      p.eat('KW', 'UPDATE'); p.eat('KW', 'SET');
      const sets: { col: string; expr: Expr }[] = [];
      do {
        const col = p.parseName(); p.eat('OP', '=');
        sets.push({ col, expr: p.parseExpr() });
      } while (p.try('COMMA'));
      onConflict = { sets };
    }
  }

  let retCols: string[] | '*' | null = null;
  if (p.try('KW', 'RETURNING')) retCols = p.parseReturning();

  const inserted: Row[] = [];
  const affectedIds = new Set<number>();

  for (const vals of allVals) {
    const newRow: Row = {};
    if (!insertCols.includes('id')) {
      const maxId = newDB[table].reduce((m: number, r: Row) => Math.max(m, (r['id'] as number) || 0), 0);
      newRow['id'] = maxId + 1;
    }
    for (let i = 0; i < insertCols.length; i++) {
      newRow[insertCols[i]] = vals[i] ?? null;
    }

    const target = conflictTarget.length > 0 ? conflictTarget
      : insertCols.includes('id') ? ['id'] : [];
    let conflictIdx = -1;
    if (target.length > 0 && onConflict) {
      conflictIdx = newDB[table].findIndex((r: Row) =>
        target.every(c => r[c] !== undefined && r[c] === newRow[c])
      );
    }

    if (conflictIdx >= 0 && onConflict) {
      if (onConflict !== 'NOTHING') {
        const existing = newDB[table][conflictIdx];
        for (const { col, expr } of (onConflict as { sets: { col: string; expr: Expr }[] }).sets) {
          existing[col] = evalExpr(expr, existing, newRow);
        }
        inserted.push(existing);
        affectedIds.add(existing['id'] as number);
      }
    } else {
      newDB[table].push(newRow);
      inserted.push(newRow);
      affectedIds.add(newRow['id'] as number);
    }
  }

  const tc = tableCols(newDB, table);
  const returning = retCols ? buildReturning(inserted, retCols, tc) : undefined;
  return { table, affected: inserted.length, affectedIds, returning };
}

function execUpdate(p: P, newDB: Schema): { table: string; affected: number; affectedIds: Set<number>; returning?: DMLResult['returning'] } {
  p.eat('KW', 'UPDATE');
  const table = p.parseName();
  if (!newDB[table]) throw new Error(`Table '${table}' does not exist`);

  p.eat('KW', 'SET');
  const sets: { col: string; expr: Expr }[] = [];
  do {
    const col = p.parseName(); p.eat('OP', '=');
    sets.push({ col, expr: p.parseExpr() });
  } while (p.try('COMMA'));

  let where: Expr | undefined;
  if (p.try('KW', 'WHERE')) where = p.parseExpr();

  let retCols: string[] | '*' | null = null;
  if (p.try('KW', 'RETURNING')) retCols = p.parseReturning();

  const updated: Row[] = [];
  const affectedIds = new Set<number>();
  for (const row of newDB[table]) {
    if (matchesWhere(where, row)) {
      for (const { col, expr } of sets) row[col] = evalExpr(expr, row);
      updated.push(row);
      affectedIds.add(row['id'] as number);
    }
  }

  const tc = tableCols(newDB, table);
  const returning = retCols ? buildReturning(updated, retCols, tc) : undefined;
  return { table, affected: updated.length, affectedIds, returning };
}

function execDelete(p: P, newDB: Schema): { table: string; affected: number; affectedIds: Set<number>; returning?: DMLResult['returning'] } {
  p.eat('KW', 'DELETE');
  p.eat('KW', 'FROM');
  const table = p.parseName();
  if (!newDB[table]) throw new Error(`Table '${table}' does not exist`);

  let where: Expr | undefined;
  if (p.try('KW', 'WHERE')) where = p.parseExpr();

  let retCols: string[] | '*' | null = null;
  if (p.try('KW', 'RETURNING')) retCols = p.parseReturning();

  const deleted: Row[] = [];
  const kept: Row[] = [];
  const affectedIds = new Set<number>();
  for (const row of newDB[table]) {
    if (matchesWhere(where, row)) {
      deleted.push({ ...row });
      affectedIds.add(row['id'] as number);
    } else {
      kept.push(row);
    }
  }
  newDB[table] = kept;

  const tc = deleted.length > 0 ? Object.keys(deleted[0]) : tableCols(newDB, table);
  const returning = retCols ? buildReturning(deleted, retCols, tc) : undefined;
  return { table, affected: deleted.length, affectedIds, returning };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function runDML(sql: string, db: Schema): DMLResult | DMLError {
  const newDB: Schema = JSON.parse(JSON.stringify(db));

  try {
    const toks = lex(sql.trim());
    const p = new P(toks);
    const cmd = p.pk().v.toUpperCase();

    if (cmd === 'INSERT') {
      const { table, affected, affectedIds, returning } = execInsert(p, newDB);
      return { type: 'INSERT', table, affected, affectedIds, returning, message: `INSERT ${affected}`, newDB };
    }
    if (cmd === 'UPDATE') {
      const { table, affected, affectedIds, returning } = execUpdate(p, newDB);
      return { type: 'UPDATE', table, affected, affectedIds, returning, message: `UPDATE ${affected}`, newDB };
    }
    if (cmd === 'DELETE') {
      const { table, affected, affectedIds, returning } = execDelete(p, newDB);
      return { type: 'DELETE', table, affected, affectedIds, returning, message: `DELETE ${affected}`, newDB };
    }
    if (cmd === 'TRUNCATE') {
      p.eat('KW', 'TRUNCATE');
      p.try('KW', 'TABLE');
      const table = p.parseName();
      if (!newDB[table]) throw new Error(`Table '${table}' does not exist`);
      const affected = newDB[table].length;
      newDB[table] = [];
      return { type: 'TRUNCATE', table, affected, affectedIds: new Set(), message: `TRUNCATE TABLE`, newDB };
    }
    return { error: `Поддерживаются INSERT, UPDATE, DELETE, TRUNCATE. Получено: '${cmd}'`, newDB: db };
  } catch (e) {
    return { error: (e as Error).message, newDB: db };
  }
}
