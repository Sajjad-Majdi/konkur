"""Build the study site from content/ and web/.

Outputs
  ../Executables/konkur-notebook.html   one offline file (fonts and images inlined)
  docs/                                 GitHub Pages: index.html, manifest, icons, sw.js, img/

Usage: python build.py            (fails on any content or answer-key error)
"""
import base64, glob, hashlib, io, json, os, re, shutil, struct, sys, zlib

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import verify  # noqa: E402

WEB = os.path.join(ROOT, 'web')
FONTS = os.path.join(ROOT, 'fonts')
DOCS = os.path.join(ROOT, 'docs')
EXE_DIR = os.path.normpath(os.path.join(ROOT, '..', 'Executables'))
EXE = os.path.join(EXE_DIR, 'konkur-notebook.html')
JS_ORDER = ['core', 'components', 'tools', 'views', 'boot']   # concatenation order; files sorted by name inside each
FONT_FILES = [(400, 'Vazirmatn-Regular.ttf'), (500, 'Vazirmatn-Medium.ttf'), (700, 'Vazirmatn-Bold.ttf'), (800, 'Vazirmatn-ExtraBold.ttf')]
MIME = {'webp': 'image/webp', 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'svg': 'image/svg+xml'}
SVG_NS = 'http://www.w3.org/2000/svg'


def rd(path, mode='r'):
    if mode == 'rb':
        with open(path, 'rb') as f: return f.read()
    with io.open(path, encoding='utf-8') as f: return f.read()


