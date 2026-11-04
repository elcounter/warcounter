import os
#!/usr/bin/env python3
"""Convertit <slug>_en.json + fr_<slug>.py en données de page faction (lecture seule) pour l'onglet Règles."""
import json, re, sys, importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

KW = {'HERO':'HÉROS','INFANTRY':'INFANTERIE','CAVALRY':'CAVALERIE','MONSTER':'MONSTRE','WAR MACHINE':'MACHINE DE GUERRE','WIZARD':'SORCIER',
      'PRIEST':'PRÊTRE','FLY':'VOL','UNIQUE':'UNIQUE','WARMASTER':'SEIGNEUR DE GUERRE','CHAMPION':'CHAMPION','MUSICIAN':'MUSICIEN',
      'STANDARD BEARER':'PORTE-ÉTENDARD','BEAST':'BÊTE','WARD':'PROTECTION','REINFORCEMENTS':'RENFORTS','MANIFESTATION':'MANIFESTATION',
      'ENDLESS SPELL':'SORT PERSISTANT','INVOCATION':'INVOCATION','FACTION TERRAIN':'TERRAIN DE FACTION','ORDER':'ORDRE','DEATH':'MORT','DESTRUCTION':'DESTRUCTION'}
FIRST = ['WARMASTER','UNIQUE','HERO','MONSTER','WAR MACHINE','WIZARD','PRIEST','INFANTRY','CAVALRY','BEAST','FLY','CHAMPION','MUSICIAN','STANDARD BEARER','WARD']
def kw_fr(k):
    m = re.match(r'(.+?)( \(.+\))?$', k); b, s = m.group(1), m.group(2) or ''
    return KW.get(b, b) + s
def kw_line(kws):
    def r(k):
        b = re.sub(r' \(.+\)$', '', k); return FIRST.index(b) if b in FIRST else 50
    return ', '.join(kw_fr(k) for k in sorted([k for k in kws if k != 'Legends'], key=r))
def clean(s):
    s = s.replace('\xa0', ' ').replace('\u2011', '-')
    s = re.sub(r'\*\*\^\^(.+?)\^\^\*\*', lambda m: m.group(1).upper(), s)
    return s.replace('^^', '').replace('**', '').replace('*', '')

def weapon(w):
    parts = [clean(p.strip()) for p in re.split(r',(?![^(]*\))', w.get('Ability', '-')) if p.strip() and p.strip() != '-']
    crit, extra, comp = 'none', [], False
    for p in parts:
        if p.startswith('Crit'):
            crit = {'Crit (2 Hits)':'2hits','Crit (Mortal)':'mortal','Crit (Auto-wound)':'auto'}.get(p, 'none')
            if crit == 'none': extra.append(p)
            continue
        if p == 'Companion': comp = True; extra.append('Compagnon'); continue
        m = re.match(r'Anti-(.+?) \(\+(\d) Rend\)', p)
        if m: extra.append('Anti-' + ('charge' if m.group(1).lower() == 'charge' else kw_fr(m.group(1).upper())) + f' (+{m.group(2)} Perf.)'); continue
        m = re.match(r'Charge \(\+(\d) Damage\)', p)
        if m: extra.append(f'Charge (+{m.group(1)} dégât)'); continue
        if p.lower() == 'shoot in combat': extra.append('Tir en mêlée'); continue
        extra.append(p)
    num = lambda v: int(v) if str(v).isdigit() else v
    hw = lambda v: int(v.rstrip('+')) if v.rstrip('+').isdigit() else v
    r = w.get('Rnd', '-'); r = 0 if r in ('-', '0') else num(r)
    o = {'n':w['name'], 'range':w.get('Rng', 'Mêlée') if w['kind'] == 'Ranged Weapon' else 'Mêlée', 'a':num(w.get('Atk', '-')),
         'h':hw(w.get('Hit', '-')), 'w':hw(w.get('Wnd', '-')), 'r':r, 'd':w.get('Dmg', '-'), 'crit':crit}
    if extra: o['extra'] = extra
    if comp: o['companion'] = True
    return o

