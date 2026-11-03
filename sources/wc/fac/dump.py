import json,re,sys
slug=sys.argv[1]
d=json.load(open(f'{slug}_en.json')); seen={}
allab=[a for u in d['units'] for a in u['abilities']]+[a for g in d['groups'] for i in g['items'] for a in i['abilities']]
def cl(s):
    s=s.replace('\xa0',' ').replace('‑','-')
    s=re.sub(r'\*\*\^\^(.+?)\^\^\*\*',lambda m:m.group(1).upper(),s); return s.replace('^^','').replace('**','').replace('*','')
for a in allab:
    e=cl(a['effect'])
    if re.match(r'While this unit has \d+ or more damage points, the Attacks characteristic',e) or re.match(r'While this unit is damaged, add \d+ to the Attacks characteristic of its',e): continue
    if a['name'] in seen: continue
    seen[a['name']]=1
    print('###',a['name']); 
    if a['declare']: print('D:',cl(a['declare']))
    print('E:',e)
