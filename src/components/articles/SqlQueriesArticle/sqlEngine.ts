// Mini SQL evaluator — SELECT / FROM / JOIN / WHERE / GROUP BY / HAVING / ORDER BY / LIMIT

export type Row = Record<string, unknown>;
export type Schema = Record<string, Row[]>;

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  error?: string;
}

// ── Built-in dataset ──────────────────────────────────────────────────────────

export const DB: Schema = {
  users: [
    { id: 1, name: 'Alice',  dept_id: 1,    salary: 120000, age: 28, city: 'Москва' },
    { id: 2, name: 'Bob',    dept_id: 2,    salary: 90000,  age: 34, city: 'СПб'    },
    { id: 3, name: 'Carol',  dept_id: 1,    salary: 150000, age: 25, city: 'Москва' },
    { id: 4, name: 'Dave',   dept_id: 3,    salary: 80000,  age: 42, city: 'Казань' },
    { id: 5, name: 'Eve',    dept_id: 2,    salary: 110000, age: 31, city: 'Москва' },
    { id: 6, name: 'Frank',  dept_id: 1,    salary: 95000,  age: 29, city: 'СПб'    },
    { id: 7, name: 'Grace',  dept_id: 3,    salary: 130000, age: 38, city: 'Казань' },
    { id: 8, name: 'Henry',  dept_id: null, salary: 70000,  age: 22, city: 'Москва' },
  ],
  orders: [
    { id: 1, user_id: 1, product: 'Laptop',     amount: 85000, status: 'done'      },
    { id: 2, user_id: 1, product: 'Mouse',       amount: 2500,  status: 'done'      },
    { id: 3, user_id: 2, product: 'Monitor',     amount: 35000, status: 'pending'   },
    { id: 4, user_id: 3, product: 'Keyboard',    amount: 8000,  status: 'done'      },
    { id: 5, user_id: 3, product: 'Laptop',      amount: 90000, status: 'done'      },
    { id: 6, user_id: 5, product: 'Headphones',  amount: 15000, status: 'cancelled' },
    { id: 7, user_id: 6, product: 'Mouse',       amount: 3000,  status: 'done'      },
    { id: 8, user_id: 7, product: 'Monitor',     amount: 40000, status: 'pending'   },
  ],
  departments: [
    { id: 1, title: 'Разработка', budget: 5000000 },
    { id: 2, title: 'Маркетинг',  budget: 2000000 },
    { id: 3, title: 'Аналитика',  budget: 3000000 },
  ],
};

export const DB_COLUMNS: Record<string, Array<{ name: string; type: string }>> = {
  users:       [{ name: 'id', type: 'int' }, { name: 'name', type: 'text' }, { name: 'dept_id', type: 'int?' }, { name: 'salary', type: 'int' }, { name: 'age', type: 'int' }, { name: 'city', type: 'text' }],
  orders:      [{ name: 'id', type: 'int' }, { name: 'user_id', type: 'int' }, { name: 'product', type: 'text' }, { name: 'amount', type: 'int' }, { name: 'status', type: 'text' }],
  departments: [{ name: 'id', type: 'int' }, { name: 'title', type: 'text' }, { name: 'budget', type: 'int' }],
};

// ── Lexer ─────────────────────────────────────────────────────────────────────

type TT = 'KW' | 'ID' | 'NUM' | 'STR' | 'OP' | 'COMMA' | 'LP' | 'RP' | 'STAR' | 'DOT' | 'EOF';
interface Tok { t: TT; v: string }

const KWS = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS',
  'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'AS', 'DISTINCT',
  'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'BETWEEN', 'TRUE', 'FALSE',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'UPPER', 'LOWER', 'LENGTH',
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
      toks.push(KWS.has(up) ? { t: 'KW', v: up } : { t: 'ID', v: w });
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
  | { k: 'star'; tbl?: string }
  | { k: 'bin'; op: string; l: Expr; r: Expr }
  | { k: 'not'; e: Expr }
  | { k: 'call'; fn: string; args: Expr[]; dist?: boolean }
  | { k: 'isnull'; e: Expr; neg: boolean }
  | { k: 'in'; e: Expr; vals: Expr[]; neg: boolean }
  | { k: 'like'; e: Expr; pat: string; neg: boolean }
  | { k: 'between'; e: Expr; lo: Expr; hi: Expr; neg: boolean };