PH_FR = {'Hero':'des héros','Movement':'de mouvement','Shooting':'de tir','Charge':'de charge','Combat':'de mêlée'}
def _timing(t):
    t = re.sub(r'\s+', ' ', clean(t)).strip()
    if not t: return 'Passif'
    pre = ''
    m = re.match(r'(Once Per (?:Turn(?: \(Army\))?|Battle(?: \(Army\))?|Battle Round(?: \(Army\))?)), (.+)$', t)
    if m:
        pre = {'Once Per Turn (Army)':'Une fois par tour (armée), ','Once Per Turn':'Une fois par tour, ','Once Per Battle':'Une fois par bataille, ',
               'Once Per Battle (Army)':'Une fois par bataille (armée), ','Once Per Battle Round':'Une fois par round, ','Once Per Battle Round (Army)':'Une fois par round (armée), '}[m.group(1)]
        t = m.group(2)
    def out(s): s = pre + s; return s[0].upper() + s[1:]
    m = re.match(r'(Your|Enemy|Any) (Hero|Movement|Shooting|Charge|Combat) Phase$', t)
    if m:
        who, ph = m.groups()
        return out({'Your':'votre phase ','Enemy':'phase ','Any':"n'importe quelle phase "}[who] + PH_FR[ph] + (' adverse' if who == 'Enemy' else ''))
    m = re.match(r'(Start|End) of (Your|Any|Enemy) Turn$', t)
    if m:
        se, who = m.groups()
        return out(('début' if se == 'Start' else 'fin') + {'Your':' de votre tour','Any':" de n'importe quel tour",'Enemy':' du tour adverse'}[who])
    m = re.match(r'(Start|End) of (?:the |Any )?Battle Round$', t)
    if m: return out(('début' if m.group(1) == 'Start' else 'fin') + ' du round de bataille')
    if t == 'Deployment Phase': return out('phase de déploiement')
    if t.startswith('Reaction'):
        k = re.sub(r'\s+', ' ', t)
        if k in REACT: return out(REACT[k])
        r = t.split(':', 1)[1].strip() if ':' in t else t
        r = (r.replace('You declared', 'Vous avez annoncé').replace('Your opponent declared', "L'adversaire a annoncé").replace('Opponent declared', "L'adversaire a annoncé")
              .replace('a SPELL ability', 'une aptitude de SORT').replace('a FIGHT ability', 'une aptitude de CORPS À CORPS').replace('a SHOOT ability', 'une aptitude de TIR')
              .replace('a CHARGE ability', 'une aptitude de CHARGE').replace('a RUN ability', 'une aptitude de COURSE').replace('a MOVE ability', 'une aptitude de MOUVEMENT')
              .replace('a command', 'un ordre').replace('an ATTACK ability', "une aptitude d'ATTAQUE").replace('the ', 'l\'ordre ').replace(' command', '')
              .replace('for this unit', 'pour cette unité').replace('for a friendly unit', 'pour une unité amie').replace('that targets this unit', 'qui cible cette unité')
              .replace('within', 'à').replace('of this unit', 'de cette unité'))
        return out('réaction : ' + r)
    return out(t)

