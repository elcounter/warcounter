# Warscrolls de manifestations : python3 manif.py -> manif_en.json
# Génériques (gst) ; les factions s'ajoutent par paquets (liste FILES).
import sys, os, json
sys.argv = sys.argv[:1]
import extract as X
B = X.B; D = X.D
import xml.etree.ElementTree as ET
FILES = ['Age of Sigmar 4.0.gst']
out = []
for f in FILES:
    r = ET.parse(D + f).getroot(); seen_u = set()
    for se in r.iter():
        if not se.tag.endswith('selectionEntry') or se.attrib.get('type') != 'unit' or se.attrib['name'] in seen_u: continue
        mp = [p for p in se.iter() if p.tag.endswith('profile') and p.attrib.get('typeName') == 'Manifestation']
        if not mp: continue
        seen_u.add(se.attrib['name'])
        kws = [c.attrib['name'] for c in se.iter() if c.tag.endswith('categoryLink')]
        u = {'name': se.attrib['name'], 'src': f, 'kw': kws, 'stats': X.chars(mp[0]), 'weapons': [], 'abilities': []}; seen = set()
        for p in se.iter():
            if not p.tag.endswith('profile'): continue
            t = p.attrib.get('typeName', '')
            if t in ('Melee Weapon', 'Ranged Weapon') and (t, p.attrib['name']) not in seen:
                seen.add((t, p.attrib['name'])); d = X.chars(p); d['name'] = p.attrib['name']; d['kind'] = t; u['weapons'].append(d)
            elif t.startswith('Ability') and ('a', p.attrib['name']) not in seen:
                seen.add(('a', p.attrib['name'])); u['abilities'].append(X.ability(p))
        out.append(u)
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'manif_en.json'), 'w'), indent=1, ensure_ascii=False)
print(len(out), 'manifestations')
