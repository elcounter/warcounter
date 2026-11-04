import os
import xml.etree.ElementTree as ET, json, re, sys, os
D=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'bsdata') + '/'
B='{http://www.battlescribe.net/schema/catalogueSchema}'
tn=lambda e:e.tag.split('}')[1]
ROOTS={}
def load(f):
    if f not in ROOTS: ROOTS[f]=ET.parse(D+f).getroot()
    return ROOTS[f]
for f in ['Lores.cat','Age of Sigmar 4.0.gst']: load(f)
def chars(p): return {c.attrib['name']:(c.text or '').strip() for c in p.iter() if tn(c)=='characteristic'}
def attrs(p): return {c.attrib['name']:(c.text or '').strip() for c in p.iter() if tn(c)=='attribute'}
def ability(p):
    c=chars(p); a=attrs(p)
    return {'name':p.attrib['name'],'kind':p.attrib.get('typeName'),'color':a.get('Color',''),'timing':c.get('Timing',''),'declare':c.get('Declare',''),
            'effect':c.get('Effect',''),'keywords':c.get('Keywords',''),'cast':c.get('Casting Value',''),'chant':c.get('Chanting Value',''),'cost':c.get('Cost','')}
SKIP_GROUPS=re.compile(r'Battle Wounds|Paths|Path to Glory|Renown|Spearhead|Veteran|Scars|Rank|Unit Upgrades', re.I)
def extract(fac):
    main=load(fac+'.cat'); lib=load(fac+' - Library.cat')
    GHY=set(p.attrib['id'] for r in (main, lib) for p in r.iter(B+'publication') if 'Ghyran' in p.attrib.get('name',''))
    def ghy(e): return e is not None and e.attrib.get('publicationId') in GHY
    byid={}
    for r in ROOTS.values():
        for e in r.iter():
            if 'id' in e.attrib: byid[e.attrib['id']]=e
    pts={}; hidden_links=set()
    for el in main.iter(B+'entryLink'):
        c=el.find(B+'costs')
        if c is not None:
            for x in c:
                if x.attrib.get('name')=='pts' and el.attrib['name'] not in pts: pts[el.attrib['name']]=int(float(x.attrib['value']))
    linked=set(el.attrib.get('name') for el in main.iter(B+'entryLink'))
    units=[]
    for se in lib.find(B+'sharedSelectionEntries'):
        if se.attrib.get('type')!='unit': continue
        n=se.attrib['name']
        kws=[c.attrib['name'] for c in se.iter() if tn(c)=='categoryLink']
        if ghy(se): continue
        terrain='FACTION TERRAIN' in kws
        if 'Legends' in kws or 'Scourge of Ghyran' in n or 'Anvil of Apotheosis' in n: continue
        if n not in pts:
            if terrain and n in linked: pts[n]=0
            else: continue
        size=0
        for m in se.iter(B+'selectionEntry'):
            if m.attrib.get('type')=='model':
                for c in m.findall(B+'constraints/'+B+'constraint'):
                    if c.attrib['type']=='min' and c.attrib['scope']=='parent': size+=int(float(c.attrib['value']))
        u={'name':n,'pts':pts.get(n),'size':size or 1,'kw':kws,'stats':{},'weapons':[],'abilities':[]}
        if terrain: u['terrain']=True
        seen=set()
        for p in se.iter(B+'profile'):
            t=p.attrib.get('typeName','')
            if t=='Unit' and not u['stats']: u['stats']=chars(p)
            elif t in('Melee Weapon','Ranged Weapon') and p.attrib['name'] not in seen:
                seen.add(p.attrib['name']); d=chars(p); d['name']=p.attrib['name']; d['kind']=t; u['weapons'].append(d)
            elif t.startswith('Ability') and ('a',p.attrib['name']) not in seen:
                seen.add(('a',p.attrib['name'])); u['abilities'].append(ability(p))
        units.append(u)
    def resolve(e): return byid.get(e.attrib['targetId']) if tn(e)=='entryLink' else e
    groups=[]
    def collect(g, title):
        items=[]
        for se in g.iter():
            if tn(se) not in('selectionEntry','entryLink'): continue
            if se.attrib.get('hidden')=='true': continue
            tgt=resolve(se)
            if tgt is None or tgt.attrib.get('hidden')=='true': continue
            if 'Scourge of Ghyran' in (se.attrib.get('name') or '') or ghy(se) or ghy(tgt): continue
            ps=[ability(p) for p in tgt.iter(B+'profile') if p.attrib.get('typeName','').startswith('Ability')]
            if not ps: continue
            cost=None
            for cs in (se.find(B+'costs'), tgt.find(B+'costs')):
                if cs is not None:
                    for x in cs:
                        if x.attrib.get('name')=='pts' and float(x.attrib['value'])>0: cost=int(float(x.attrib['value']))
            if any(i['name']==se.attrib.get('name') for i in items): continue
            items.append({'name':se.attrib.get('name'),'pts':cost,'abilities':ps})
        if items: groups.append({'title':title,'items':items})
    for el in main.iter(B+'entryLink'):
        if el.attrib.get('name','').startswith('Battle Traits'):
            t=resolve(el); ps=[ability(p) for p in t.iter(B+'profile') if p.attrib.get('typeName','').startswith('Ability')]
            groups.append({'title':'Battle Traits','items':[{'name':'Battle Traits','pts':None,'abilities':ps}]}); break
    sg=main.find(B+'sharedSelectionEntryGroups')
    for g in (sg if sg is not None else []):
        if SKIP_GROUPS.search(g.attrib['name']): continue
        collect(g, g.attrib['name'])
    return {'name':fac,'units':units,'groups':groups}
if __name__=='__main__':
    fac=sys.argv[1]; slug=sys.argv[2]
    d=extract(fac)
    json.dump(d,open(f'{os.path.dirname(os.path.abspath(__file__))}/{slug}_en.json','w'),indent=1,ensure_ascii=False)
    print(fac, len(d['units']),'units')
    for g in d['groups']: print('  ',g['title'],[ (i['name'],i['pts'],len(i['abilities'])) for i in g['items']])
