import os
#!/usr/bin/env python3
"""Convertit l'export BSData (hashut_en.json) + traductions (fr.py) en army-data.js pour WarCounter."""
import json, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fr import T

d = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hashut_en.json')))

# ---------- Glossaires ----------
KW = {'HERO':'HÉROS','INFANTRY':'INFANTERIE','CAVALRY':'CAVALERIE','MONSTER':'MONSTRE','WAR MACHINE':'MACHINE DE GUERRE',
      'WIZARD':'SORCIER','PRIEST':'PRÊTRE','FLY':'VOL','UNIQUE':'UNIQUE','WARMASTER':'SEIGNEUR DE GUERRE','CHAMPION':'CHAMPION',
      'MUSICIAN':'MUSICIEN','STANDARD BEARER':'PORTE-ÉTENDARD','AUTOMATON':'AUTOMATE','CHAOS':'CHAOS','DUARDIN':'DUARDIN',
      'HELSMITHS OF HASHUT':'HELSMITHS OF HASHUT','HOBGROT':'HOBGROT'}
KW_ORDER = ['WARMASTER','UNIQUE','HERO','MONSTER','WAR MACHINE','WIZARD','PRIEST','INFANTRY','CAVALRY','FLY','CHAMPION','MUSICIAN','STANDARD BEARER','CHAOS','HELSMITHS OF HASHUT','DUARDIN','AUTOMATON','HOBGROT']
def kw_fr(k):
    m = re.match(r'(.+?)( \(.+\))?$', k); base, suf = m.group(1), m.group(2) or ''
    return KW.get(base, base) + suf
def kw_line(kws):
    def rank(k):
        b = re.sub(r' \(.+\)$', '', k)
        return KW_ORDER.index(b) if b in KW_ORDER else 99
    return ', '.join(kw_fr(k) for k in sorted(kws, key=rank))

def clean(s):
    s = re.sub(r'\*\*\^\^(.+?)\^\^\*\*', lambda m: m.group(1).upper(), s)
    return s.replace('**', '').replace('*', '')

WEAP_ABIL = [(r'Anti-(.+?) \(\+1 Rend\)', lambda m: 'Anti-' + ('charge' if m.group(1).lower()=='charge' else kw_fr(clean(m.group(1)).upper())) + ' (+1 Perf.)'),
             (r'^Charge \(\+1 Damage\)$', lambda m: 'Charge (+1 dégât)'),
             (r'^Shoot in Combat$', lambda m: 'Tir en mêlée'),
             (r'^Companion$', lambda m: 'Compagnon')]
def weapon(w):
    parts = [p.strip() for p in w.get('Ability','-').split(',') if p.strip() and p.strip() != '-']
    crit, extra, comp = 'none', [], False
    for p in parts:
        p = clean(p) if '**' in p else p
        if p.startswith('Crit'):
            crit = {'Crit (2 Hits)':'2hits','Crit (Mortal)':'mortal','Crit (Auto-wound)':'auto'}.get(p, 'none'); continue
        if p == 'Companion': comp = True
        for pat, f in WEAP_ABIL:
            m = re.match(pat, p)
            if m: p = f(m); break
        extra.append(p)
    rng = w.get('Rng', 'Mêlée') if w['kind'] == 'Ranged Weapon' else 'Mêlée'
    r = w['Rnd']; r = 0 if r in ('-', '0') else (int(r) if r.isdigit() else r)
    o = {'n':w['name'], 'range':rng, 'a':int(w['Atk']) if w['Atk'].isdigit() else w['Atk'], 'h':int(w['Hit'].rstrip('+')), 'w':int(w['Wnd'].rstrip('+')),
         'r':r, 'd':w['Dmg'], 'crit':crit}
    if extra: o['extra'] = extra
    if comp: o['companion'] = True
    return o

# Timings -> texte FR + phases
PH_FR = {'Hero':'des héros','Movement':'de mouvement','Shooting':'de tir','Charge':'de charge','Combat':'de mêlée'}
PH_KEY = {'Hero':'hero','Movement':'move','Shooting':'shoot','Charge':'charge','Combat':'fight'}
def timing(t):
    if not t: return 'Passif', []
    pre, keys = '', []
    m = re.match(r'(Once Per (?:Turn \(Army\)|Battle(?: \(Army\))?|Battle Round)), (.+)$', t)
    if m:
        pre = {'Once Per Turn (Army)':'Une fois par tour (armée), ','Once Per Battle':'Une fois par bataille, ','Once Per Battle (Army)':'Une fois par bataille (armée), ','Once Per Battle Round':'Une fois par round, '}[m.group(1)]
        t = m.group(2)
    m = re.match(r'(Your|Enemy|Any) (Hero|Movement|Shooting|Charge|Combat) Phase$', t)
    if m:
        who, ph = m.groups()
        txt = {'Your':'votre phase ','Enemy':'phase ','Any':"n'importe quelle phase "}[who] + PH_FR[ph] + (' adverse' if who == 'Enemy' else '')
        k = PH_KEY[ph]; keys = [k] if who == 'Your' else [k + '-opp'] if who == 'Enemy' else [k, k + '-opp']
        return (pre + txt)[0].upper() + (pre + txt)[1:], keys
    m = re.match(r'(Start|End) of (Your|Any) Turn$', t)
    if m:
        se, who = m.groups(); k = 'start' if se == 'Start' else 'end'
        txt = ('Début' if se == 'Start' else 'Fin') + (' de votre tour' if who == 'Your' else " de n'importe quel tour")
        if pre: txt = pre + txt[0].lower() + txt[1:]
        return txt, [k] if who == 'Your' else [k, k + '-opp']
    if t == 'Deployment Phase': return (pre + 'phase de déploiement').capitalize() if pre else 'Phase de déploiement', ['deploy']
    if t.startswith('Reaction'):
        if 'Fight' in t: return 'Réaction : vous avez annoncé une aptitude de CORPS À CORPS pour cette unité', ['fight', 'fight-opp']
        if 'Shoot' in t: return 'Réaction : vous avez annoncé une aptitude de TIR pour cette unité et toutes ses attaques ont ciblé la même unité ennemie', ['shoot']
        if 'Counter-charge' in t: return "Réaction : vous avez annoncé l'ordre « Contre-charge » pour cette unité", ['charge-opp']
    raise SystemExit('Timing inconnu : ' + t)

