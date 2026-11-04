# Domaines de manifestations génériques (Lores.cat de BSData) -> universal_en.json
import os, json, xml.etree.ElementTree as ET
here = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(here, '..', '..', 'bsdata')
B = '{http://www.battlescribe.net/schema/catalogueSchema}'
r = ET.parse(os.path.join(D, 'Lores.cat')).getroot()
byid = {e.attrib['id']: e for e in r.iter() if 'id' in e.attrib}
LORES = ['Aetherwrought Machineries', 'Forbidden Power', 'Krondspine Incarnate', 'Morbid Conjuration', 'Primal Energy', 'Twilit Sorceries']
def chars(p): return {c.attrib['name']: (c.text or '') for c in p.iter(B + 'characteristic')}
def attrs(p): return {a.attrib['name']: (a.text or '') for a in p.iter(B + 'attribute')}
out = []
for name in LORES:
    grp = [e for e in r.iter(B + 'selectionEntryGroup') if e.attrib.get('name') == name and 'publicationId' not in e.attrib][0]
    abs_, seen = [], set()
    def walk(e, depth=0):
        if depth > 4: return
        for p in e.iter(B + 'profile'):
            if p.attrib.get('typeName', '').startswith('Ability') and p.attrib['name'] not in seen:
                seen.add(p.attrib['name']); c = chars(p); a = attrs(p)
                abs_.append({'name': p.attrib['name'], 'kind': p.attrib['typeName'], 'timing': c.get('Timing', ''), 'declare': c.get('Declare', ''),
                             'effect': c.get('Effect', ''), 'keywords': c.get('Keywords', ''), 'cast': c.get('Casting Value', ''), 'chant': c.get('Chanting Value', ''),
                             'cost': c.get('Cost', ''), 'color': a.get('Color', '')})
        for l in e.iter(B + 'entryLink'):
            tg = byid.get(l.attrib.get('targetId'))
            if tg is not None: walk(tg, depth + 1)
    walk(grp)
    out.append({'name': name, 'abilities': abs_})
json.dump(out, open(os.path.join(here, 'universal_en.json'), 'w'), indent=1, ensure_ascii=False)
print([(o['name'], len(o['abilities'])) for o in out])