interface SelItem { e: Expr; alias?: string }
interface JoinDef { type: 'INNER' | 'LEFT' | 'RIGHT' | 'CROSS'; table: string; alias?: string; on?: Expr }
interface OrdItem { e: Expr; dir: 'ASC' | 'DESC' }

interface ParsedQ {
  distinct: boolean;
  sel: SelItem[];
  from: string;
  fromAlias?: string;
  joins: JoinDef[];
  where?: Expr;
  groupBy: Expr[];
  having?: Expr;
  orderBy: OrdItem[];
  limit?: number;
}

// ── Parser ────────────────────────────────────────────────────────────────────

const CLAUSE_KWS = new Set(['WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', 'GROUP', 'HAVING', 'ORDER', 'LIMIT', 'ON']);

class P {
  private i = 0;
  constructor(private t: Tok[]) {}

  pk(off = 0): Tok { return this.t[Math.min(this.i + off, this.t.length - 1)]; }
  nx(): Tok { return this.t[this.i++]; }
  eat(t?: TT, v?: string): Tok {
    const tok = this.nx();
    if (t && tok.t !== t) throw new Error(`Expected ${t}, got '${tok.v}'`);
    if (v && tok.v.toUpperCase() !== v.toUpperCase()) throw new Error(`Expected '${v}', got '${tok.v}'`);
    return tok;
  }
  is(t: TT, v?: string, off = 0): boolean {
    const tok = this.pk(off);
    return tok.t === t && (v === undefined || tok.v.toUpperCase() === v.toUpperCase());
  }
  try(t: TT, v?: string): boolean {
    if (this.is(t, v)) { this.nx(); return true; }
    return false;
  }

  // Is the current token a non-clause identifier (safe to use as alias)?
  isAliasTok(): boolean {
    const tok = this.pk();
    if (tok.t === 'EOF' || tok.t === 'COMMA') return false;
    if (tok.t === 'ID') return true;
    if (tok.t === 'KW') return !CLAUSE_KWS.has(tok.v) && !['FROM', 'SELECT', 'AS'].includes(tok.v);
    return false;
  }

  parseQ(): ParsedQ {
    this.eat('KW', 'SELECT');
    const distinct = this.try('KW', 'DISTINCT');

    const sel: SelItem[] = [];
    do { sel.push(this.parseSelItem()); } while (this.try('COMMA'));

    this.eat('KW', 'FROM');
    const fromTok = this.nx();
    const from = fromTok.v.toLowerCase();
    let fromAlias: string | undefined;
    if (this.try('KW', 'AS')) { fromAlias = this.nx().v.toLowerCase(); }
    else if (this.isAliasTok()) { fromAlias = this.nx().v.toLowerCase(); }

    const joins: JoinDef[] = [];
    while (this.is('KW', 'JOIN') || this.is('KW', 'INNER') || this.is('KW', 'LEFT') || this.is('KW', 'RIGHT') || this.is('KW', 'CROSS') || this.is('KW', 'FULL')) {
      let type: JoinDef['type'] = 'INNER';
      if (this.try('KW', 'LEFT')) { this.try('KW', 'OUTER'); type = 'LEFT'; }
      else if (this.try('KW', 'RIGHT')) { this.try('KW', 'OUTER'); type = 'RIGHT'; }
      else if (this.try('KW', 'FULL')) { this.try('KW', 'OUTER'); type = 'INNER'; }
      else if (this.try('KW', 'CROSS')) { type = 'CROSS'; }
      else if (this.try('KW', 'INNER')) {}
      this.eat('KW', 'JOIN');
      const jtable = this.nx().v.toLowerCase();
      let jalias: string | undefined;
      if (this.try('KW', 'AS')) { jalias = this.nx().v.toLowerCase(); }
      else if (this.isAliasTok()) { jalias = this.nx().v.toLowerCase(); }
      let on: Expr | undefined;
      if (this.try('KW', 'ON')) on = this.parseOr();
      joins.push({ type, table: jtable, alias: jalias, on });
    }

    let where: Expr | undefined;
    if (this.try('KW', 'WHERE')) where = this.parseOr();

    const groupBy: Expr[] = [];
    if (this.is('KW', 'GROUP')) {
      this.nx(); this.eat('KW', 'BY');
      do { groupBy.push(this.parsePrimary()); } while (this.try('COMMA'));
    }

    let having: Expr | undefined;
    if (this.try('KW', 'HAVING')) having = this.parseOr();

    const orderBy: OrdItem[] = [];
    if (this.is('KW', 'ORDER')) {
      this.nx(); this.eat('KW', 'BY');
      do {
        const e = this.parsePrimary();
        const dir = this.try('KW', 'DESC') ? 'DESC' : (this.try('KW', 'ASC'), 'ASC');
        orderBy.push({ e, dir });
      } while (this.try('COMMA'));
    }

    let limit: number | undefined;
    if (this.try('KW', 'LIMIT')) limit = parseInt(this.eat('NUM').v);

    return { distinct, sel, from, fromAlias, joins, where, groupBy, having, orderBy, limit };
  }