REACT = {
 "Reaction: You declared the 'Depict Rune' ability": "réaction : vous avez annoncé l'aptitude « Depict Rune »",
 "Reaction: You declared a SPELL ability for a LUMINETH REALM-LORDS WIZARD within this unit's combat range": "réaction : vous avez annoncé une aptitude de SORT pour un SORCIER LUMINETH REALM-LORDS à portée de mêlée de cette unité",
 "Reaction: You declared the 'Eruption of Fury' ability for this unit": "réaction : vous avez annoncé l'aptitude « Éruption de Fureur » pour cette unité",
 'Reaction: Opponent declared a command for a visible enemy unit within 6" of this unit': 'réaction : l\'adversaire a annoncé un ordre pour une unité ennemie visible à 6" de cette unité',
 "Reaction: This unit was picked to be the target of a non-CORE ability": "réaction : cette unité a été choisie comme cible d'une aptitude non BASE",
 'Reaction: You declared a CHARGE ability for an OGOR MAWTRIBES unit wholly within 12" of this unit': 'réaction : vous avez annoncé une aptitude de CHARGE pour une unité OGOR MAWTRIBES entièrement à 12" de cette unité',
 "Reaction: You declared a non-Charge Move ability for this unit in your movement phase": "réaction : vous avez annoncé une aptitude de MOUVEMENT autre que Charge pour cette unité à votre phase de mouvement",
 "Reaction: You declared an UNLIMITED SPELL ability for this unit": "réaction : vous avez annoncé une aptitude de SORT ILLIMITÉ pour cette unité",
 'Reaction: Opponent declared a CHARGE ability for a unit within 9" of and visible to this unit': 'réaction : l\'adversaire a annoncé une aptitude de CHARGE pour une unité à 9" de cette unité et visible d\'elle',
 "Reaction: Opponent declared a Spell ability": "réaction : l'adversaire a annoncé une aptitude de SORT",
 "Reaction: You declared a FIGHT ability for this unit": "réaction : vous avez annoncé une aptitude de CORPS À CORPS pour cette unité",
 "Reaction: You declared a Fight ability for this unit": "réaction : vous avez annoncé une aptitude de CORPS À CORPS pour cette unité",
 "Reaction: You declared a SHOOT ability for this unit, it was not set up this turn and it has not used a MOVE ability this turn": "réaction : vous avez annoncé une aptitude de TIR pour cette unité, elle n'a pas été placée à ce tour et n'a pas utilisé d'aptitude de MOUVEMENT à ce tour",
 'Reaction: You declared a SPELL or UNBIND ability for a visible SKAVEN unit wholly within 13" of this unit': 'réaction : vous avez annoncé une aptitude de SORT ou de DISSIPATION pour une unité SKAVEN visible entièrement à 13" de cette unité',
 'Reaction: You declared the \'Redeploy\' command for a friendly ESHIN INFANTRY unit wholly within 13" of this unit': 'réaction : vous avez annoncé l\'ordre « Redéploiement » pour une unité d\'INFANTERIE ESHIN amie entièrement à 13" de cette unité',
 'Reaction: You declared the \'Redeploy\' command for a friendly LUMINETH REALM-LORDS unit wholly within 12" of this unit': 'réaction : vous avez annoncé l\'ordre « Redéploiement » pour une unité LUMINETH REALM-LORDS amie entièrement à 12" de cette unité',
}
TFIX = {
 'One Per Turn (Army), Any Combat Phase': "Une fois par tour (armée), n'importe quelle phase de mêlée",
 'Réaction : L\'adversaire a annoncé une aptitude de CHARGE for a visible unit à 12" de cette unité': 'Réaction : l\'adversaire a annoncé une aptitude de CHARGE pour une unité visible à 12" de cette unité',
 'Réaction : Vous avez annoncé a SPELL or PRAYER ability for a visible unit that is wholly à 12" de cette unité and under orders': 'Réaction : vous avez annoncé une aptitude de SORT ou de PRIÈRE pour une unité visible entièrement à 12" de cette unité et sous les ordres',
 'Réaction : Vous avez annoncé l\'ordre \'Redeploy\' for a friendly CITIES OF SIGMAR unit wholly à 12" de cette unité': 'Réaction : vous avez annoncé l\'ordre « Redéploiement » pour une unité CITIES OF SIGMAR amie entièrement à 12" de cette unité',
 'Réaction : Vous avez annoncé une aptitude de CORPS À CORPS pour cette unité or a non-HERO SIGMARITE INFANTRY unit wholly à 12" de cette unité.': 'Réaction : vous avez annoncé une aptitude de CORPS À CORPS pour cette unité ou une unité d\'INFANTERIE SIGMARITE non HÉROS entièrement à 12" de cette unité',
 'Une fois par bataille, réaction : Vous avez annoncé une aptitude de TIR pour cette unité and this unit is in combat': 'Une fois par bataille, réaction : vous avez annoncé une aptitude de TIR pour cette unité et elle est en mêlée',
 "Une fois par tour (armée), réaction : L'adversaire a annoncé une aptitude de CORPS À CORPS.": "Une fois par tour (armée), réaction : l'adversaire a annoncé une aptitude de CORPS À CORPS",
 'Une fois par tour (armée), réaction : Vous avez annoncé une aptitude de CHARGE for a unit that is under orders': 'Une fois par tour (armée), réaction : vous avez annoncé une aptitude de CHARGE pour une unité sous les ordres',
 'Réaction : L\'adversaire a annoncé un ordre for a unit à 12" de cette unité': 'Réaction : l\'adversaire a annoncé un ordre pour une unité à 12" de cette unité',
 'Une fois par bataille, réaction : L\'adversaire a annoncé une aptitude de SORT for a WIZARD à 18" de cette unité': 'Une fois par bataille, réaction : l\'adversaire a annoncé une aptitude de SORT pour un SORCIER à 18" de cette unité',
 'You declared a FIGHT ability for this unit': 'Réaction : vous avez annoncé une aptitude de CORPS À CORPS pour cette unité',
 'Réaction : Vous avez annoncé l\'ordre \'Redeploy\' for a SOULBLIGHT GRAVELORDS unit wholly à 12" de cette unité': 'Réaction : vous avez annoncé l\'ordre « Redéploiement » pour une unité SOULBLIGHT GRAVELORDS entièrement à 12" de cette unité',
 "Une fois par tour, réaction : L'adversaire a annoncé un ordre or a RAMPAGE ability for a unit in combat with this unit": "Une fois par tour, réaction : l'adversaire a annoncé un ordre ou une aptitude de SACCAGE pour une unité en mêlée avec cette unité",
}
def timing(t):
    r = _timing(t)
    r = TFIX.get(r, r)
    r = r.replace("Réaction : L'adversaire", "Réaction : l'adversaire").replace('Réaction : Vous', 'Réaction : vous').replace("réaction : L'adversaire", "réaction : l'adversaire").replace('réaction : Vous', 'réaction : vous')
    return TFIX2.get(r, r)
