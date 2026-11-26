"""Put the VinUI pages on WordPress (vinish.dev/ui). Uses ~/myapps/vinish-games/tools/wp.py, which reads
that repo's .env; credentials are never printed.

Input: wp/out (from `node scripts/wp-export.mjs`). State (WordPress ids): wp/state.json.

  python3 wp/publish.py plan       what would be created or updated, changes nothing
  python3 wp/publish.py patterns   create or update the 3 synced patterns (header, sidebar, footer)
  python3 wp/publish.py draft      create or update every page as a draft, with Yoast title and description
  python3 wp/publish.py seo        set the Yoast title and description again (all pages)
  python3 wp/publish.py publish    publish every page (parents first)
  python3 wp/publish.py check      fetch the live pages and check title, description and VinUI markup

Before any page or pattern is changed, its current content is saved to wp/backups/<date>/.
Pages get the Blocksy settings of a published game page (no theme header, footer or title; full width).
"""
import datetime, json, os, re, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.expanduser('~/myapps/vinish-games/tools'))
import wp  # noqa: E402

OUT = os.path.join(HERE, 'out')
STATE_FILE = os.path.join(HERE, 'state.json')
BACKUP = os.path.join(HERE, 'backups', datetime.date.today().isoformat())
TEMPLATE_PAGE = 31432  # Glassback: Blocksy settings with the theme header, footer and title off
PATTERN_TITLES = {'header': 'VinUI header', 'sidebar': 'VinUI sidebar', 'footer': 'VinUI footer'}

S = json.load(open(STATE_FILE)) if os.path.exists(STATE_FILE) else {'patterns': {}, 'pages': {}}
def save(): json.dump(S, open(STATE_FILE, 'w'), indent=1, sort_keys=True)

EXPORT = json.load(open(os.path.join(OUT, 'pages.json')))
PAGES = sorted(EXPORT['pages'], key=lambda p: (p['path'].count('/'), p['path']))  # parents first
PATTERNS = {k: open(os.path.join(OUT, 'patterns', k + '.html')).read().strip() for k in PATTERN_TITLES}


def ok(st, j, what):
    assert st in (200, 201), (what, st, str(j)[:300])
    return j


def backup(kind, pid):
    st, j = wp.req('GET', f'/wp-json/wp/v2/{kind}/{pid}?context=edit')
    ok(st, j, f'read {kind} {pid}')
    os.makedirs(BACKUP, exist_ok=True)
    path = os.path.join(BACKUP, f'{kind}-{pid}.raw.html')
    if not os.path.exists(path):  # keep the first (oldest) copy of the day
        open(path, 'w').write(j['content']['raw'])
    return j


def yoast_title(page):
    """Yoast always ends the title with " • Vinish.Dev", so the site's own " · VinUI" ending is dropped."""
    return re.sub(r'\s*·\s*VinUI$', '', page['seoTitle']) + ' %%sep%% %%sitename%%'


def live_title(page): return re.sub(r'\s*·\s*VinUI$', '', page['seoTitle']) + ' • Vinish.Dev'


def set_seo(pid, page):
    st, y = wp.req('POST', '/wp-json/wp-abilities/v1/abilities/yoast-seo/update-post-seo-data/run',
                   {'input': {'post_id': pid, 'seo_title': yoast_title(page), 'meta_description': page['description']}})
    return st


def html_block(html): return '<!-- wp:html -->\n' + html + '\n<!-- /wp:html -->'


def content(page):
    refs = S['patterns']
    out = []
    for b in page['blocks']:
        if 'pattern' in b:
            assert b['pattern'] in refs, 'run `patterns` first'
            out.append('<!-- wp:block {"ref":%d} /-->' % refs[b['pattern']])
        else:
            out.append(html_block(b['html']))
    return '\n\n'.join(out)


def find_page(slug, parent):
    st, j = wp.req('GET', f'/wp-json/wp/v2/pages?slug={slug}&parent={parent}&status=publish,draft,private,pending,future&context=edit&_fields=id,slug,status,parent')
    ok(st, j, 'find ' + slug)
    return j[0] if j else None


