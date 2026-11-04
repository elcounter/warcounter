# python3 aor_dump.py "Faction1,Faction2" : textes à traduire des armées de renom de ces factions
import json, glob, os, re, sys, importlib
from convert import TEMPLATES, clean
here = os.path.dirname(os.path.abspath(__file__))
FACS = sys.argv[1].split(',')
A = [d for d in json.load(open(os.path.join(here, 'aor_en.json'))) if d['faction'] in FACS]
# traductions existantes réutilisables (même nom ET même texte anglais)
src = {}
for f in glob.glob(os.path.join(here, '*_en.json')):
    d = json.load(open(f))
    if not isinstance(d, dict) or 'units' not in d: continue
    slug = os.path.basename(f)[:-8]
    try: T = importlib.import_module('fr_' + slug).T
    except Exception: continue
    for u in d['units']:
        for a in u['abilities']:
            if a['name'] in T: src[(a['name'], clean(a['effect']).strip())] = T[a['name']]
    for g in d.get('groups', []):
        for i in g['items']:
            for a in i['abilities']:
                if a['name'] in T: src[(a['name'], clean(a['effect']).strip())] = T[a['name']]
known = {f: d for f in glob.glob(os.path.join(here, '*_en.json')) for d in [json.load(open(f))] if isinstance(d, dict)}
facunits = {u['name'] for d in known.values() for u in d.get('units', [])}
need = {}
def want(key, a):
    eff = clean(a['effect']).strip()
    if any(re.match(p, eff) for p, _ in TEMPLATES): return
    if (a['name'], eff) in src: return
    need.setdefault(key, a)
for d in A:
    for g in d['groups']:
        for i in g['items']:
            for a in i['abilities']: want(a['name'], a)
    for u in d['units']:
        if u['name'] in facunits: continue
        for a in u['abilities']: want(u['name'] + '::' + a['name'], a)
for k, a in need.items():
    print(f"## {k}\nT: {a['timing']}\nD: {clean(a['declare']).strip()}\nE: {clean(a['effect']).strip()}\n")
print(len(need), file=sys.stderr)