TFIX2 = {
 "Une fois par tour (armée), réaction : vous avez annoncé l'ordre 'Blessings of Khaine' ability": "Une fois par tour (armée), réaction : vous avez annoncé l'aptitude « Blessings of Khaine »",
 'Une fois par tour (armée), réaction : vous avez annoncé a Charge ability for an anointed unit': 'Une fois par tour (armée), réaction : vous avez annoncé une aptitude de CHARGE pour une unité ointe',
 'Réaction : vous avez annoncé a Fight ability for an anointed unit': 'Réaction : vous avez annoncé une aptitude de CORPS À CORPS pour une unité ointe',
 'Start of First Battle Round': 'Début du premier round de bataille',
 'Réaction : vous avez annoncé a SPELL, PRAYER or UNBIND ability for a unit à 3" de cette unité': 'Réaction : vous avez annoncé une aptitude de SORT, de PRIÈRE ou de DISSIPATION pour une unité à 3" de cette unité',
 "Réaction : This unit used l'ordre 'Activate Place of Power' ability": "Réaction : cette unité a utilisé l'aptitude « Activer le Lieu de Pouvoir »",
 'Réaction : vous avez annoncé l\'ordre \'Redeploy\' for a DAUGHTERS OF KHAINE unit wholly à 12" de cette unité': 'Réaction : vous avez annoncé l\'ordre « Redéploiement » pour une unité DAUGHTERS OF KHAINE entièrement à 12" de cette unité',
 'Once Per Turn(Army), Reaction: You declared an Attack ability for a friendly AKHELIAN unit': "Une fois par tour (armée), réaction : vous avez annoncé une aptitude d'ATTAQUE pour une unité AKHELIAN amie",
 'Une fois par tour, réaction : vous avez annoncé une aptitude de SORT for a friendly ISHARANN unit wholly à 12" de cette unité': 'Une fois par tour, réaction : vous avez annoncé une aptitude de SORT pour une unité ISHARANN amie entièrement à 12" de cette unité',
 "Réaction : vous avez annoncé l'ordre 'Unpredictable Tide' ability or l'ordre 'Steed of Tides' ability": "Réaction : vous avez annoncé l'aptitude « Unpredictable Tide » ou « Steed of Tides »",
}
TFIX2.update({
 'Réaction : A friendly unit à 12" de cette unité was picked to be l\'ordre target of an enemy SPELL ability.': 'Réaction : une unité amie à 12" de cette unité a été choisie comme cible d\'une aptitude de SORT ennemie',
 'Your Movement Phase, Reaction: You declared a non-CHARGE MOVE ability for a friendly SKYVESSEL': 'Votre phase de mouvement, réaction : vous avez annoncé une aptitude de MOUVEMENT autre que CHARGE pour un SKYVESSEL ami',
 'Une fois par tour, réaction : l\'adversaire a annoncé une aptitude de CHARGE for a unit à 12" de cette unité.': 'Une fois par tour, réaction : l\'adversaire a annoncé une aptitude de CHARGE pour une unité à 12" de cette unité',
 'Une fois par tour (armée), Your Shooting Phase, Reaction: You declared a SHOOT ability for this unit': 'Une fois par tour (armée), votre phase de tir, réaction : vous avez annoncé une aptitude de TIR pour cette unité',
 'Your Shooting Phase, Reaction: You declared a SHOOT ability for this unit.': 'Votre phase de tir, réaction : vous avez annoncé une aptitude de TIR pour cette unité',
 'Une fois par bataille, réaction : l\'adversaire a annoncé une aptitude de SORT for a WIZARD à 30" de cette unité': 'Une fois par bataille, réaction : l\'adversaire a annoncé une aptitude de SORT pour un SORCIER à 30" de cette unité',
 'Réaction : vous avez annoncé une aptitude de SORT for a friendly SERAPHON WIZARD wholly à 12" de cette unité': 'Réaction : vous avez annoncé une aptitude de SORT pour un SORCIER SERAPHON ami entièrement à 12" de cette unité',
 "Une fois par bataille, réaction : vous avez annoncé une aptitude de SORT for a friendly SERAPHON WIZARD à this unit's combat range": 'Une fois par bataille, réaction : vous avez annoncé une aptitude de SORT pour un SORCIER SERAPHON ami à portée de mêlée de cette unité',
 'Une fois par tour (armée), réaction : You made an unmodified chanting roll of 1 for a Sylvaneth Priest wholy à 12" de cette unité.': 'Une fois par tour (armée), réaction : vous avez obtenu un jet de récitation non modifié de 1 pour un PRÊTRE SYLVANETH entièrement à 12" de cette unité',
 'Une fois par tour (armée), réaction : l\'adversaire a annoncé une aptitude de SORT for a unit à 30" de cette unité': 'Une fois par tour (armée), réaction : l\'adversaire a annoncé une aptitude de SORT pour une unité à 30" de cette unité',
 'Réaction : l\'adversaire a annoncé a Spell ability for a unit à 30" de cette unité': 'Réaction : l\'adversaire a annoncé une aptitude de SORT pour une unité à 30" de cette unité',
 'Once Per battle, Enemy Hero Phase': 'Une fois par bataille, phase des héros adverse',
})
TFIX2.update({
 'Réaction : l\'adversaire a annoncé un ordre for a unit à 8" de cette unité': 'Réaction : l\'adversaire a annoncé un ordre pour une unité à 8" de cette unité',
 'Once Per Turn (Army),Your Hero Phase': 'Une fois par tour (armée), votre phase des héros',
 'Une fois par tour (armée), réaction : You or your opponent declared l\'ordre \'Eruption of Fury\' ability for a unit à 12" de cette unité': 'Une fois par tour (armée), réaction : vous ou votre adversaire avez annoncé l\'aptitude « Éruption de Fureur » pour une unité à 12" de cette unité',
 'Une fois par tour (armée), réaction : vous avez annoncé une aptitude de CORPS À CORPS for a friendly BLADES OF KHORNE DAEMON unit': 'Une fois par tour (armée), réaction : vous avez annoncé une aptitude de CORPS À CORPS pour une unité DÉMON BLADES OF KHORNE amie',
 "Une fois par tour, réaction : vous avez annoncé l'ordre 'Skulls for l'ordre Skull Throne' ability": "Une fois par tour, réaction : vous avez annoncé l'aptitude « Skulls for the Skull Throne »",
 'Réaction : vous avez annoncé une aptitude de CHARGE for a DISCIPLES OF TZEENTCH unit in your turn': 'Réaction : vous avez annoncé une aptitude de CHARGE pour une unité DISCIPLES OF TZEENTCH à votre tour',
 'Réaction : vous avez annoncé une aptitude de SORT for a DISCIPLES OF TZEENTCH unit wholly à 12" de cette unité': 'Réaction : vous avez annoncé une aptitude de SORT pour une unité DISCIPLES OF TZEENTCH entièrement à 12" de cette unité',
 'Une fois par tour (armée), réaction : vous avez annoncé une aptitude de SORT for a WIZARD à 30" de cette unité and l\'ordre casting roll equalled or exceeded l\'ordre spell\'s casting value and that spell has not been unbound': 'Une fois par tour (armée), réaction : l\'adversaire a annoncé une aptitude de SORT pour un SORCIER à 30" de cette unité, le jet de lancement a égalé ou dépassé la valeur de lancement et le sort n\'a pas été dissipé',
 'Réaction : vous avez annoncé une aptitude de SORT for a DISCIPLES OF TZEENTCH unit': 'Réaction : vous avez annoncé une aptitude de SORT pour une unité DISCIPLES OF TZEENTCH',
 'Réaction : l\'adversaire a annoncé une aptitude de SORT for a unit à 30" de cette unité.': 'Réaction : l\'adversaire a annoncé une aptitude de SORT pour une unité à 30" de cette unité',
 'Réaction : vous avez annoncé une aptitude de SORT for a DISCIPLES OF TZEENTCH unit wholly à 6" de cette unité': 'Réaction : vous avez annoncé une aptitude de SORT pour une unité DISCIPLES OF TZEENTCH entièrement à 6" de cette unité',
})
TFIX2.update({
 'Une fois par tour (armée), réaction : vous avez annoncé l\'ordre \'Normal Move\' ability for a CITIES OF SIGMAR INFANTRY unit à 3" of this terrain feature': 'Une fois par tour (armée), réaction : vous avez annoncé l\'aptitude « Mouvement Normal » pour une unité d\'INFANTERIE CITIES OF SIGMAR à 3" de cet élément de terrain',
 'Une fois par tour, réaction : vous avez annoncé une aptitude de SORT for a LUMINETH REALM-LORDS unit wholly à 12" of this terrain feature': 'Une fois par tour, réaction : vous avez annoncé une aptitude de SORT pour une unité LUMINETH REALM-LORDS entièrement à 12" de cet élément de terrain',
})
COLOR = {'Yellow':'hero','Blue':'shoot','Red':'fight','Orange':'charge','Green':'defense','Purple':'end','Gray':'move','Grey':'move','Black':'passive'}
TEMPLATES = [
 (r'While this unit has (\d+) or more damage points, the Attacks characteristic of (?:its )?(.+?) is (\S+?) and this unit has a Control characteristic of (\d+)\.?$', r"Tant que cette unité a \1 dégâts ou plus, la caractéristique d'Attaques de \2 est de \3 et sa caractéristique de Contrôle est de \4."),
 (r'While this unit has (\d+) or more damage points, the Attacks characteristic of (?:its )?(.+?) is (\S+?)\.?$', r"Tant que cette unité a \1 dégâts ou plus, la caractéristique d'Attaques de \2 est de \3."),
 (r'While this unit is damaged, add (\d+) to the Attacks characteristic of its (.+?)\.?$', r"Tant que cette unité est endommagée, ajoutez \1 aux Attaques de \2."),
 (r"Add 1 to the Attacks characteristic of this unit's (.+?) for each instance of (.+?) depicted on your battle scripture\.?$", r"Ajoutez 1 aux Attaques de \1 de cette unité pour chaque instance de \2 sur votre écriture de bataille."),
]
MISSING = []
def ability(a, T):
    eff = clean(a['effect']).strip(); dec = clean(a['declare']).strip()
    fr = None
    for pat, rep in TEMPLATES:
        if re.match(pat, eff): fr = ('', re.sub(pat, rep, eff)); break
    if fr is None: fr = T.get(a['name'])
    if fr is None: MISSING.append(a['name']); fr = (dec, eff)
    d, e = fr
    x = (['Annonce : ' + d] if d else []); lines = e.split('\n'); x.append('Effet : ' + lines[0]); x += lines[1:]
    kws = clean(a['keywords']).upper()
    for en, f in [('SPELL','SORT'),('PRAYER','PRIÈRE'),('UNLIMITED','ILLIMITÉ'),('RAMPAGE','SACCAGE'),('CORE','BASE'),('MOVE','MOUVEMENT'),('RUN','COURSE'),('FIGHT','CORPS À CORPS'),('SHOOT','TIR'),('ATTACK','ATTAQUE'),('DEPLOY','DÉPLOIEMENT'),('SUMMON','INVOCATION')]:
        kws = re.sub(r'\b' + en + r'\b', f, kws)
    if kws: x.append('Mots-clés : ' + kws)
    o = {'c':'hero' if a['cast'] or a['chant'] else COLOR.get(a['color'], 'passive'), 't':timing(a['timing']), 'n':a['name'].strip("'"), 'x':x}
    if a['cast'] and a['cast'].isdigit(): o['cast'] = int(a['cast'])
    if a['chant'] and a['chant'].isdigit(): o['chant'] = int(a['chant'])
    if a['kind'] == 'Ability (Command)': o['cost'] = (a['cost'] or '1') + ' PC'
    return o

