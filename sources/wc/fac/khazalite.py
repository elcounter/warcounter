#!/usr/bin/env python3
"""Khazalite Holds : khazalite_fr.json (déjà traduit) -> faction au format factions.json."""
import json, os, re
from convert import kw_line

HERE = os.path.dirname(os.path.abspath(__file__))
CRIT = {'2 Hits':'2hits', '2hits':'2hits', 'Mortel':'mortal', 'mortal':'mortal', 'Auto-wound':'auto', 'auto':'auto', 'none':'none'}
EXTRA = [('Companion', 'Compagnon'), ('Shoot in Combat', 'Tir en mêlée'), ('MONSTER', 'MONSTRE'), ('INFANTRY', 'INFANTERIE'), ('CAVALRY', 'CAVALERIE')]
MANIF = {'Molten Infernoth', 'Runic Fyrewall', 'Zharrgron Flame-spitter'}

def cat(t):
    t = (t or '').lower()
    for k, c in [('héros', 'hero'), ('tir', 'shoot'), ('combat', 'fight'), ('charge', 'charge'), ('mouvement', 'move'), ('fin ', 'end')]:
        if k in t: return c
    return 'passive'

def ab(a, **kw):
    o = {'c': a.get('c') if a.get('c') in ('hero', 'shoot', 'fight', 'charge', 'move', 'end', 'defense', 'passive') else cat(a.get('t')),
         't': a.get('t') or 'Passif', 'n': a['n'], 'x': a['x']}
    o.update(kw); return o

def weapon(w):
    o = dict(w); o['crit'] = CRIT.get(w['crit'], 'none')
    ex = []
    for e in w.get('extra', []):
        if e.startswith('Battle Damaged'): continue
        for a, b in EXTRA: e = e.replace(a, b)
        ex.append(e)
    o['extra'] = ex
    return o

def build():
    d = json.load(open(os.path.join(HERE, 'khazalite_fr.json')))
    units = []
    for u in d['units']:
        if u['en'] in MANIF: continue
        o = {'id': u['id'], 'en': u['en'], 'pts': u['pts'], 'size': u['size'], 'stats': u['stats'],
             'weapons': [weapon(w) for w in sorted(u['weapons'], key=lambda w: w['range'] == 'Mêlée')],
             'abilities': [ab(a) for a in u['abilities']], 'kw': kw_line(u['kw'].split(', '))}
        if u.get('hero') or 'HERO' in u['kw'].split(', '): o['hero'] = True
        if 'FACTION TERRAIN' in u['kw']: o['terrain'] = True
        units.append(o)
    units.sort(key=lambda o: (not o.get('hero'), o['en']))
    def split(n):
        a, _, b = n.partition(' — '); return a, (b or a)
    forms = []
    for f in d['formations']:
        fn, an = split(f['n']); forms.append({'n': fn, 'pts': None, 'abs': [ab({'n': an, 't': f.get('t'), 'x': f['x']})]})
    simple = lambda L: [{'n': i['n'], 'pts': i.get('pts'), 'abs': [ab(i)]} for i in L]
    lore = lambda L, key: {'n': L['name'], 'pts': L.get('pts') or None,
                          'abs': [ab({**i, 'c': 'hero'}, **({key: i['cv']} if i.get('cv') else {})) for i in L['items']]}
    P, S = d['prayers'], d['spells']
    secs = [
        {'title': 'Traits de bataille', 'items': [{'n': 'Battle Traits', 'pts': None, 'abs': [ab(a) for a in d['battle_traits']]}]},
        {'title': 'Formations de bataille', 'items': forms},
        {'title': 'Traits héroïques', 'items': simple(d['heroic_traits'])},
        {'title': 'Artefacts de pouvoir', 'items': simple(d['artefacts'])},
        {'title': 'Sorts', 'items': [lore(S[k], 'cast') for k in S]},
        {'title': 'Prières', 'items': [lore(P[k], 'chant') for k in P if k != 'magmic_invocations']},
        {'title': 'Manifestations', 'items': [lore(P['magmic_invocations'], 'chant')]},
        {'title': 'Marks of Vulcatrix', 'items': simple(d['marks_of_vulcatrix'])},
    ]
    return {'id': 'khazalite', 'en': 'Khazalite Holds', 'img': 'khazalite', 'units': units, 'sections': secs}

def ror(ids):
    d = json.load(open(os.path.join(HERE, 'khazalite_fr.json')))
    out = []
    for r in d['regiments_of_renown']:
        m = re.search(r'inclus dans : (.+?)\.?$', ' '.join(r['x']))
        facs = sorted(ids[n.strip()] for n in (m.group(1).split(',') if m else []) if n.strip() in ids)
        units = [[re.sub(r' \(\d+\)$', '', s.split(' ', 1)[1]), int(s.split(' ', 1)[0])] for s in r['units']]
        out.append({'en': r['n'], 'pts': r['pts'], 'facs': facs, 'aors': [], 'units': units, 'abs': []})
    return out
