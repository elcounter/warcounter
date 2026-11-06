# Armées de renom : python3 aor.py -> aor_en.json (toutes les AoR de BSData)
import sys, os, glob, json, re
sys.argv = sys.argv[:1]
import extract as X
D = X.D; B = X.B
FILES = [os.path.basename(f)[:-4] for f in sorted(glob.glob(D + '* - *.cat')) if not re.search(r'Library|LEGENDS|Path to Glory', f)]
for f in glob.glob(D + '*.cat'): X.load(os.path.basename(f))
byid = {}
for r in X.ROOTS.values():
    for e in r.iter():
        if 'id' in e.attrib: byid.setdefault(e.attrib['id'], e)
def unit_of(se, pts):
    kws = [c.attrib['name'] for c in se.iter(B + 'categoryLink')]
    size = 0
    for m in se.iter(B + 'selectionEntry'):
        if m.attrib.get('type') == 'model':
            for c in m.findall(B + 'constraints/' + B + 'constraint'):
                if c.attrib['type'] == 'min' and c.attrib['scope'] == 'parent': size += int(float(c.attrib['value']))
    u = {'name': se.attrib['name'], 'pts': pts, 'size': size or 1, 'kw': kws, 'stats': {}, 'weapons': [], 'abilities': []}; seen = set()
    for p in se.iter(B + 'profile'):
        t = p.attrib.get('typeName', '')
        if t == 'Unit' and not u['stats']: u['stats'] = X.chars(p)
        elif t in ('Melee Weapon', 'Ranged Weapon') and (t, p.attrib['name']) not in seen:
            seen.add((t, p.attrib['name'])); d = X.chars(p); d['name'] = p.attrib['name']; d['kind'] = t; u['weapons'].append(d)
        elif t.startswith('Ability') and ('a', p.attrib['name']) not in seen:
            seen.add(('a', p.attrib['name'])); u['abilities'].append(X.ability(p))
    return u
def cost(e):
    for x in e.iter(B + 'cost'):
        if x.attrib.get('name') == 'pts': return int(float(x.attrib['value']))
    return None
out = []
for n in FILES:
    par = n.split(' - ')[0]
    lib = par + ' - Library.cat'
    orig = X.load
    X.load = lambda f, _o=orig: _o(lib if f == n + ' - Library.cat' else f)
    try: d = X.extract(n)
    finally: X.load = orig
    have = {u['name'] for u in d['units']}
    main = X.load(n + '.cat')
    # Unités hors bibliothèque de la faction (définies dans l'AoR ou dans une autre bibliothèque)
    for el in list(main.iter(B + 'entryLink')) + [e for sec in ('selectionEntries', 'sharedSelectionEntries') if main.find(B + sec) is not None for e in main.find(B + sec)]:
        tg = byid.get(el.attrib.get('targetId')) if X.tn(el) == 'entryLink' else el
        if tg is None or tg.attrib.get('type') != 'unit' or el.attrib.get('hidden') == 'true': continue
        nm = el.attrib.get('name') or tg.attrib['name']
        if nm in have or re.search(r'Scourge of Ghyran|Anvil of Apotheosis|Regiment of Renown', nm): continue
        if not any(p.attrib.get('typeName') == 'Unit' for p in tg.iter(B + 'profile')): continue
        pts = cost(el) if el.find(B + 'costs') is not None else None
        if pts is None: pts = cost(tg)
        if not pts: continue
        u = unit_of(tg, pts); u['name'] = nm; d['units'].append(u); have.add(nm)
    d['name'] = n.split(' - ', 1)[1]; d['faction'] = par
    out.append(d)
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'aor_en.json'), 'w'), indent=1, ensure_ascii=False)
for d in out: print(d['faction'], '|', d['name'], len(d['units']), [(g['title'], len(g['items'])) for g in d['groups']])
