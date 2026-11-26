"""Checks for the study site. Run alone (python tools/verify.py) or through build.py.

1. load_all()      reads content/ and keys/
2. check_content() schema, ids, answer keys against keys/answer-keys.json, source labels, options,
                   references to tools/figures/tables/images, plan, registry
3. solver_checks() re-solves the computational questions (ported from the v1 verify scripts)
"""
import glob, heapq, io, itertools, json, math, os, random, re, sys
from fractions import Fraction as F
from functools import lru_cache

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, 'content')
IMG_WARN = 150 * 1024
REVIEW_TYPES = {'text': ('html',), 'img': ('src', 'alt'), 'svg': ('name',)}


def rd_json(path):
    with io.open(path, encoding='utf-8') as f:
        return json.load(f)


def load_all():
    reg = rd_json(os.path.join(CONTENT, 'courses.json'))
    site = rd_json(os.path.join(CONTENT, 'site.json'))
    plan = rd_json(os.path.join(CONTENT, 'plan.json'))
    keys = rd_json(os.path.join(ROOT, 'keys', 'answer-keys.json'))
    courses = sorted(reg['courses'], key=lambda c: c['order'])
    patterns, selftests = [], {}
    for c in courses:
        d = os.path.join(CONTENT, c['id'])
        for p in sorted(glob.glob(os.path.join(d, '*.json'))):
            name = os.path.basename(p)
            obj = rd_json(p)
            if name == 'selftest.json':
                selftests[c['id']] = dict(obj, _file=os.path.relpath(p, ROOT))
            else:
                patterns.append(dict(obj, _file=os.path.relpath(p, ROOT)))
    # course folders that are not in the registry
    stray = [os.path.basename(d) for d in glob.glob(os.path.join(CONTENT, '*')) if os.path.isdir(d)
             and os.path.basename(d) not in {c['id'] for c in courses} and os.path.basename(d) != 'img']
    return dict(reg=reg, site=site, plan=plan, keys=keys, courses=courses, patterns=patterns,
                selftests=selftests, stray=stray)


def js_registry(js_src):
    """names registered by regTool/regFig/regTable in the web/js sources"""
    out = {'tool': set(), 'fig': set(), 'table': set()}
    for kind, name in re.findall(r"reg(Tool|Fig|Table)\('([A-Za-z0-9_]+)'", js_src):
        out[kind.lower()].add(name)
    return out