COLOR = {'Yellow':'hero','Blue':'shoot','Red':'fight','Orange':'charge','Green':'defense','Purple':'end','Gray':'move','Grey':'move','Black':'passive'}
# Phases des aptitudes passives (pas de timing dans BSData)
PASSIVE_WHEN = {'Daemonic Strength':[], 'Peerless Among Daemonsmiths':[], 'Battle Damaged':[], 'Daemonic Resilience':[], 'Stoked Fanaticism':[],
  'Unholy Stampede':['move','charge'], 'Black-Hearted Conqueror':['end','end-opp'], 'Manglers of Metal':['shoot'], 'Crush the Unworthy':['charge'],
  'Zealous Acolytes':['fight','fight-opp','end','end-opp'], 'Sacred Gongs':['hero','hero-opp'], 'Disciplined March':['move'], 'Calculated Trajectory':['shoot'],
  'Amassed Legions':['hero','hero-opp'], 'Experimental Munitions':['shoot'], 'Bulls of the Ziggurat':['move'], 'Arcane Dominance':['hero','hero-opp'],
  'Infernal Motivators':['move'], 'Earthwrack Stabilisers':['fight','fight-opp']}
# Phase d'affichage forcée quand la couleur BSData ne colle pas à la charte
COLOR_FIX = {'Sacred Gongs':'hero', 'Disposable Lackeys':'move', 'Horn of the Bullfather':'move', 'Servile Automaton':'passive'}

WHEN = {}
def ability(a):
    if a['name'] not in T: raise SystemExit('Traduction manquante : ' + a['name'])
    dec, eff = T[a['name']]
    t, keys = timing(a['timing'])
    WHEN[a['name']] = keys if a['timing'] else PASSIVE_WHEN.get(a['name'], [])
    x = []
    if dec: x.append('Annonce : ' + dec)
    lines = eff.split('\n'); x.append('Effet : ' + lines[0]); x += lines[1:]
    kws = clean(a['keywords']).replace('SPELL', 'SORT').replace('PRAYER', 'PRIÈRE').replace('UNLIMITED', 'ILLIMITÉ').replace('RAMPAGE', 'SACCAGE')
    if kws: x.append('Mots-clés : ' + kws)
    c = COLOR_FIX.get(a['name']) or ('hero' if a['cast'] or a['chant'] else COLOR.get(a['color'], 'passive'))
    if not a['timing'] and c not in ('defense',): c = COLOR.get(a['color'], 'passive') if a['name'] not in COLOR_FIX else c
    o = {'c':c, 't':t, 'n':a['name'].strip("'"), 'x':x}
    if a['cast']: o['cast'] = int(a['cast'])
    if a['chant']: o['chant'] = int(a['chant'])
    if a['kind'] == 'Ability (Command)': o['cost'] = '1 PC'
    WHEN[o['n']] = WHEN.pop(a['name'])
    return o

# ---------- Unités ----------
IDS = {'Urak Taar, the First Daemonsmith':'urak-taar','Daemonsmith on Infernal Taurus':'taurus','Daemonsmith on Infernal Taurus (Scourge of Aqshy)':'taurus-aqshy',
  'War Despot':'war-despot','Daemonsmith':'daemonsmith','Ashen Elder':'ashen-elder','Dominator Engine with Immolation Cannons':'dominator-cannons',
  'Dominator Engine with Bane Maces':'dominator-maces','Infernal Razers with Blunderbusses':'razers-blunder','Infernal Razers with Flamehurlers':'razers-flame',
  'Infernal Cohort with Hashutite Spears':'cohort-spears','Infernal Cohort with Hashutite Blades':'cohort-blades','Bull Centaurs':'bull-centaurs',
  'Anointed Sentinels':'sentinels','Anointed Sentinels (Scourge of Aqshy)':'sentinels-aqshy','Tormentor Bombard':'bombard',
  'Deathshrieker Rocket Battery':'deathshrieker','Hobgrot Vandalz':'hobgrotz'}