  parseSelItem(): SelItem {
    const e = this.parseOr();
    let alias: string | undefined;
    if (this.try('KW', 'AS')) { alias = this.nx().v; }
    else if (this.is('ID')) { alias = this.nx().v; }
    return { e, alias };
  }

  parseOr(): Expr {
    let l = this.parseAnd();
    while (this.try('KW', 'OR')) { l = { k: 'bin', op: 'OR', l, r: this.parseAnd() }; }
    return l;
  }

  parseAnd(): Expr {
    let l = this.parseNot();
    while (this.try('KW', 'AND')) { l = { k: 'bin', op: 'AND', l, r: this.parseNot() }; }
    return l;
  }

  parseNot(): Expr {
    if (this.try('KW', 'NOT')) return { k: 'not', e: this.parseNot() };
    return this.parseCmp();
  }

  parseCmp(): Expr {
    const l = this.parsePrimary();

    if (this.is('KW', 'IS')) {
      this.nx();
      const neg = this.try('KW', 'NOT');
      this.eat('KW', 'NULL');
      return { k: 'isnull', e: l, neg };
    }
    if (this.is('KW', 'BETWEEN') || (this.is('KW', 'NOT') && this.is('KW', 'BETWEEN', 1))) {
      const neg = this.try('KW', 'NOT');
      this.eat('KW', 'BETWEEN');
      const lo = this.parsePrimary();
      this.eat('KW', 'AND');
      const hi = this.parsePrimary();
      return { k: 'between', e: l, lo, hi, neg };
    }
    if (this.is('KW', 'LIKE') || (this.is('KW', 'NOT') && this.is('KW', 'LIKE', 1))) {
      const neg = this.try('KW', 'NOT');
      this.eat('KW', 'LIKE');
      const pat = this.nx().v;
      return { k: 'like', e: l, pat, neg };
    }
    if (this.is('KW', 'IN') || (this.is('KW', 'NOT') && this.is('KW', 'IN', 1))) {
      const neg = this.try('KW', 'NOT');
      this.eat('KW', 'IN');
      this.eat('LP');
      const vals: Expr[] = [];
      do { vals.push(this.parsePrimary()); } while (this.try('COMMA'));
      this.eat('RP');
      return { k: 'in', e: l, vals, neg };
    }
    if (this.is('OP')) {
      const op = this.nx().v;
      return { k: 'bin', op, l, r: this.parsePrimary() };
    }
    return l;
  }

  parsePrimary(): Expr {
    const tok = this.pk();
    if (tok.t === 'KW' && tok.v === 'NULL') { this.nx(); return { k: 'lit', val: null }; }
    if (tok.t === 'KW' && tok.v === 'TRUE') { this.nx(); return { k: 'lit', val: true }; }
    if (tok.t === 'KW' && tok.v === 'FALSE') { this.nx(); return { k: 'lit', val: false }; }
    if (tok.t === 'STR') { this.nx(); return { k: 'lit', val: tok.v }; }
    if (tok.t === 'NUM') { this.nx(); return { k: 'lit', val: tok.v.includes('.') ? parseFloat(tok.v) : parseInt(tok.v) }; }
    if (tok.t === 'STAR') { this.nx(); return { k: 'star' }; }
    if (tok.t === 'LP') {
      this.nx();
      const e = this.parseOr();
      this.eat('RP');
      return e;
    }
    if (tok.t === 'ID' || tok.t === 'KW') {
      this.nx();
      const name = tok.v;
      if (this.is('LP')) {
        this.nx();
        const fn = name.toUpperCase();
        const dist = this.try('KW', 'DISTINCT');
        if (this.is('STAR')) { this.nx(); this.eat('RP'); return { k: 'call', fn, args: [{ k: 'star' }], dist }; }
        if (this.is('RP')) { this.nx(); return { k: 'call', fn, args: [], dist }; }
        const args: Expr[] = [];
        do { args.push(this.parseOr()); } while (this.try('COMMA'));
        this.eat('RP');
        return { k: 'call', fn, args, dist };
      }
      if (this.is('DOT')) {
        this.nx();
        if (this.is('STAR')) { this.nx(); return { k: 'star', tbl: name.toLowerCase() }; }
        const col = this.nx().v;
        return { k: 'col', tbl: name.toLowerCase(), col: col.toLowerCase() };
      }
      return { k: 'col', col: name.toLowerCase() };
    }
    throw new Error(`Неожиданный токен: '${tok.v}'`);
  }
}