def g2j(gy, gm, gd):
    gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    gy2 = gy + 1 if gm > 2 else gy
    days = 355666 + 365 * gy + (gy2 + 3) // 4 - (gy2 + 99) // 100 + (gy2 + 399) // 400 + gd + gdm[gm - 1]
    jy = -1595 + 33 * (days // 12053); days %= 12053
    jy += 4 * (days // 1461); days %= 1461
    if days > 365:
        jy += (days - 1) // 365; days = (days - 1) % 365
    jm = 1 + days // 31 if days < 186 else 7 + (days - 186) // 30
    jd = 1 + days % 31 if days < 186 else 1 + (days - 186) % 30
    return jy, jm, jd


def check_content(A, reg_names):
    errs, warns, images = [], [], {}
    keys = A['keys']; expected = keys['expected']; k1405 = {int(k): v for k, v in keys['official1405'].items()}
    rules = keys['srcRules']
    cids = [c['id'] for c in A['courses']]
    if len(set(cids)) != len(cids): errs.append('duplicate course id in courses.json')
    groups = {g['id'] for g in A['reg']['groups']}
    for c in A['courses']:
        for f in ('id', 'name', 'group', 'order', 'hasContent'):
            if f not in c: errs.append('course %s lacks %s' % (c.get('id'), f))
        if c.get('group') not in groups: errs.append('course %s has unknown group' % c.get('id'))
        has_files = any(p['course'] == c['id'] for p in A['patterns'])
        if c.get('hasContent') and not has_files: errs.append('course %s says hasContent but has no pattern files' % c['id'])
        if not c.get('hasContent') and has_files: errs.append('course %s has pattern files but hasContent is false' % c['id'])
        if c.get('hasContent') and 'color' not in c: warns.append('course %s has no color, it uses the default accent' % c['id'])
    for s in A['stray']: errs.append('content/%s is not a course in courses.json' % s)
    # dates
    ex = A['reg']['exam']
    for d in (ex['date'], ex['registration']['start'], ex['registration']['end']):
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', d): errs.append('bad date ' + d)
    questions, owner = {}, {}
    pat_ids = set()

    def add_q(q, where, course):
        qid = q.get('id', '?')
        if qid in questions: errs.append('duplicate question %s (%s and %s)' % (qid, owner[qid], where)); return
        questions[qid] = q; owner[qid] = where
        m = re.match(r'^([a-z0-9]+)-(\d{4})-(\d+)$', qid)
        if not m: errs.append('bad question id %s in %s' % (qid, where)); return
        if m.group(1) != course: errs.append('question %s is in course %s' % (qid, course))
        if int(m.group(2)) != q.get('year') or int(m.group(3)) != q.get('number'):
            errs.append('year/number mismatch %s' % qid)
        opts = q.get('options')
        if not isinstance(opts, list) or len(opts) != 4 or not all(isinstance(o, str) and o.strip() for o in opts):
            errs.append('%s has %s options' % (qid, len(opts) if isinstance(opts, list) else 'no'))
        if q.get('key') not in (1, 2, 3, 4): errs.append('%s key out of range' % qid)
        if not isinstance(q.get('text'), str) or not q['text'].strip(): errs.append('%s has no text' % qid)
        if not isinstance(q.get('steps'), list) or not q['steps']: errs.append('%s has no solution steps' % qid)
        if q.get('figure') and q['figure'] not in reg_names['fig']: errs.append('%s uses unknown figure %s' % (qid, q['figure']))
        for s in [q.get('text', '')] + (opts or []) + (q.get('steps') or []):
            if isinstance(s, str) and s.count('$') % 2: errs.append('%s has an unclosed $ in: %s' % (qid, s[:40]))

    for p in A['patterns']:
        where = p['_file']
        for f in ('id', 'course', 'title', 'en', 'frequency', 'cue', 'how', 'trap', 'example', 'practice', 'questions'):
            if f not in p: errs.append('%s lacks %s' % (where, f))
        if not os.path.basename(where).startswith(p.get('id', '') + '-'): errs.append('%s: file name must start with "%s-"' % (where, p.get('id')))
        if p.get('id') in pat_ids: errs.append('duplicate pattern id %s' % p.get('id'))
        pat_ids.add(p.get('id'))
        if os.path.basename(os.path.dirname(where)) != p.get('course'): errs.append('%s: course field differs from its folder' % where)
        for q in p.get('questions', []): add_q(q, where, p.get('course'))
        local = {q.get('id') for q in p.get('questions', [])}
        used = [p.get('example')] + list(p.get('practice', []))
        for u in used:
            if u not in local: errs.append('%s: %s is not among its questions' % (where, u))
        for q in local - set(used): errs.append('%s: question %s is neither example nor practice' % (where, q))
        if p.get('table') and p['table'] not in reg_names['table']: errs.append('%s: unknown table %s' % (where, p['table']))
        if p.get('tool') and p['tool'] not in reg_names['tool']: errs.append('%s: unknown tool %s' % (where, p['tool']))
        for i, b in enumerate(p.get('review') or []):
            t = b.get('type')
            if t not in REVIEW_TYPES: errs.append('%s: review block %d has unknown type %s' % (where, i, t)); continue
            for f in REVIEW_TYPES[t]:
                if f not in b: errs.append('%s: review block %d (%s) lacks %s' % (where, i, t, f))
            if t == 'svg' and b.get('name') not in reg_names['fig']: errs.append('%s: review svg %s is not a registered figure' % (where, b.get('name')))
            if t == 'img' and 'src' in b:
                src = b['src']
                if not re.match(r'^img/[a-z0-9]+/[A-Za-z0-9._-]+\.(webp|png|jpg|jpeg|svg)$', src):
                    errs.append('%s: image path must look like img/<course>/<file>.webp: %s' % (where, src))
                path = os.path.join(CONTENT, *src.split('/'))
                if not os.path.isfile(path): errs.append('%s: missing image %s' % (where, src))
                else:
                    size = os.path.getsize(path); images[src] = size
                    if size > IMG_WARN: warns.append('image %s is %d KB (over 150 KB)' % (src, size // 1024))
        r = p.get('rank')
        if r is not None and not (isinstance(r.get('order'), int) and r.get('repeat') and isinstance(r.get('hours'), (int, float))):
            errs.append('%s: rank needs order, repeat, hours' % where)
    orders = [p['rank']['order'] for p in A['patterns'] if p.get('rank')]
    if len(orders) != len(set(orders)): errs.append('duplicate rank order across patterns')
    for c, st in A['selftests'].items():
        for q in st.get('questions', []): add_q(q, st['_file'], c)
        for qid in st.get('ids', []):
            if qid not in questions: errs.append('%s: unknown question %s' % (st['_file'], qid))
            elif not qid.startswith(c + '-'): errs.append('%s: %s is from another course' % (st['_file'], qid))
        if len(set(st.get('ids', []))) != len(st.get('ids', [])): errs.append('%s: repeated id' % st['_file'])
    # every self-test-only question must be in the test list
    for c, st in A['selftests'].items():
        for q in st.get('questions', []):
            if q['id'] not in st.get('ids', []): errs.append('%s: question %s is not in ids' % (st['_file'], q['id']))
    for d in A['plan']['days']:
        for pid in d.get('patterns', []):
            if pid not in pat_ids: errs.append('plan %s: unknown pattern %s' % (d['id'], pid))
        if not d.get('patterns') and not d.get('text'): errs.append('plan %s needs patterns or text' % d['id'])
    if A['site']['exam']['negative'].get('tool') and A['site']['exam']['negative']['tool'] not in reg_names['tool']:
        errs.append('site.json exam tool is not registered')
    # ---- answer keys (independent table) ----
    for qid, k in expected.items():
        if qid not in questions: errs.append('missing ' + qid)
        elif questions[qid]['key'] != k: errs.append('key mismatch %s content=%d expected=%d' % (qid, questions[qid]['key'], k))
    for qid in questions:
        if qid not in expected: errs.append('unexpected %s (not in keys/answer-keys.json)' % qid)
    for qid, q in questions.items():
        y, n, s = q['year'], q['number'], q['src']
        rule = rules.get(str(y))
        if rule is None: errs.append('no source rule for year %d (%s)' % (y, qid))
        elif s != rule: errs.append('src label %s is %s, must be %s' % (qid, s, rule))
        if y == 1405 and k1405.get(n) != q['key']: errs.append('1405 official mismatch ' + qid)
    # ---- Shamsi conversion used on the site ----
    for g, j in (((2027, 5, 6), (1406, 2, 16)), ((2026, 12, 7), (1405, 9, 16)), ((2026, 12, 13), (1405, 9, 22)), ((2026, 3, 21), (1405, 1, 1)), ((2025, 3, 20), (1403, 12, 30))):
        if g2j(*g) != j: errs.append('jalali conversion %s gave %s, expected %s' % (g, g2j(*g), j))
    return questions, errs, warns, images


# ---------------- solver checks (ported from v1 verify.py / verify2.py) ----------------
def _huff(freqs):
    h = list(freqs); heapq.heapify(h); cost = 0
    while len(h) > 1:
        a = heapq.heappop(h); b = heapq.heappop(h); cost += a + b; heapq.heappush(h, a + b)
    return cost


def _ab(node, alpha, beta, ismax, visited):
    if node[0] == 'leaf':
        visited.add(node[1]); return node[2]
    name, children = node
    visited.add(name)
    v = -math.inf if ismax else math.inf
    for ch in children:
        cv = _ab(ch, alpha, beta, not ismax, visited)
        if ismax:
            v = max(v, cv)
            if v >= beta: return v
            alpha = max(alpha, v)
        else:
            v = min(v, cv)
            if v <= alpha: return v
            beta = min(beta, v)
    return v


def solver_checks():
    errs = []
    def ok(cond, msg):
        if not cond: errs.append('solver: ' + msg)
    ok(_huff([1000, 1200, 800, 1500, 1800, 700]) == 17700, '1405 Q67 Huffman total != 17700')
    for n in range(2, 12):
        ok(_huff([2 ** i for i in range(n)]) == 2 ** (n + 1) - n - 3, '1405 Q60 formula fails at n=%d' % n)

    @lru_cache(None)
    def best(d, b):
        if b <= 0: return -10 ** 9
        if d == 6: return 1
        r = -10 ** 9
        for b1 in range(0, b):
            b2 = b - 1 - b1
            r = max(r, (best(d + 1, b1) if b1 > 0 else 0) + (best(d + 1, b2) if b2 > 0 else 0))
        return r
    ok(max(best(0, b) for b in range(1, 28)) == 12, '1401 Q64 max leaves != 12')
    Dl = [10, 2, 3, 3, 2, 5, 1]; P = [10, 45, 55, 65, 70, 33, 18]; bestpen = None
    for mask in range(1 << 7):
        Sx = sorted([i for i in range(7) if mask >> i & 1], key=lambda i: Dl[i])
        if all(Dl[i] >= k + 1 for k, i in enumerate(Sx)):
            pen = sum(P[i] for i in range(7) if not mask >> i & 1)
            bestpen = pen if bestpen is None else min(bestpen, pen)
    ok(bestpen == 63, '1403 Q64 min penalty != 63')
    f = [1, 2, 4]
    for n in range(3, 60): f.append(f[-1] + 2 * f[-2] + f[-3])
    ok(all(f[n] <= 3 ** n for n in range(3, 60)) and f[3] > 2 ** 3 and f[12] > 2 ** 13, '1403 Q61 growth bounds')
    p = F(1, 50); ok(p + (1 - p) * p == F(396, 10000), '1401 Q75 != 0.0396')
    PB0 = {0: F(8, 10), 1: F(2, 10)}; PC0 = {0: F(1, 10), 1: F(8, 10)}
    PD0 = {(0, 0): F(1), (1, 0): F(1, 2), (0, 1): F(1, 2), (1, 1): F(0)}
    def joint(a, b, c, d):
        pb = PB0[a] if b == 0 else 1 - PB0[a]; pc = PC0[a] if c == 0 else 1 - PC0[a]
        pd = PD0[(b, c)] if d == 0 else 1 - PD0[(b, c)]
        return F(1, 2) * pb * pc * pd
    num = sum(joint(1, 0, c, 1) for c in (0, 1)); den = sum(joint(a, 0, c, 1) for a in (0, 1) for c in (0, 1))
    ok(num / den == F(1, 19), '1401 Q79 != 1/19')
    tot = good = 0
    imp = lambda x, y: (not x) or y
    for P_, Qv, R, Sv in itertools.product([0, 1], repeat=4):
        if not imp(P_, not Qv):
            tot += 1
            if imp(not Qv, R) and imp(P_, Sv): good += 1
    ok(F(good, tot) == F(1, 2), '1401 Q76 != 1/2')
    for n in (8, 100, 1000):
        h = n // 2
        E = sum(F(1, 4) / h * i for i in range(1, h + 1)) + sum(F(3, 4) / h * i for i in range(h + 1, n + 1))
        ok(E - F(5 * n, 8) == F(1, 2), '1401 Q69 average at n=%d' % n)
    rng = random.Random(1405); pos = set()
    for _ in range(20000):
        a = rng.sample(range(1000), 20); heapq.heapify(a); pos.add(a.index(sorted(a)[3]) + 1)
    ok(pos == set(range(2, 16)), '1405 Q64 positions %s' % sorted(pos))
    ok(abs(2 * 0.5 ** 2 + 8 / 9 * 0.75 ** 2 - 1.0) < 1e-12, '1404 Q56 Akra-Bazzi p=2')
    @lru_cache(None)
    def T(n):
        return 1.0 if n <= 2 else 2 * T(math.isqrt(n)) + math.log2(n)
    rat = [T(2 ** k) / (k * math.log2(k)) for k in (16, 32, 64, 128, 256, 512, 1024)]
    ok(all(x > y for x, y in zip(rat, rat[1:])) and rat[-1] < 1.11, '1405 Q58 not Θ(log n loglog n)')
    for n in (1000, 100000):
        r = sum(n // i for i in range(1, n + 1)) / (n * math.log(n)); ok(1.0 < r < 1.03, '1402 Q57 ratio %f' % r)
    L = lambda n, v: ('leaf', n, v)
    t = ('root', [('m1', [('x1', [L('l8', 8), L('l2', 2)]), ('A', [L('B', 5), L('C', 3)])]), ('D', [L('l15', 15), ('E', [L('F', 4), L('G', 7)])])])
    vis = set(); val = _ab(t, -math.inf, math.inf, True, vis)
    ok(val == 7 and {'root', 'm1', 'x1', 'l8', 'l2', 'A', 'B', 'C', 'D', 'l15', 'E', 'F', 'G'} - vis == set(), '1403 Q68 alpha-beta')
    def tree(x4, x15):
        return ('root', [L('L10', 10), ('m1', [('a', [L('n4', x4), L('n3', 3), L('n2', 2)]), ('b', [L('n7', 7), L('n1', 1)])]), ('m2', [('c', [L('n15', x15), L('n6', 6)]), ('d', [L('n20', 20), L('n23', 23)])])])
    alln = {'root', 'L10', 'm1', 'a', 'n4', 'n3', 'n2', 'b', 'n7', 'n1', 'm2', 'c', 'n15', 'n6', 'd', 'n20', 'n23'}
    def pruned(x4, x15):
        vis = set(); v = _ab(tree(x4, x15), -math.inf, math.inf, True, vis); return v, frozenset(alln - vis)
    base = pruned(4, 15)
    ok(base == (15, frozenset({'n23', 'b', 'n7', 'n1'})), '1404 Q69 base')
    ok4 = [x for x in range(-20, 40) if pruned(x, 15)[1] == base[1]]
    ok15 = [y for y in range(-20, 40) if pruned(4, y)[1] == base[1]]
    ok(max(ok4) == 10 and (min(ok15), max(ok15)) == (11, 20), '1404 Q69 leaf ranges')
    Dm = {'X': {1, 2, 3}, 'Y': {1, 2, 3, 4}, 'Z': {1, 2}, 'W': {2, 3}}
    cons = [('X', 'Y', lambda a, b: a != b), ('Z', 'W', lambda a, b: a == b), ('X', 'W', lambda a, b: a + b <= 4)]
    arcs = []
    for a, b, fn in cons:
        arcs.append((a, b, fn)); arcs.append((b, a, lambda x, y, fn=fn: fn(y, x)))
    changed = True
    while changed:
        changed = False
        for a, b, fn in arcs:
            nd = {x for x in Dm[a] if any(fn(x, y) for y in Dm[b])}
            if nd != Dm[a]: Dm[a] = nd; changed = True
    ok(Dm == {'X': {1, 2}, 'Y': {1, 2, 3, 4}, 'Z': {2}, 'W': {2}}, '1404 Q75 AC-3 domains')
    edges = [('S', 'A', 4), ('S', 'B', 2), ('A', 'C', 3), ('A', 'G', 6), ('B', 'D', 2), ('B', 'G', 4)]
    h1 = {'S': 5, 'A': 3, 'B': 3, 'C': 1, 'D': 1, 'G': 0}; h2 = {'S': 5, 'A': 6, 'B': 3, 'C': 3, 'D': 6, 'G': 0}
    def check(undirected, h):
        adj = {}
        for u, v, w in edges:
            adj.setdefault(u, []).append((v, w))
            if undirected: adj.setdefault(v, []).append((u, w))
        radj = {}
        for u in adj:
            for v, w in adj[u]: radj.setdefault(v, []).append((u, w))
        dist = {'G': 0}; pq = [(0, 'G')]
        while pq:
            d, u = heapq.heappop(pq)
            if d > dist.get(u, math.inf): continue
            for v, w in radj.get(u, []):
                if d + w < dist.get(v, math.inf): dist[v] = d + w; heapq.heappush(pq, (d + w, v))
        adm = all(h[n] <= dist.get(n, math.inf) for n in h)
        bad = [(u, v) for u in adj for v, w in adj[u] if h[u] > w + h[v]]
        return adm, bad
    ok(check(True, h2) == (True, [('D', 'B')]) and check(True, h1) == (True, []) and check(False, h2) == (True, []), '1404 Q74 heuristics')
    return errs + toc_checks()


# ---------------- theory of languages: brute-force re-solving on short strings ----------------
def _words(alpha, n):
    """all strings over alpha with length <= n"""
    out = ['']
    for k in range(1, n + 1): out += [''.join(t) for t in itertools.product(alpha, repeat=k)]
    return out


def _lang_re(rx, alpha, n):
    r = re.compile(rx)
    return {w for w in _words(alpha, n) if r.fullmatch(w)}


def _nfa(delta, starts, finals, alpha, n):
    out = set()
    for w in _words(alpha, n):
        cur = set(starts)
        for ch in w: cur = {q for p in cur for q in delta.get((p, ch), ())}
        if cur & set(finals): out.add(w)
    return out


def _grammar(rules, start, terminals, maxlen, formlen):
    """terminal strings (length <= maxlen) of a grammar; rules = [(lhs, rhs)] over one-char symbols; BFS over all
    rewrites of sentential forms no longer than formlen (enough for the small grammars of the past questions)"""
    seen, todo, out = {start}, [start], set()
    while todo:
        f = todo.pop()
        if all(c in terminals for c in f):
            if len(f) <= maxlen: out.add(f)
            continue
        for l, r in rules:
            i = f.find(l)
            while i >= 0:
                g = f[:i] + r + f[i + len(l):]
                if len(g) <= formlen and sum(c in terminals for c in g) <= maxlen + 2 and g not in seen:
                    seen.add(g); todo.append(g)
                i = f.find(l, i + 1)
    return out


def toc_checks():
    errs = []
    def ok(cond, msg):
        if not cond: errs.append('solver: toc ' + msg)
    B = '01'
    # 1404 Q47: options 1, 3, 4 are "no 00"; option 2 differs (key 2)
    o = [_lang_re(x, B, 10) for x in ('(0|)(1|10)*', '(0|)(11|10)*', '(1|01)*(0|)', '(0|)(11*0)*1*')]
    ok(o[0] == o[2] == o[3] != o[1] and o[0] == {w for w in _words(B, 10) if '00' not in w}, '1404 Q47 regex')
    # 1402 Q46: two start states q1 (final) and q0; X is the unnamed state (key 4; q1 alone gives option 3)
    d = {('q1', '0'): ['q0'], ('q0', '0'): ['q1'], ('q0', '1'): ['q2'], ('q2', '1'): ['X'], ('X', '1'): ['q2'], ('q1', '1'): ['X']}
    both, one = _nfa(d, ['q1', 'q0'], ['q1', 'q2'], B, 10), _nfa(d, ['q1'], ['q1', 'q2'], B, 10)
    o = [_lang_re(x, B, 10) for x in ('(00)*(0|1)(11)*', '(00)*(|0|1)(11)*', '(00)*(|01)(11)*', '(00)*(|0|1|01)(11)*')]
    ok(both == o[3] and all(both != x for x in o[:3]) and one == o[2], '1402 Q46 NFA to regex')
    # 1402 Q49: rotations of 0*1* (key 1)
    rot = {w for w in _words(B, 9) if any(re.fullmatch('0*1*', w[i:] + w[:i]) for i in range(max(1, len(w))))}
    o = [_lang_re(x, B, 9) for x in ('0*1*0*|1*0*1*', '1*0*|0*1*', '0*1*0*', '1*0*1*')]
    ok(rot == o[0] and all(rot != x for x in o[1:]), '1402 Q49 rotations')
    # 1402 Q48: minimal DFA of {a^n b^n | n <= k} has 2k+2 states (Myhill-Nerode, brute force for k = 1..3), so 102 for k = 50
    for k in (1, 2, 3):
        inL = lambda w: w in {'a' * n + 'b' * n for n in range(k + 1)}
        suf = _words('ab', 2 * k + 1)
        cls = {tuple(inL(x + z) for z in suf) for x in _words('ab', 2 * k + 1)}
        ok(len(cls) == 2 * k + 2, '1402 Q48 Myhill-Nerode k=%d gives %d' % (k, len(cls)))
    # 1403 Q50: S -> aSc | aS | A,  A -> bAcc | bA | bAc | eps  is {a^m b^n c^p | p <= m+2n} (key 2)
    g = _grammar([('S', 'aSc'), ('S', 'aS'), ('S', 'A'), ('A', 'bAcc'), ('A', 'bA'), ('A', 'bAc'), ('A', '')], 'S', 'abc', 7, 9)
    abc = [(m, n, p) for m in range(8) for n in range(8) for p in range(8) if m + n + p <= 7]
    opt = [lambda m, n, p: 2 * m + n >= p, lambda m, n, p: m + 2 * n >= p, lambda m, n, p: m + n > p, lambda m, n, p: 2 * m + 2 * n >= p]
    o = [{'a' * m + 'b' * n + 'c' * p for m, n, p in abc if f(m, n, p)} for f in opt]
    ok(g == o[1] and all(g != x for i, x in enumerate(o) if i != 1), '1403 Q50 grammar')
    # 1401 Q55: grammar is {a^m b^n c^p d^q | m+n = p+q} (key 1)
    g = _grammar([('S', 'aSd'), ('S', 'A'), ('S', 'B'), ('A', 'aAc'), ('A', 'C'), ('B', 'bBd'), ('B', 'C'), ('C', 'bCc'), ('C', '')], 'S', 'abcd', 8, 10)
    q4 = [(m, n, p, q) for m in range(9) for n in range(9) for p in range(9) for q in range(9) if m + n + p + q <= 8]
    opt = [lambda m, n, p, q: m + n == p + q, lambda m, n, p, q: m + p == n + q, lambda m, n, p, q: m + n + p == q, lambda m, n, p, q: m == q and n == p]
    o = [{'a' * m + 'b' * n + 'c' * p + 'd' * q for m, n, p, q in q4 if f(m, n, p, q)} for f in opt]
    ok(g == o[0] and all(g != x for x in o[1:]), '1401 Q55 grammar')
    # 1400 Q53: S -> S1 B, S1 -> a S1 b, bB -> bbbB, a S1 b -> aa, B -> eps  (S1 written X)  is a^(n+1) b^(n-1+2t) (key 1)
    g = _grammar([('S', 'XB'), ('X', 'aXb'), ('bB', 'bbbB'), ('aXb', 'aa'), ('B', '')], 'S', 'ab', 9, 12)
    o1 = {'a' * (n + 1) + 'b' * (n - 1 + 2 * t) for n in range(1, 9) for t in range(6) if 2 * n + 2 * t <= 9}
    o3 = {'a' * (n + 1) + 'b' * (n + k) for n in range(1, 9) for k in range(9) if 2 * n + 1 + k <= 9}
    ok(g == o1 and g != o3, '1400 Q53 unrestricted grammar')
    # 1401 Q53: with ? = H the grammar makes exactly a^(2^n) (key 3)
    g = _grammar([('S', '[Ra]'), ('S', 'a'), ('Ra', 'aaR'), ('aL', 'La'), ('aH', 'Ha'), ('R]', 'L]'), ('R]', 'H'), ('[L', '[R'), ('[H', '')], 'S', 'a', 8, 12)
    ok(g == {'a', 'aa', 'aaaa', 'a' * 8}, '1401 Q53 a^(2^n) grammar')
    # 1404 Q48: number of parse trees in S -> A0 | S1 | 1,  A -> 1S | 1A | 0  (only 1110 is ambiguous, key 3)
    @lru_cache(None)
    def ts(w):
        return (ta(w[:-1]) if w.endswith('0') and len(w) > 1 else 0) + (ts(w[:-1]) if w.endswith('1') and len(w) > 1 else 0) + (w == '1')
    @lru_cache(None)
    def ta(w):
        return ((ts(w[1:]) + ta(w[1:])) if w.startswith('1') and len(w) > 1 else 0) + (w == '0')
    ok([ts(w) for w in ('1111', '1101', '1110')] == [1, 1, 2], '1404 Q48 ambiguity')
    # 1405 Q46: the PDA accepts L exactly by final state AND empty stack; by final state alone it accepts aab (key 1)
    T = [('s', 'a', '', 's', 'a'), ('s', '', '', 'p', ''), ('p', 'b', 'a', 'p', ''), ('p', 'b', '', 'p', 'b'), ('p', '', '', 'q', ''), ('q', 'c', 'b', 'q', '')]
    def runs(w):
        seen, todo = set(), [('s', 0, '')]
        while todo:
            c = todo.pop()
            if c in seen: continue
            seen.add(c); st, i, stk = c
            for a, x, pop, b, push in T:
                if a != st: continue
                if x and (i >= len(w) or w[i] != x): continue
                if pop and not stk.endswith(pop): continue
                ns = (stk[:-len(pop)] if pop else stk) + push
                if len(ns) <= len(w): todo.append((b, i + (1 if x else 0), ns))
        return seen
    inL = lambda w: re.fullmatch('a*b*c*', w) is not None and w.count('a') + w.count('c') == w.count('b')
    good = all(any(c == ('q', len(w), '') for c in runs(w)) == inL(w) for w in _words('abc', 6))
    loose = any(c[0] == 'q' and c[1] == 3 for c in runs('aab'))
    ok(good and loose and not inL('aab'), '1405 Q46 PDA acceptance')
    # 1405 Q48 (a): a one-final-state NFA without eps for {a} U {b^n | n >= 2}
    ok(_nfa({('0', 'a'): ['f'], ('0', 'b'): ['1'], ('1', 'b'): ['1', 'f']}, ['0'], ['f'], 'ab', 7) == {'a'} | {'b' * n for n in range(2, 8)}, '1405 Q48 NFA')
    # 1400 Q55: classes "same state reached": 5 reachable states with representatives e, a, b, aa, ab (key 4)
    dl = {('0', 'a'): '1', ('0', 'b'): '2', ('1', 'a'): '4', ('1', 'b'): '3', ('3', 'a'): '1', ('3', 'b'): '2', ('4', 'a'): '2', ('4', 'b'): '3', ('2', 'a'): '2', ('2', 'b'): '2'}
    def reach(w):
        s = '0'
        for ch in w: s = dl[(s, ch)]
        return s
    rep = {}
    for w in _words('ab', 4): rep.setdefault(reach(w), w)
    ok(sorted(rep.values()) == sorted(['', 'a', 'b', 'aa', 'ab']) and reach('aab') == reach('ab'), '1400 Q55 classes')
    return errs


def main():
    sys.path.insert(0, ROOT)
    js = ''.join(io.open(p, encoding='utf-8').read() for p in glob.glob(os.path.join(ROOT, 'web', 'js', '**', '*.js'), recursive=True))
    A = load_all()
    qs, errs, warns, _ = check_content(A, js_registry(js))
    errs += solver_checks()
    for w in warns: print('WARN', w)
    if errs:
        print('ERRORS'); [print(' ', e) for e in errs]; sys.exit(1)
    print('ok: %d questions, all keys match, solver checks pass' % len(qs))


if __name__ == '__main__':
    main()