# Options de régiment (profils de bataille octobre 2026) : cmd-any = Commandants Hashutites, cmd-01 = 0-1 Commandant, units = unités seulement
LEAD = {'urak-taar':'cmd-any','taurus':'cmd-01','taurus-aqshy':'cmd-01','war-despot':'units','daemonsmith':'cmd-01','ashen-elder':'cmd-01'}
CMD = {'war-despot','daemonsmith','ashen-elder'}
ORDER = list(IDS.values())

units = []
for u in d['units']:
    uid = IDS[u['name']]; s = u['stats']
    kws = [k for k in u['kw'] if k != 'Legends']
    o = {'id':uid, 'en':u['name'], 'pts':u['pts'], 'size':u['size'],
         'stats':{'M':s['Move'], 'S':int(s['Health']), 'C':int(s['Control']), 'Sv':s['Save']},
         'weapons':[weapon(w) for w in sorted(u['weapons'], key=lambda w: w['kind'] != 'Ranged Weapon')],
         'abilities':[ability(a) for a in u['abilities']], 'kw':kw_line(kws)}
    if 'HERO' in kws: o['hero'] = True; o['lead'] = LEAD[uid]
    if 'UNIQUE' in kws: o['unique'] = True
    if uid in CMD: o['cmd'] = True
    if 'Scourge of Aqshy' in u['name']: o['aqshy'] = True
    units.append(o)
units.sort(key=lambda o: ORDER.index(o['id']))

G = d['groups']
def items(name): return G[name]
FORM_IDS = {'Hashutite Host':'ost','Castigation Battery':'castigation',"The Bullfather's Horns":'cornes','Daemonsmith Cabal':'cabale'}
TRAIT_IDS = {'Servile Automaton':'automate',"'Fire, You Worms!'":'worms','An Eye for Weakness':'eye'}
ART_IDS = {'Scroll of Petrification':'parchemin','Gauntlets of Punishment':'gauntlets','Crucible of Spite':'creuset','Gem of Utorak':'gemme','Casque of Belittlement':'casque','Horn of the Bullfather':'corne'}
AQ_ART = {'gemme','casque','corne'}
PROC_IDS = {'Infernal Motivators':'motricite','Earthwrack Stabilisers':'stabilisateurs',"Bullfather's Scorn":'mepris'}

formations = [{'id':FORM_IDS[i['name']], 'en':i['name'], 'ab':ability(i['abilities'][0])} for i in items('Battle Formations: Helsmiths of Hashut')]
traits = [{'id':TRAIT_IDS[i['name']], 'en':i['name'].strip("'"), 'ab':ability(i['abilities'][0])} for i in items('Heroic Traits')]
arts = []
for i in items('Artefacts of Power'):
    aid = ART_IDS[i['name']]; o = {'id':aid, 'en':i['name'], 'ab':ability(i['abilities'][0])}
    if aid in AQ_ART: o['aqshy'] = True
    arts.append(o)
arts.sort(key=lambda o: list(ART_IDS.values()).index(o['id']))
procs = [{'id':PROC_IDS[i['name']], 'en':i['name'], 'pts':i['pts'], 'ab':ability(i['abilities'][0])} for i in items('Accursed Devices')]
spells = [ability(a) for a in items('Spell Lores')[0]['abilities']]
prayers = [ability(a) for a in items('Prayer Lores')[0]['abilities']]
traits_bt = [ability(a) for a in items('Battle Traits')[0]['abilities']]
SPELL_LORE, PRAYER_LORE = items('Spell Lores')[0]['name'], items('Prayer Lores')[0]['name']

J = lambda o: json.dumps(o, ensure_ascii=False)
old = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shells', 'mega-data.js')).read()
tail = old[old.index('  // Battle Tactics 2026-27'):]
js = f"""  // ---------- Données ----------
  // Généré depuis BSData (age-of-sigmar-4th) et traduit en français. Ne pas modifier à la main : relancer bsd/convert.py.
  const UNITS = {J(units)};
  UNITS.forEach(u => {{
    u.war = /MACHINE DE GUERRE/.test(u.kw);
    u.wizard = /SORCIER/.test(u.kw);
    u.priest = /PRÊTRE/.test(u.kw);
  }});
  const BATTLE_TRAITS = {J(traits_bt)};
  const FORMATIONS = {J(formations)};
  const TRAITS = {J(traits)};
  const ARTEFACTS = {J(arts)};
  const PROCEDES = {J(procs)};
  const SPELLS = {J(spells)};
  const PRAYERS = {J(prayers)};
  const LORE_NAMES = {J({'spell':SPELL_LORE, 'prayer':PRAYER_LORE})};
  const WHEN = {J(WHEN)};

{tail}"""
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'army-data.js'), 'w').write(js)
print('OK', len(units), 'unités,', len(WHEN), 'aptitudes')
for u in units: print(' ', u['id'], u['pts'], u['size'], u.get('lead',''), u['kw'][:60])
