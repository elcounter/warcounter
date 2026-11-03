#!/usr/bin/env python3
"""Extrait les Règles de Base et Avancées du PDF officiel FR en sections structurées (core.json)."""
import pymupdf as fitz, re, json

d = fitz.open('/home/claude/wc/core/core.pdf')
TIMING = re.compile(r"^(Passif|Réaction|N[’']importe|Une Fois|Votre Phase|Phase|Début|Fin du|Fin de|Déploiement|À la Fin)", re.I)
HEAD = re.compile(r"^(\d{1,2}(?:\.\d){1,2}) +(.+)$")
FIX_HEAD = {"TERR IN":"TERRAIN","TERRIN":"TERRAIN","AT AQUE":"ATTAQUE","ATAQUE":"ATTAQUE","R PIDES":"RAPIDES","FR PPE":"FRAPPE",
            "CAR CTÉRISTIQUES":"CARACTÉRISTIQUES","CONTR DICTOIRES":"CONTRADICTOIRES","RMENER":"RAMENER","AUVEGARDES":"SAUVEGARDES",
            "GÉNÉRL":"GÉNÉRAL","DIAGR MME":"DIAGRAMME","RLLIEMENT":"RALLIEMENT"}
def fix(s):
    s = s.replace('ﬁ ', 'fi').replace('ﬂ ', 'fl').replace('ﬁ', 'fi').replace('ﬂ', 'fl').replace('ﬀ ', 'ff').replace('ﬀ', 'ff').replace('ﬃ', 'ffi')
    s = s.replace('\xa0', ' ').replace('\x8d', '•')
    s = re.sub(r'(\w)-\n(\w)', r'\1\2', s)
    lines = [l.strip() for l in s.split('\n')]
    lines = [l for l in lines if l and not re.fullmatch(r"[a-zA-Z’'e]{1,3}", l)]
    s = ' '.join(lines)
    s = re.sub(r'\s+', ' ', s).strip()
    s = s.replace(' :', ' :').replace('Eff et', 'Effet').replace('AnnonceAnnonc', 'Annonce').replace('souﬄe','souffle')
    for a, b in FIX_HEAD.items(): s = s.replace(a, b)
    s = re.sub(r'\bIGURINES', 'FIGURINES', s)
    return s

def page_blocks(i):
    p = d[i]
    words = p.get_text('words')
    byb = {}
    for w in words: byb.setdefault(w[5], []).append(w)
    def gap_ok(px1, w): return px1 is not None and w[0] < px1
    def btext(bno):
        ws = byb.get(bno, [])
        if not ws: return ''
        ws = sorted(ws, key=lambda w: (w[1] + w[3]) / 2)
        lines, cur, cy = [], [], None
        for w in ws:
            my = (w[1] + w[3]) / 2
            if cy is None or abs(my - cy) <= 3.5: cur.append(w); cy = my if cy is None else cy
            else: lines.append(cur); cur = [w]; cy = my
        if cur: lines.append(cur)
        out = []
        for l in lines:
            l = sorted(l, key=lambda w: w[0]); txt = ''; px1 = None
            for w in l:
                t = w[4]
                if px1 is None: txt = t
                else:
                    gap = w[0] - px1
                    last = txt.split(' ')[-1]
                    if len(t) == 1 and t.isalpha() and gap < 0.9: pass
                    elif len(last) == 1 and last.isalpha() and t.startswith(last) and gap < 0.9: txt = txt[:-1] + t
                    elif gap < -0.5:
                        if t.startswith(last): txt = txt[:len(txt) - len(last)] + t
                        elif last.endswith(t): pass
                        elif last and t and last[-1] == t[0]: txt += t[1:]
                        else: txt += t
                    elif gap < 0.9: txt += t
                    else: txt += ' ' + t
                px1 = max(px1 or 0, w[2]) if gap_ok(px1, w) else w[2]
            out.append(txt)
        return '\n'.join(out)
    bl = [b[:4] + (btext(b[5]) or b[4],) + b[5:] for b in p.get_text('blocks') if b[6] == 0]
    # colonne de résumé : blocs étroits alignés sur un bloc qui commence par une puce
    side_x = [b[0] for b in bl if b[4].lstrip().startswith('\x8d')]
    out = []
    for b in bl:
        x0, y0, x1, y1, t = b[:5]
        w = x1 - x0; raw = t.strip()
        if not raw: continue
        if raw in ('RÈGLES DE BASE', 'RÈGLES AVANCÉES') or re.fullmatch(r'\d{1,2}', raw): continue
        if x0 < 60 or x0 > 555: continue
        if any(abs(x0 - sx) < 14 for sx in side_x) and w < 140: continue
        txt = fix(raw)
        if w < 140 and not TIMING.match(txt) and not HEAD.match(txt): continue
        out.append((0 if x0 < 300 else 1, y0, x0, txt))
    out.sort(key=lambda o: (o[0], o[1]))
    return [o[3] for o in out]