// ── Evaluator ─────────────────────────────────────────────────────────────────

function getCol(row: Row, col: string, tbl?: string): unknown {
  if (tbl) {
    const key = `${tbl}.${col}`;
    if (key in row) return row[key];
  }
  if (col in row) return row[col];
  for (const k of Object.keys(row)) {
    if (k === col || k.endsWith(`.${col}`)) return row[k];
  }
  return undefined;
}

function evalE(e: Expr, row: Row): unknown {
  switch (e.k) {
    case 'lit': return e.val;
    case 'star': return null;
    case 'col': return getCol(row, e.col, e.tbl);
    case 'not': return !toBool(evalE(e.e, row));
    case 'isnull': {
      const v = evalE(e.e, row);
      const isNull = v === null || v === undefined;
      return e.neg ? !isNull : isNull;
    }
    case 'in': {
      const v = evalE(e.e, row);
      const found = e.vals.some(ve => evalE(ve, row) == v);
      return e.neg ? !found : found;
    }
    case 'like': {
      const v = String(evalE(e.e, row) ?? '');
      const re = new RegExp('^' + e.pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
      return e.neg ? !re.test(v) : re.test(v);
    }
    case 'between': {
      const v = evalE(e.e, row) as number;
      const lo = evalE(e.lo, row) as number;
      const hi = evalE(e.hi, row) as number;
      const inRange = v >= lo && v <= hi;
      return e.neg ? !inRange : inRange;
    }
    case 'bin': {
      if (e.op === 'AND') return toBool(evalE(e.l, row)) && toBool(evalE(e.r, row));
      if (e.op === 'OR') return toBool(evalE(e.l, row)) || toBool(evalE(e.r, row));
      const lv = evalE(e.l, row);
      const rv = evalE(e.r, row);
      if (lv === null || lv === undefined || rv === null || rv === undefined) return false;
      // eslint-disable-next-line eqeqeq
      switch (e.op) {
        case '=': return lv == rv;
        case '!=': case '<>': return lv != rv;
        case '<': return Number(lv) < Number(rv);
        case '>': return Number(lv) > Number(rv);
        case '<=': return Number(lv) <= Number(rv);
        case '>=': return Number(lv) >= Number(rv);
      }
      return false;
    }
    case 'call': {
      const fn = e.fn.toUpperCase();
      if (fn === 'UPPER') return String(evalE(e.args[0], row) ?? '').toUpperCase();
      if (fn === 'LOWER') return String(evalE(e.args[0], row) ?? '').toLowerCase();
      if (fn === 'LENGTH') return String(evalE(e.args[0], row) ?? '').length;
      if (fn === 'COALESCE') {
        for (const arg of e.args) { const v = evalE(arg, row); if (v !== null && v !== undefined) return v; }
        return null;
      }
      return null; // aggregates handled separately
    }
  }
}

function toBool(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  return Boolean(v);
}

const AGG_FNS = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']);

function isAgg(e: Expr): boolean {
  if (e.k === 'call') return AGG_FNS.has(e.fn.toUpperCase());
  if (e.k === 'bin') return isAgg(e.l) || isAgg(e.r);
  if (e.k === 'not') return isAgg(e.e);
  return false;
}

function computeAgg(fn: string, vals: unknown[]): unknown {
  const nums = vals.filter(v => v !== null && v !== undefined).map(Number);
  switch (fn) {
    case 'COUNT': return vals.filter(v => v !== null && v !== undefined).length;
    case 'SUM':   return nums.reduce((a, b) => a + b, 0);
    case 'AVG':   return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    case 'MIN':   return nums.length ? Math.min(...nums) : null;
    case 'MAX':   return nums.length ? Math.max(...nums) : null;
  }
  return null;
}

// Evaluate an expression that may contain aggregate functions, against a group of rows + projected row
function evalAgg(e: Expr, groupRows: Row[], proj: Row): unknown {
  if (e.k === 'call' && AGG_FNS.has(e.fn.toUpperCase())) {
    const fn = e.fn.toUpperCase();
    let vals: unknown[];
    if (e.args[0]?.k === 'star') vals = groupRows.map(() => 1);
    else vals = groupRows.map(r => evalE(e.args[0], r));
    if (e.dist) { const s = new Set(vals.filter(v => v != null)); vals = Array.from(s); }
    return computeAgg(fn, vals);
  }
  if (e.k === 'bin') {
    if (e.op === 'AND') return toBool(evalAgg(e.l, groupRows, proj)) && toBool(evalAgg(e.r, groupRows, proj));
    if (e.op === 'OR')  return toBool(evalAgg(e.l, groupRows, proj)) || toBool(evalAgg(e.r, groupRows, proj));
    const lv = evalAgg(e.l, groupRows, proj);
    const rv = evalAgg(e.r, groupRows, proj);
    if (lv === null || lv === undefined || rv === null || rv === undefined) return false;
    // eslint-disable-next-line eqeqeq
    switch (e.op) {
      case '=':  return lv == rv;
      case '!=': case '<>': return lv != rv;
      case '<':  return Number(lv) < Number(rv);
      case '>':  return Number(lv) > Number(rv);
      case '<=': return Number(lv) <= Number(rv);
      case '>=': return Number(lv) >= Number(rv);
    }
  }
  if (e.k === 'not') return !toBool(evalAgg(e.e, groupRows, proj));
  // Scalar: try projected row first (for aliases), then raw row
  const v = evalE(e, proj);
  if (v !== undefined) return v;
  return evalE(e, groupRows[0] ?? {});
}

// ── Join builder ──────────────────────────────────────────────────────────────

function prefixRow(row: Row, alias: string): Row {
  const r: Row = {};
  for (const [k, v] of Object.entries(row)) {
    r[`${alias}.${k}`] = v;
    if (!(k in r)) r[k] = v;
  }
  return r;
}

function buildRows(q: ParsedQ, schema: Schema): Row[] {
  const tbl = schema[q.from.toLowerCase()];
  if (!tbl) throw new Error(`Таблица не найдена: "${q.from}"`);
  const alias = q.fromAlias ?? q.from.toLowerCase();
  let rows = tbl.map(r => prefixRow(r, alias));

  for (const j of q.joins) {
    const jtbl = schema[j.table.toLowerCase()];
    if (!jtbl) throw new Error(`Таблица не найдена: "${j.table}"`);
    const jalias = j.alias ?? j.table.toLowerCase();
    const jrows = jtbl.map(r => prefixRow(r, jalias));

    if (j.type === 'CROSS' || !j.on) {
      const res: Row[] = [];
      for (const l of rows) for (const r of jrows) res.push({ ...l, ...r });
      rows = res;
    } else if (j.type === 'INNER') {
      rows = rows.flatMap(l => jrows.filter(r => toBool(evalE(j.on!, { ...l, ...r }))).map(r => ({ ...l, ...r })));
    } else if (j.type === 'LEFT') {
      const res: Row[] = [];
      for (const l of rows) {
        const matches = jrows.filter(r => toBool(evalE(j.on!, { ...l, ...r })));
        if (matches.length) matches.forEach(r => res.push({ ...l, ...r }));
        else {
          const nullR: Row = Object.fromEntries(Object.keys(jrows[0] ?? {}).map(k => [k, null]));
          res.push({ ...l, ...nullR });
        }
      }
      rows = res;
    } else if (j.type === 'RIGHT') {
      const res: Row[] = [];
      for (const r of jrows) {
        const matches = rows.filter(l => toBool(evalE(j.on!, { ...l, ...r })));
        if (matches.length) matches.forEach(l => res.push({ ...l, ...r }));
        else {
          const nullL: Row = Object.fromEntries(Object.keys(rows[0] ?? {}).map(k => [k, null]));
          res.push({ ...nullL, ...r });
        }
      }
      rows = res;
    }
  }
  return rows;
}

// ── Projection ────────────────────────────────────────────────────────────────

function projectRow(sel: SelItem[], raw: Row, hasJoins: boolean): Row {
  const out: Row = {};
  for (const s of sel) {
    const e = s.e;
    if (e.k === 'star') {
      for (const [k, v] of Object.entries(raw)) {
        if (hasJoins ? k.includes('.') : !k.includes('.')) {
          const key = hasJoins ? k : k;
          out[key] = v;
        }
      }
      if (!hasJoins) {
        // Also bare names for single-table
        for (const [k, v] of Object.entries(raw)) {
          if (!k.includes('.')) out[k] = v;
        }
      }
    } else {
      const name = s.alias ?? colName(e);
      out[name] = evalE(e, raw);
    }
  }
  return out;
}

function colName(e: Expr): string {
  if (e.k === 'col') return e.tbl ? `${e.tbl}.${e.col}` : e.col;
  if (e.k === 'call') {
    const arg = e.args[0];
    const argStr = arg?.k === 'star' ? '*' : arg?.k === 'col' ? arg.col : '?';
    return `${e.fn.toLowerCase()}(${argStr})`;
  }
  return 'expr';
}

// ── Execute ───────────────────────────────────────────────────────────────────

function execQ(q: ParsedQ, schema: Schema): QueryResult {
  const hasJoins = q.joins.length > 0;

  // 1. FROM + JOINs
  let rows = buildRows(q, schema);

  // 2. WHERE
  if (q.where) rows = rows.filter(r => toBool(evalE(q.where!, r)));

  // 3. GROUP BY / aggregates
  const hasAgg = q.sel.some(s => isAgg(s.e)) || (q.having && isAgg(q.having));
  const hasGroup = q.groupBy.length > 0;
  let result: Row[];

  if (hasAgg || hasGroup) {
    const groups = new Map<string, Row[]>();
    if (hasGroup) {
      for (const r of rows) {
        const key = q.groupBy.map(e => String(evalE(e, r) ?? 'null')).join('\x00');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(r);
      }
    } else {
      groups.set('__all__', rows);
    }

    result = [];
    for (const [, grp] of groups) {
      const proj: Row = {};
      for (const s of q.sel) {
        if (s.e.k === 'star') {
          // expand non-prefixed columns from first row
          for (const [k, v] of Object.entries(grp[0] ?? {})) {
            if (!k.includes('.')) proj[k] = v;
          }
        } else {
          const nm = s.alias ?? colName(s.e);
          proj[nm] = evalAgg(s.e, grp, grp[0] ?? {});
        }
      }

      // HAVING: evaluate against group + projected row
      if (q.having && !toBool(evalAgg(q.having, grp, proj))) continue;
      result.push(proj);
    }
  } else {
    result = rows.map(r => projectRow(q.sel, r, hasJoins));
  }

  // 4. DISTINCT
  if (q.distinct) {
    const seen = new Set<string>();
    result = result.filter(r => { const k = JSON.stringify(Object.values(r)); if (seen.has(k)) return false; seen.add(k); return true; });
  }

  // 5. ORDER BY
  if (q.orderBy.length) {
    result.sort((a, b) => {
      for (const { e, dir } of q.orderBy) {
        const av = evalE(e, a) ?? evalE(e, b);
        const bv = evalE(e, b) ?? evalE(e, a);
        if (av == bv) continue;
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av) < String(bv) ? -1 : 1;
        return dir === 'DESC' ? -cmp : cmp;
      }
      return 0;
    });
  }

  // 6. LIMIT
  if (q.limit !== undefined) result = result.slice(0, q.limit);

  // 7. Columns from first row or from sel
  const columns = result.length > 0
    ? Object.keys(result[0])
    : q.sel.flatMap(s => s.e.k === 'star' ? [] : [s.alias ?? colName(s.e)]);

  return { columns, rows: result.map(r => Object.values(r)), rowCount: result.length };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function runQuery(sql: string, schema: Schema = DB): QueryResult {
  try {
    const toks = lex(sql.trim());
    const parser = new P(toks);
    const parsed = parser.parseQ();
    return execQ(parsed, schema);
  } catch (err) {
    return { columns: [], rows: [], rowCount: 0, error: String(err).replace('Error: ', '') };
  }
}