SEC_FR = {'Battle Traits':'Traits de bataille','Spell Lores':'Sorts','Prayer Lores':'Prières','Manifestation Lores':'Manifestations',
          'Artefacts of Power':'Artefacts de pouvoir','Heroic Traits':'Traits héroïques'}
ORDER = ['Battle Traits','Battle Formations','Heroic Traits','Artefacts of Power','Spell Lores','Prayer Lores','Manifestation Lores']
def convert(slug, name, img):
    T = importlib.import_module('fr_' + slug).T
    d = json.load(open(f'{os.path.dirname(os.path.abspath(__file__))}/{slug}_en.json'))
    units = []
    for u in d['units']:
        s = u['stats']
        o = {'id':re.sub(r'[^a-z0-9]+', '-', u['name'].lower()).strip('-'), 'en':u['name'], 'pts':u['pts'], 'size':u['size'],
             'stats':{'M':s.get('Move', '-'), 'S':s.get('Health', '-'), 'C':s.get('Control', '-'), 'Sv':s.get('Save', '-')},
             'weapons':[weapon(w) for w in sorted(u['weapons'], key=lambda w: w['kind'] != 'Ranged Weapon')],
             'abilities':[ability(a, T) for a in u['abilities']], 'kw':kw_line(u['kw'])}
        if 'HERO' in u['kw']: o['hero'] = True
        if u.get('terrain') or 'FACTION TERRAIN' in u['kw']: o['terrain'] = True
        units.append(o)
    units.sort(key=lambda o: (not o.get('hero'), o['en']))
    secs = []
    for g in d['groups']:
        title = g['title']; key = next((k for k in ORDER if title.startswith(k)), None)
        items = [{'n':i['name'].strip("'"), 'pts':i['pts'], 'abs':[ability(a, T) for a in i['abilities']]} for i in g['items']]
        secs.append({'title':SEC_FR.get(key, 'Formations de bataille' if key == 'Battle Formations' else title), 'rank':ORDER.index(key) if key else 99, 'items':items})
    secs.sort(key=lambda s: s['rank'])
    return {'id':slug, 'en':name, 'img':img, 'units':units, 'sections':[{'title':s['title'], 'items':s['items']} for s in secs]}