def parse(pages):
    sections, cur, sub = [], None, None
    pend_timing = None
    for i in pages:
        for t in page_blocks(i):
            m = HEAD.match(t)
            if m and m.group(2)[:4].isupper():
                num = m.group(1); rest = m.group(2)
                # sépare le titre (majuscules) du texte qui suit
                toks = rest.split(' '); k = 0
                while k < len(toks) and toks[k] and not re.search(r'[a-zàâçéèêëîïôûù•:]', toks[k]): k += 1
                while k > 0 and len(toks[k-1]) == 1: k -= 1
                title, body = ' '.join(toks[:k]).strip(), ' '.join(toks[k:]).strip()
                node = {'num':num, 'title':title.title() if False else title, 'blocks':[]}
                if num.endswith('.0') and num.count('.') == 1:
                    cur = node; node['subs'] = []; sections.append(node); sub = node
                else:
                    if cur is None: cur = {'num':'', 'title':'', 'blocks':[], 'subs':[]}; sections.append(cur)
                    cur['subs'].append(node); sub = node
                if body: sub['blocks'].append({'k':'p', 'x':body})
                continue
            if sub is None: continue
            if TIMING.match(t) and len(t) < 70:
                pend_timing = t; continue
            ab = re.match(r"^([A-ZÉÈÀÂÎÔÛÇ’' \-]{4,}) ?: ?(.*)$", t)
            if ab and not t.startswith(('ÉTAPE', 'NOTE')):
                fl = ab.group(2); xs = []
                mm2 = re.search(r' (Annonce ?:|Effet ?:|Utilisée? [Pp]ar ?:)', fl)
                if mm2: xs = [fl[mm2.start()+1:]]; fl = fl[:mm2.start()]
                sub['blocks'].append({'k':'ab', 'n':ab.group(1).strip(), 'flavor':fl, 't':pend_timing or 'Passif', 'x':xs})
                pend_timing = None; continue
            last = sub['blocks'][-1] if sub['blocks'] else None
            if last and last['k'] == 'ab' and not last['x'] and not re.match(r'^(Annonce|Effet|Utilisée? [Pp]ar|Mots-clés)', t) and len(t) < 160:
                last['flavor'] += ' ' + t; continue
            if last and last['k'] == 'ab' and (t.startswith(('Annonce', 'Effet', 'Mots-clés', 'Utilisé par', 'Utilisée Par', 'Utilisé Par', 'Utilisée par', '•')) or (last['x'] and last['x'][-1].startswith('Effet') and not t.startswith('ÉTAPE') and len(last['x']) < 6 and not t[:1].isdigit())):
                if t.startswith('Mots-clés'): t = 'Mots-clés : ' + t[len('Mots-clés'):].strip()
                last['x'].append(t); continue
            if last and last['k'] == 'p' and not re.search(r'[.:!?)»”]$', last['x']) and not re.match(r'^(\d+\.|ÉTAPE|•|[A-ZÉ][A-ZÉ’ ]{6,})', t):
                last['x'] += ' ' + t; continue
            sub['blocks'].append({'k':'p', 'x':t})
    return sections

allsec = parse(range(4, 41))
cut = next(i for i, x in enumerate(allsec) if x['num'] == '1.0' and i > 0)
core, adv = allsec[:cut], allsec[cut:]
# découpe des Règles Avancées en chapitres à chaque « 1.0 »
CH_NAMES = ['Ordres', 'Terrain', 'Magie', "Construction d'armée", 'Champions, musiciens et porte-étendards', 'Tactiques de bataille']
chapters, k = [], -1
for s in adv:
    if s['num'] == '1.0':
        k += 1
        if k < len(CH_NAMES): chapters.append({'name':CH_NAMES[k] if k < len(CH_NAMES) else 'Chapitre', 'sections':[]})
    if 0 <= k < len(CH_NAMES): chapters[k]['sections'].append(s)
json.dump({'core':core, 'adv':chapters}, open('/home/claude/wc/core/core.json', 'w'), ensure_ascii=False, indent=1)
print(len(core), 'sections de base ;', [ (c['name'], len(c['sections'])) for c in chapters])
for s in core: print(s['num'], s['title'], '|', len(s['blocks']), [x['num'] for x in s['subs']])
