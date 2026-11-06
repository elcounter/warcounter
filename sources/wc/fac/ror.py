# Regiments of Renown : python3 ror.py -> ror_en.json
import os, re, json, glob
import xml.etree.ElementTree as ET
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','bsdata')+'/'
G='{http://www.battlescribe.net/schema/gameSystemSchema}'; C='{http://www.battlescribe.net/schema/catalogueSchema}'
tn=lambda e:e.tag.split('}')[1]
gst=ET.parse(D+'Age of Sigmar 4.0.gst').getroot(); rr=ET.parse(D+'Regiments of Renown.cat').getroot()
cats={}
for f in glob.glob(D+'*.cat'):
    m=re.search(r'<catalogue [^>]*name="([^"]*)" id="([^"]*)"',open(f).read(3000))
    if m: cats[m.group(2)]=m.group(1)
fe={f.attrib['id']:f for f in gst.iter(G+'forceEntry')}
ghb=[f for f in gst.iter(G+'forceEntry') if f.attrib['name']=="General's Handbook 2025-26"][0]
from extract import ability as abil, chars
out=[]
for l in ghb.find(G+'forceEntryLinks'):
    f=fe.get(l.attrib['targetId'])
    if f is None: continue
    nm=f.attrib['name']
    pts=next((int(float(c.attrib['value'])) for c in f.iter(G+'cost') if c.attrib['name']=='pts'),0)
    if not pts: continue
    facs=sorted({cats[c.attrib['childId']] for c in f.iter(G+'condition') if c.attrib.get('childId') in cats and c.attrib.get('type')=='instanceOf'} - {'۞ Regiments of Renown'})
    units=[]
    for el in rr.iter(C+'entryLink'):
        for mg in el.iter(C+'modifierGroup'):
            if any(c.attrib.get('childId')==f.attrib['id'] for c in mg.iter(C+'condition')):
                v=[m.attrib['value'] for m in mg.iter(C+'modifier') if m.attrib['field'] not in ('hidden','name')]
                if v and el.attrib['name']!='Regiment of Renown: '+nm: units.append((el.attrib['name'],int(float(v[0]))))
    se=next((e for e in rr.iter(C+'selectionEntry') if e.attrib['name']=='Regiment of Renown: '+nm),None)
    if se is None:
        se=next((e for e in rr.iter(C+'entryLink') if e.attrib['name']=='Regiment of Renown: '+nm),None)
        if se is not None: se=next((e for e in rr.iter(C+'selectionEntry') if e.attrib.get('id')==se.attrib['targetId']),None)
    ab=[]
    if se is not None:
        for p in se.iter(C+'profile'):
            ch={c.attrib['name']:(c.text or '').strip() for c in p.iter(C+'characteristic')}
            if p.attrib.get('typeName','').startswith('Ability'): ab.append(abil(p))
    out.append({'name':nm,'pts':pts,'factions':facs,'units':units,'abilities':ab})
# Warscrolls absents des factions de l'app
have=set()
for f in glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)),'*_en.json')):
    d=json.load(open(f))
    if isinstance(d,dict): have|={u['name'] for u in d.get('units',[])}
need={n for o in out for n,_ in o['units']}-have
extra=[]
for f in sorted(glob.glob(D+'*.cat')):
    if not need: break
    r=ET.parse(f).getroot()
    for se in r.iter(C+'selectionEntry'):
        n=se.attrib.get('name')
        if se.attrib.get('type')!='unit' or n not in need: continue
        if not any(p.attrib.get('typeName')=='Unit' for p in se.iter(C+'profile')): continue
        need.discard(n)
        kws=[c.attrib['name'] for c in se.iter(C+'categoryLink')]
        size=0
        for m in se.iter(C+'selectionEntry'):
            if m.attrib.get('type')=='model':
                for c in m.findall(C+'constraints/'+C+'constraint'):
                    if c.attrib['type']=='min' and c.attrib['scope']=='parent': size+=int(float(c.attrib['value']))
        u={'name':n,'pts':0,'size':size or 1,'kw':kws,'stats':{},'weapons':[],'abilities':[]}; seen=set()
        for p in se.iter(C+'profile'):
            t=p.attrib.get('typeName','')
            if t=='Unit' and not u['stats']: u['stats']=chars(p)
            elif t in('Melee Weapon','Ranged Weapon') and (t, p.attrib['name']) not in seen:
                seen.add((t, p.attrib['name'])); d=chars(p); d['name']=p.attrib['name']; d['kind']=t; u['weapons'].append(d)
            elif t.startswith('Ability') and ('a',p.attrib['name']) not in seen:
                seen.add(('a',p.attrib['name'])); u['abilities'].append(abil(p))
        extra.append(u)
print('Warscrolls introuvables :', sorted(need))
out={'regiments':out,'units':extra}
json.dump(out,open('ror_en.json','w'),ensure_ascii=False,indent=1)
print(len(out))
for o in out['regiments']: print(o['pts'],o['name'],'|',o['units'],'|',[a['name'] for a in o['abilities']],'|',len(o['factions']))