if __name__ == '__main__':
    out = [convert(*x) for x in [('ogors','Ogor Mawtribes','ogors'), ('lumineth','Lumineth Realm-lords','lumineth'), ('skaven','Skaven','skaven'), ('cities','Cities of Sigmar','cities'), ('stormcast','Stormcast Eternals','stormcast'), ('slaves','Slaves to Darkness','slaves'), ('soulblight','Soulblight Gravelords','soulblight'), ('daughters','Daughters of Khaine','daughters'), ('fyreslayers','Fyreslayers','fyreslayers'), ('idoneth','Idoneth Deepkin','idoneth'), ('kharadron','Kharadron Overlords','kharadron'), ('seraphon','Seraphon','seraphon'), ('sylvaneth','Sylvaneth','sylvaneth'), ('khorne','Blades of Khorne','khorne'), ('tzeentch','Disciples of Tzeentch','tzeentch'), ('nurgle','Maggotkin of Nurgle','nurgle'), ('slaanesh','Hedonites of Slaanesh','slaanesh'), ('fec','Flesh-eater Courts','fec'), ('nighthaunt','Nighthaunt','nighthaunt'), ('ossiarch','Ossiarch Bonereapers','ossiarch'), ('gloomspite','Gloomspite Gitz','gloomspite'), ('ironjawz','Ironjawz','ironjawz'), ('kruleboyz','Kruleboyz','kruleboyz'), ('sons','Sons of Behemat','sons')]]
    open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'factions.json'), 'w').write(json.dumps(out, ensure_ascii=False).replace("OFFICAR'S", "OFFICER'S"))
    print('Traductions manquantes :', sorted(set(MISSING)))
    for f in out: print(f['en'], len(f['units']), 'unités', [(s['title'], len(s['items'])) for s in f['sections']])
