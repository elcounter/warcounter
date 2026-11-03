import os
import xml.etree.ElementTree as ET, json, re, sys
B='{http://www.battlescribe.net/schema/catalogueSchema}'
G='{http://www.battlescribe.net/schema/gameSystemSchema}'
D=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'bsdata') + '/'
def load(f): return ET.parse(D+f).getroot()
lib=load('Helsmiths of Hashut - Library.cat'); main=load('Helsmiths of Hashut.cat'); lores=load('Lores.cat'); gst=load('Age of Sigmar 4.0.gst')
ALL=[lib,main,lores,gst]
def tagname(e): return e.tag.split('}')[1]
def chars(p): return {c.attrib['name']:(c.text or '').strip() for c in p.iter() if tagname(c)=='characteristic'}
def attrs(p): return {c.attrib['name']:(c.text or '').strip() for c in p.iter() if tagname(c)=='attribute'}
def ability(p):
    c=chars(p); a=attrs(p)
    return {'name':p.attrib['name'],'kind':p.attrib.get('typeName'),'color':a.get('Color',''),'type':a.get('Type',''),
            'timing':c.get('Timing',''),'declare':c.get('Declare',''),'effect':c.get('Effect',''),'keywords':c.get('Keywords',''),
            'cast':c.get('Casting Value',''),'chant':c.get('Chanting Value',''),'cost':c.get('Cost','')}
byid={}
for root in ALL:
    for e in root.iter():
        if 'id' in e.attrib: byid[e.attrib['id']]=e
def resolve(e):
    if tagname(e)=='entryLink': return byid.get(e.attrib['targetId'])
    return e
def profiles(e):
    return [p for p in e.iter() if tagname(p)=='profile']
out={'units':[],'groups':{}}
# points from main entryLinks
pts={}
for el in main.find(B+'entryLinks'):
    c=el.find(B+'costs')
    if c is not None:
        for x in c:
            if x.attrib.get('name')=='pts': pts[el.attrib['name']]=int(float(x.attrib['value']))
for se in lib.find(B+'sharedSelectionEntries'):
    if se.attrib.get('type')!='unit': continue
    u={'name':se.attrib['name'],'pts':pts.get(se.attrib['name']),'kw':[c.attrib['name'] for c in se.iter() if tagname(c)=='categoryLink'],'stats':{},'weapons':[],'abilities':[]}
    models=[m for m in se.iter() if tagname(m)=='selectionEntry' and m.attrib.get('type')=='model']
    size=0
    for m in models:
        for c in m.findall(B+'constraints/'+B+'constraint'):
            if c.attrib['type']=='min' and c.attrib['scope']=='parent': size+=int(float(c.attrib['value']))
    u['size']=size
    seen=set()
    for p in profiles(se):
        t=p.attrib.get('typeName')
        if t=='Unit': u['stats']=chars(p)
        elif t in('Melee Weapon','Ranged Weapon'):
            if p.attrib['name'] in seen: continue
            seen.add(p.attrib['name']); d=chars(p); d['name']=p.attrib['name']; d['kind']=t; u['weapons'].append(d)
        elif t and t.startswith('Ability'):
            if ('a',p.attrib['name']) in seen: continue
            seen.add(('a',p.attrib['name'])); u['abilities'].append(ability(p))
    out['units'].append(u)
# groups in main
for g in main.find(B+'sharedSelectionEntryGroups'):
    items=[]
    for se in g.iter():
        if tagname(se) in('selectionEntry','entryLink'):
            tgt=resolve(se)
            if tgt is None: continue
            ps=[ability(p) for p in profiles(tgt) if p.attrib.get('typeName','').startswith('Ability')]
            if ps:
                c=tgt.find(B+'costs'); cost=None
                for x in (se.find(B+'costs') if se.find(B+'costs') is not None else (c if c is not None else [])):
                    if x.attrib.get('name')=='pts' and float(x.attrib['value'])>0: cost=int(float(x.attrib['value']))
                items.append({'name':se.attrib.get('name'),'pts':cost,'abilities':ps})
    out['groups'][g.attrib['name']]=items
# battle traits
for se in main.iter():
    if tagname(se)=='entryLink' and se.attrib.get('name','').startswith('Battle Traits'):
        t=resolve(se); out['groups']['Battle Traits']=[{'name':'Battle Traits','abilities':[ability(p) for p in profiles(t) if p.attrib.get('typeName','').startswith('Ability')]}]
json.dump(out,open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hashut_en.json'),'w'),indent=1,ensure_ascii=False)
for u in out['units']: print(u['name'],u['pts'],u['size'],u['stats'],len(u['weapons']),len(u['abilities']))