def cmd_plan():
    for k in PATTERN_TITLES:
        print('pattern', k.ljust(8), 'update' if k in S['patterns'] else 'create', len(PATTERNS[k]), 'chars')
    for p in PAGES:
        print('page', p['path'].ljust(36), 'update' if p['path'] in S['pages'] else 'create', '|', p['title'], '|', p['seoTitle'][:60], '|', sum(len(b.get('html', '')) for b in p['blocks']) // 1024, 'KB')
    print(len(PAGES), 'pages, css', EXPORT['css'])


def cmd_patterns():
    for k, title in PATTERN_TITLES.items():
        data = {'title': title, 'content': html_block(PATTERNS[k]), 'status': 'publish', 'wp_pattern_sync_status': ''}
        if k in S['patterns']:
            backup('blocks', S['patterns'][k])
            st, j = wp.req('POST', f"/wp-json/wp/v2/blocks/{S['patterns'][k]}", data)
        else:
            st, j = wp.req('POST', '/wp-json/wp/v2/blocks', data)
        j = ok(st, j, 'pattern ' + k)
        S['patterns'][k] = j['id']; save()
        print('pattern', k, j['id'], j['status'], 'synced' if not j.get('wp_pattern_sync_status') else j.get('wp_pattern_sync_status'))


def cmd_draft():
    st, t = wp.req('GET', f'/wp-json/wp/v2/pages/{TEMPLATE_PAGE}?context=edit&_fields=blocksy_meta,author')
    ok(st, t, 'template page')
    author = int(wp.E.get('WP_AUTHOR_ID') or t['author'])
    for p in PAGES:
        parent = S['pages'][p['parent']] if p['parent'] else 0
        assert p['parent'] is None or p['parent'] in S['pages'], ('parent missing', p['path'])
        data = {'title': p['title'], 'slug': p['slug'], 'parent': parent, 'content': content(p),
                'comment_status': 'closed', 'ping_status': 'closed', 'blocksy_meta': t['blocksy_meta'], 'author': author}
        pid = S['pages'].get(p['path'])
        if pid:
            cur = backup('pages', pid)
            if cur['status'] != 'publish': data['status'] = 'draft'
            st, j = wp.req('POST', f'/wp-json/wp/v2/pages/{pid}', data)
        else:
            assert find_page(p['slug'], parent) is None, ('a page with this slug already exists here', p['path'])
            data['status'] = 'draft'
            st, j = wp.req('POST', '/wp-json/wp/v2/pages', data)
        j = ok(st, j, 'page ' + p['path'])
        assert j['slug'] == p['slug'], ('WordPress changed the slug', p['path'], j['slug'])
        S['pages'][p['path']] = j['id']; save()
        print(j['status'].ljust(7), j['id'], p['path'].ljust(36), 'yoast', set_seo(j['id'], p))
        time.sleep(0.3)


def cmd_seo():
    for p in PAGES:
        print(p['path'].ljust(36), 'yoast', set_seo(S['pages'][p['path']], p), '|', live_title(p))


def cmd_publish():
    for p in PAGES:
        pid = S['pages'][p['path']]
        st, j = wp.req('POST', f'/wp-json/wp/v2/pages/{pid}', {'status': 'publish'})
        j = ok(st, j, 'publish ' + p['path'])
        print('published', j['link'])
        time.sleep(0.3)


def cmd_check():
    bad = 0
    for p in PAGES:
        try:
            st, h = wp.fetch('https://vinish.dev' + p['path'])
        except Exception as e:
            st, h = getattr(e, 'code', 0), ''
        t = re.search(r'<title>(.*?)</title>', h, re.S)
        d = re.search(r'<meta name="description" content="([^"]*)"', h)
        title = t and t.group(1).replace('&amp;', '&').replace('&#039;', "'")
        problems = []
        if st != 200: problems.append(f'status {st}')
        if h and h.count('class="vinui-site') != 1: problems.append('vinui-site x%d' % h.count('class="vinui-site'))
        if h and EXPORT['css'] not in h: problems.append('css missing')
        if h and 'id="sidebar"' not in h and any(b.get('pattern') == 'sidebar' for b in p['blocks']): problems.append('sidebar missing')
        if title and title.replace('&#8226;', '•') != live_title(p).replace('&amp;', '&'): problems.append('title: ' + title)
        if not d: problems.append('no meta description')
        bad += bool(problems)
        print('ok ' if not problems else 'BAD', p['path'].ljust(36), '; '.join(problems))
    print(len(PAGES) - bad, 'of', len(PAGES), 'pages ok')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    {'plan': cmd_plan, 'patterns': cmd_patterns, 'draft': cmd_draft, 'seo': cmd_seo, 'publish': cmd_publish, 'check': cmd_check}.get(cmd, lambda: print(__doc__))()