def wr(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if isinstance(data, bytes):
        with open(path, 'wb') as f: f.write(data)
    else:
        with io.open(path, 'w', encoding='utf-8', newline='\n') as f: f.write(data)


def js_sources():
    files = []
    for d in JS_ORDER:
        files += sorted(glob.glob(os.path.join(WEB, 'js', d, '*.js')))
    return files


# ---------------- runtime data ----------------
def runtime_data(A, img_url):
    """compact runtime shape (same field names the v1 code used)"""
    def q(o):
        r = {'y': o['year'], 'n': o['number'], 'src': o['src'], 'key': o['key']}
        if o.get('figure'): r['fig'] = o['figure']
        r.update({'t': o['text'], 'o': o['options'], 's': o['steps']})
        return r
    Q, pats = {}, []
    for p in A['patterns']:
        r = {'id': p['id'], 'c': p['course'], 't': p['title'], 'en': p['en'], 'f': p['frequency'],
             'cue': p['cue'], 'how': p['how'], 'trap': p['trap'], 'ex': p['example'], 'pr': p['practice']}
        if p.get('table'): r['tbl'] = p['table']
        if p.get('tool'): r['w'] = p['tool']
        if p.get('rank'): r['rank'] = p['rank']
        if p.get('review'):
            r['rv'] = [dict(b, src=img_url(b['src'])) if b['type'] == 'img' else b for b in p['review']]
        pats.append(r)
        for x in p['questions']: Q[x['id']] = q(x)
    st = {}
    for c, s in A['selftests'].items():
        for x in s.get('questions', []): Q[x['id']] = q(x)
        st[c] = s['ids']
    plan = []
    for d in A['plan']['days']:
        r = {'id': d['id'], 'w': d['week']}
        if d.get('patterns'): r['p'] = d['patterns']
        if d.get('extra'): r['x'] = d['extra']
        if d.get('text'): r['t'] = d['text']
        plan.append(r)
    return {'site': A['site'], 'exam': A['reg']['exam'], 'groups': A['reg']['groups'], 'courses': A['courses'],
            'patterns': pats, 'q': Q, 'selftest': st, 'plan': plan}


def course_css(courses):
    light, dark, rules = [], [], []
    for c in courses:
        col, i = c.get('color'), c['id']
        if not col: continue
        light.append('--c-%s:%s;--c-%s-soft:%s' % (i, col['light'], i, col['lightSoft']))
        dark.append('--c-%s:%s;--c-%s-soft:%s' % (i, col['dark'], i, col['darkSoft']))
        sel = ','.join(s % i for s in ('#v-%s', '.pat.%s', '.sheet.%s', '.rk.%s', '.hrc.%s', '.cc.%s'))
        rules.append('%s{--acc:var(--c-%s);--acc-soft:var(--c-%s-soft)}' % (sel, i, i))
        rules.append('.pill button[data-v="%s"].on{color:var(--c-%s)}' % (i, i))
    if not light: return ''
    return ('\n/* generated from content/courses.json */\n:root{%s}\n@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){%s}}\n:root[data-theme="dark"]{%s}\n%s\n'
            % (';'.join(light), ';'.join(dark), ';'.join(dark), '\n'.join(rules)))


def font_faces():
    out = []
    for w, name in FONT_FILES:
        b = base64.b64encode(rd(os.path.join(FONTS, name), 'rb')).decode('ascii')
        out.append("@font-face{font-family:Vaz;src:url(data:font/ttf;base64,%s) format('truetype');font-weight:%d;font-style:normal;font-display:swap}" % (b, w))
    return '\n'.join(out)


def page(A, head, img_url):
    data = json.dumps(runtime_data(A, img_url), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    js = '(function(){\n\'use strict\';\nvar KN_DATA=' + data + ';\n' + '\n'.join(rd(f) for f in js_sources()) + '\n})();'
    assert '</script' not in js.lower()
    live = [c for c in A['courses'] if c.get('hasContent')]
    brand = A['site']['brand']
    tpl = rd(os.path.join(WEB, 'template.html'))
    html = (tpl.replace('<!--HEAD-->', head).replace('{{TITLE}}', brand).replace('{{BRAND}}', brand)
            .replace('{{BRAND_SUB}}', ' و '.join(c.get('short') or c['name'] for c in live)))
    css = rd(os.path.join(WEB, 'style.css')) + course_css(A['courses'])
    return html.replace('/*FONTS*/', font_faces()).replace('/*CSS*/', css).replace('/*JS*/', js)


def assert_offline(name, text, allowed_links):
    """no external resources: the only http(s) URLs allowed are outbound links listed in content (opened by the user)"""
    t = text
    for u in allowed_links: t = t.replace(u, '')
    t = t.replace(SVG_NS, '')
    for bad in ('http://', 'https://', '<link rel="stylesheet', 'src="http', '@import', 'url(http', 'src="//', "url(//"):
        assert bad not in t, '%s: external reference %s' % (name, bad)


# ---------------- icons (PNG written with zlib only) ----------------
def _png(w, h, px):
    raw = b''.join(b'\x00' + bytes(px[y * w * 4:(y + 1) * w * 4]) for y in range(h))
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')


def _seg_dist(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return ((px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2) ** 0.5


def icon_png(size, maskable=False):
    """the header logo: gradient disc with a 3-node tree; maskable = full-bleed square, glyph in the safe zone"""
    c0, c1, white = (0x6a, 0x5a, 0xe0), (0x14, 0xa0, 0x8d), (0xfb, 0xf8, 0xf1)
    k = size / 32.0                      # logo units -> px
    g = 0.72 if maskable else 1.0        # glyph scale
    nodes = [(16, 9.5), (10, 21.5), (22, 21.5)]
    segs = [(14.8, 11.6, 11.2, 19.4), (17.2, 11.6, 20.8, 19.4)]
    px = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            ux, uy = (x + 0.5) / k, (y + 0.5) / k              # logo units
            t = (ux + uy) / 64.0
            bg = [c0[i] + (c1[i] - c0[i]) * t for i in range(3)]
            if maskable:
                a_bg = 1.0
            else:
                d = ((ux - 16) ** 2 + (uy - 16) ** 2) ** 0.5 - 16
                a_bg = max(0.0, min(1.0, 0.5 - d * k))
            gx, gy = 16 + (ux - 16) / g, 16 + (uy - 16) / g    # glyph space
            dg = min([((gx - nx) ** 2 + (gy - ny) ** 2) ** 0.5 - 3.4 for nx, ny in nodes] +
                     [_seg_dist(gx, gy, *s) - 1.0 for s in segs])
            a_fg = max(0.0, min(1.0, 0.5 - dg * g * k)) * (1.0 if a_bg > 0 else 0)
            col = [bg[i] * (1 - a_fg) + white[i] * a_fg for i in range(3)]
            o = (y * size + x) * 4
            px[o:o + 4] = bytes([int(round(col[0])), int(round(col[1])), int(round(col[2])), int(round(255 * a_bg))])
    return _png(size, size, px)


ICON_SVG = ('<svg xmlns="%s" viewBox="0 0 32 32"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a5ae0"/>'
            '<stop offset="1" stop-color="#14a08d"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#lg)"/><g fill="none" stroke="#fbf8f1" '
            'stroke-width="2" stroke-linecap="round"><circle cx="16" cy="9.5" r="2.4" fill="#fbf8f1"/><circle cx="10" cy="21.5" r="2.4" fill="#fbf8f1"/>'
            '<circle cx="22" cy="21.5" r="2.4" fill="#fbf8f1"/><path d="M14.8 11.6 11.2 19.4M17.2 11.6l3.6 7.8"/></g></svg>\n' % SVG_NS)


SW = r"""/* service worker: cache-first, offline after the first visit. Generated by build.py */
var CACHE='kn-%(hash)s';
var ASSETS=%(assets)s;
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS.map(function(u){return new Request(u,{cache:'reload'});}));}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('kn-')===0&&k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
  var r=e.request;if(r.method!=='GET')return;
  var u=new URL(r.url);if(u.origin!==self.location.origin)return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(r,{ignoreSearch:true}).then(function(m){
      if(m)return m;
      if(r.mode==='navigate')return c.match('./index.html').then(function(i){return i||fetch(r);});
      return fetch(r).then(function(res){if(res&&res.ok&&res.type==='basic')c.put(r,res.clone());return res;});
    });
  }));
});
"""


def main():
    A = verify.load_all()
    js_all = ''.join(rd(f) for f in js_sources())
    reg = verify.js_registry(js_all)
    questions, errs, warns, images = verify.check_content(A, reg)
    errs += verify.solver_checks()
    for w in warns: print('WARN', w)
    if errs:
        print('ERRORS'); [print(' ', e) for e in errs]; sys.exit(1)
    links = [A['reg']['exam']['registration']['url']] if A['reg']['exam'].get('registration', {}).get('url') else []

    # ---- single offline file ----
    def data_uri(src):
        ext = src.rsplit('.', 1)[1].lower()
        return 'data:%s;base64,%s' % (MIME[ext], base64.b64encode(rd(os.path.join(verify.CONTENT, *src.split('/')), 'rb')).decode('ascii'))
    single = page(A, '<link rel="icon" href="data:,">', data_uri)
    assert_offline('single html', single, links)
    wr(EXE, single)

    # ---- docs/ for GitHub Pages ----
    keep = {'CNAME'}
    if os.path.isdir(DOCS):
        for n in os.listdir(DOCS):
            if n in keep: continue
            p = os.path.join(DOCS, n)
            shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
    head = ('<link rel="icon" href="icon.svg" type="image/svg+xml">\n<link rel="manifest" href="manifest.webmanifest">\n'
            '<link rel="apple-touch-icon" href="icon-192.png">')
    files = {'index.html': page(A, head, lambda s: s).encode('utf-8')}
    site = A['site']
    files['manifest.webmanifest'] = json.dumps({
        'name': site['brand'], 'short_name': 'کنکور ارشد', 'lang': 'fa', 'dir': 'rtl', 'start_url': './', 'scope': './',
        'display': 'standalone', 'background_color': '#f3efe6', 'theme_color': '#f3efe6',
        'icons': [{'src': 'icon.svg', 'sizes': 'any', 'type': 'image/svg+xml'},
                  {'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
                  {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
                  {'src': 'icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]},
        ensure_ascii=False, indent=1).encode('utf-8')
    files['icon.svg'] = ICON_SVG.encode('utf-8')
    files['icon-192.png'] = icon_png(192)
    files['icon-512.png'] = icon_png(512)
    files['icon-maskable-512.png'] = icon_png(512, maskable=True)
    for src in sorted(images): files[src] = rd(os.path.join(verify.CONTENT, *src.split('/')), 'rb')
    files['.nojekyll'] = b''
    h = hashlib.sha256(SW.encode('utf-8'))   # a change to the worker code also renames the cache
    for n in sorted(files): h.update(n.encode()); h.update(files[n])
    digest = h.hexdigest()[:12]
    assets = ['./'] + [n for n in sorted(files) if n != '.nojekyll']
    files['sw.js'] = (SW % {'hash': digest, 'assets': json.dumps(['./' + a if a != './' else a for a in assets])}).encode('utf-8')
    for n, b in files.items():
        if not n.endswith('.png') and not n.endswith('.webp') and not n.endswith('.jpg'):
            assert_offline('docs/' + n, b.decode('utf-8'), links)
        wr(os.path.join(DOCS, *n.split('/')), b)

    # ---- summary ----
    live = [c for c in A['courses'] if c.get('hasContent')]
    print('courses: %d in the 1406 registry (%d with content: %s; %d coming soon)' % (
        len(A['courses']), len(live), ', '.join(c['id'] for c in live), len(A['courses']) - len(live)))
    print('patterns: %d  (%s)' % (len(A['patterns']), ', '.join('%s %d' % (c['id'], sum(1 for p in A['patterns'] if p['course'] == c['id'])) for c in live)))
    by_c = {c['id']: sum(1 for q in questions if q.startswith(c['id'] + '-')) for c in live}
    years = sorted({q['year'] for q in questions.values()})
    print('questions: %d  per course %s  per year %s' % (len(questions), by_c, {y: sum(1 for q in questions.values() if q['year'] == y) for y in years}))
    print('self-tests: %s' % {c: len(s['ids']) for c, s in A['selftests'].items()})
    print('answer keys: all %d match keys/answer-keys.json and the official 1405 key; solver checks pass' % len(questions))
    print('tools: %d %s  figures: %d  tables: %d' % (len(reg['tool']), sorted(reg['tool']), len(reg['fig']), len(reg['table'])))
    print('review images: %d, %d KB total' % (len(images), sum(images.values()) // 1024))
    print('wrote %s (%d KB)' % (EXE, os.path.getsize(EXE) // 1024))
    print('wrote docs/ (%d files, cache kn-%s): %s' % (len(files), digest, ', '.join(sorted(files))))


if __name__ == '__main__':
    main()
