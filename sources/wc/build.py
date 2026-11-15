import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs('build-check', exist_ok=True)
VERSION='2.26.2'
MAJ='15-11-2026'
LEGAL='<span class="legal">Application non officielle, non affiliée à Games Workshop.<br>Warhammer Age of Sigmar est une marque de Games Workshop Ltd.<br>Données des unités issues de BSData (projet communautaire open source).</span>'
THEME_BTN='<button type="button" class="sup-link theme-btn" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg><span>Mode sombre</span></button>'
import re, json, base64, glob, os

def split_rules(css):
    """Yield (prelude, body) for top-level blocks."""
    out=[]; i=0; n=len(css)
    while i<n:
        j=css.find('{',i)
        if j<0: break
        pre=css[i:j].strip(); depth=1; k=j+1
        while depth:
            if css[k]=='{': depth+=1
            elif css[k]=='}': depth-=1
            k+=1
        out.append((pre, css[j+1:k-1])); i=k
    return out

GLOBAL=re.compile(r'^(:root|\*|html|body|button|select|input|:focus-visible|\[hidden\]|@keyframes)')
def scope(css, sc, keep_global):
    css=re.sub(r'/\*.*?\*/','',css,flags=re.S)
    res=[]
    for pre,body in split_rules(css):
        if pre.startswith('@media') or pre.startswith('@supports'):
            inner=scope(body, sc, keep_global)
            if inner.strip(): res.append(pre+'{'+inner+'}')
        elif pre.startswith('@keyframes'):
            res.append(pre+'{'+body+'}')
        else:
            sels=[s.strip() for s in pre.split(',')]
            if all(GLOBAL.match(s) for s in sels):
                if keep_global: res.append(pre+'{'+body+'}')
                continue
            new=[]
            for s in sels:
                if GLOBAL.match(s):
                    if keep_global: new.append(s)
                    continue
                new.append(sc+' '+s)
            res.append(','.join(new)+'{'+body+'}')
    return '\n'.join(res)


# ---------- Mode sombre : règles générées à partir des couleurs claires codées en dur ----------
DK_BG={'#fff':'#25201c','#ffffff':'#25201c','white':'#25201c'}
for c in ['#f7f2ea','#fbfaf7','#faf7f2','#f7f7f7','#eee5d8','#f1f1f1','#e8e5df','#e4ddd1','#e3dfd8','#efe9df','#f3ede4','#ececec','#eee','#f5f5f5','#f0ebe3','#f4efe6','#ebe5da','#f2ede5']: DK_BG[c]='#2e2823'
DK_TX={'#1b1b1b':'#ececec','#000':'#ececec','#000000':'#ececec','#222':'#e0e0e0','#333':'#d0d0d0','#333333':'#d0d0d0','#3a3a3a':'#c8c8c8','#444':'#bdbdbd','#555':'#b0b0b0','#5f5f5f':'#a8a8a8','#666':'#a8a8a8'}
DK_LN={c:'#4a4038' for c in ['#d6cfc3','#ccc','#dcdcdc','#d8d8d8','#e4ddd1','#eee5d8','#e3dfd8','#e8e5df','#ddd','#e0e0e0','#c9c9c9','#d6d6d6','#e6e0d6','#eee','#e5e5e5']}
def _dk_decl(d):
    if ':' not in d: return None
    k,v=d.split(':',1); k=k.strip().lower(); vl=v.strip().lower()
    def sub(M):
        r=vl
        for a,b in sorted(M.items(),key=lambda x:-len(x[0])):
            r=re.sub(re.escape(a)+r'(?![0-9a-f])',b,r)
        return r
    if k in ('background','background-color'):
        r=sub(DK_BG); 
        if r!=vl: return k+':'+r
    elif k=='color':
        r=sub(DK_TX)
        if r!=vl: return k+':'+r
    elif k.startswith('border') or k=='outline' or k=='box-shadow':
        r=sub(DK_LN)
        if r!=vl: return k+':'+r
    return None
def dark_css(css):
    css=re.sub(r'/\*.*?\*/','',css,flags=re.S); out=[]
    for pre,body in split_rules(css):
        if pre.startswith('@media') or pre.startswith('@supports'):
            inner=dark_css(body)
            if inner: out.append(pre+'{'+inner+'}')
            continue
        if pre.startswith('@') or pre.startswith(':root') : continue
        ds=[x for x in (_dk_decl(d) for d in body.split(';')) if x]
        if not ds: continue
        sels=[]
        for sl in pre.split(','):
            sl=sl.strip()
            if sl.startswith('html'): sl='html[data-theme="dark"]'+sl[4:]
            elif sl.startswith('body'): sl='html[data-theme="dark"] '+sl
            else: sl='html[data-theme="dark"] '+sl
            sels.append(sl)
        out.append(','.join(sels)+'{'+';'.join(ds)+'}')
    return '\n'.join(out)
DARK_VARS="""html[data-theme="dark"]{color-scheme:dark;--page:#1a1714;--card:#25201c;--colhead:#3a2f27;--namebar:#3a2f27;--soft:#2e2823;--ink:#ece4d8;--muted:#b0a597;--line:#4a4038;--khaki:#5a4a3c;--gold:#5a4a3c;--disc:#120f0d;--ph-hero:#3a2f27;--ph-shoot:#3a2f27;--ph-fight:#3a2f27;--ph-charge:#3a2f27;--ph-passive:#3a2f27;--ph-end:#3a2f27;--ph-defense:#3a2f27;--ph-move:#3a2f27}
html[data-theme="dark"] body{background-color:#1a1714;background-image:radial-gradient(ellipse at 20% 0%,rgba(255,240,220,.05),transparent 55%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 .95 0 0 0 0 .9 0 0 0 .035 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
html[data-theme="dark"] .bar{background:linear-gradient(180deg,#5a2a17,#3a1c10);border-bottom-color:#5a4a3c}
html[data-theme="dark"] #app-army .statband,html[data-theme="dark"] #app-home .statband{background:linear-gradient(180deg,#2e2823,#3a2f27);color:var(--ink)}
html[data-theme="dark"] #app-army .statband .l,html[data-theme="dark"] #app-home .statband .l,html[data-theme="dark"] #app-army .statband .unit-pts,html[data-theme="dark"] #app-home .statband .unit-pts{color:var(--ink)}
html[data-theme="dark"] #app-army .disc,html[data-theme="dark"] #app-home .disc{background:#120f0d;border-color:#5a4a3c}
html[data-theme="dark"] #app-army .disc.sv,html[data-theme="dark"] #app-home .disc.sv{background:#5a2a17}
html[data-theme="dark"] body{background:var(--page);color:var(--ink)}
html[data-theme="dark"] input,html[data-theme="dark"] select,html[data-theme="dark"] textarea{background:#2e2823;color:var(--ink);border-color:#5a4a3c}
html[data-theme="dark"] a{color:#e0a27e}
html[data-theme="dark"] .bar a,html[data-theme="dark"] .btn-install,html[data-theme="dark"] .sc-btn,html[data-theme="dark"] .bnav a{color:inherit}
.back-game{position:fixed;left:0;right:0;bottom:var(--navh);z-index:30;display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--bar);color:#fff;font:700 15px var(--body);text-decoration:none;box-shadow:0 -2px 8px rgba(0,0,0,.25)}
.back-game[hidden]{display:none}
.back-game svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.back-game b{margin-left:auto;font:700 16px var(--display);letter-spacing:.04em;color:#e9c96b}
body.has-back-game #app-army main{padding-bottom:calc(var(--navh) + 90px)}
.unit-en{margin:2px 0 0;text-align:center;font:italic 13px var(--body);color:var(--muted)}
.copy .theme-btn,.theme-btn{cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin:0 0 6px;padding:5px 12px;border:1px solid #d6cfc3;border-radius:999px;background:#fff;color:var(--bar);font:600 12px var(--body);vertical-align:top}
html[data-theme="dark"] .copy .sup-link,html[data-theme="dark"] .theme-btn{background:#2e2823;border-color:#5a4a3c;color:#e0a27e}
.theme-btn svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round}
"""

# ---------- Charte NecroCounter (parchemin / rouille) ----------
NC_MAP_BG={'#fff':'#f2efe9','#ffffff':'#f2efe9','white':'#f2efe9'}
for c in ['#f7f2ea','#fbfaf7','#faf7f2','#f7f7f7','#f1f1f1','#f5f5f5','#ececec','#eee','#f3ede4','#f0ebe3','#f4efe6','#f2ede5']: NC_MAP_BG[c]='#ebe7df'
for c in ['#eee5d8','#e8e5df','#e4ddd1','#e3dfd8','#efe9df','#ebe5da','#d6d6d6','#dcdcdc','#e0e0e0']: NC_MAP_BG[c]='#e3d6c9'
for c in ['#6b2119','#7a1f17','#8a2a1c']: NC_MAP_BG[c]='#7a3b22'
NC_MAP_BG['#4e170f']='#5a2a17'
NC_MAP_TX={'#1b1b1b':'#2e2a26','#222':'#2e2a26','#333':'#2e2a26','#333333':'#2e2a26','#3a3a3a':'#3b342e','#444':'#4a423b','#555':'#5c534b','#5f5f5f':'#6b6259','#666':'#6b6259','#6b2119':'#8e3420','#a3231a':'#a3341f','#d4ae3f':'#8e3420','#e9c96b':'#f1eadf'}
NC_MAP_LN={c:'#b6ab9c' for c in ['#d6cfc3','#ccc','#dcdcdc','#d8d8d8','#e4ddd1','#eee5d8','#e3dfd8','#e8e5df','#ddd','#e0e0e0','#c9c9c9','#d6d6d6','#e6e0d6','#eee','#e5e5e5']}
NC_MAP_LN.update({'#6b2119':'#7a3b22','#d4ae3f':'#d3bfad'})
def _nc_decl(d):
    if ':' not in d: return None
    k,v=d.split(':',1); k=k.strip().lower(); vl=v.strip().lower()
    def sub(M):
        r=vl
        for a,b in sorted(M.items(),key=lambda x:-len(x[0])): r=re.sub(re.escape(a)+r'(?![0-9a-f])',b,r)
        return r
    M = NC_MAP_BG if k in ('background','background-color','fill') else NC_MAP_TX if k in ('color','stroke') else NC_MAP_LN if (k.startswith('border') or k in ('outline','box-shadow')) else None
    if not M: return None
    r=sub(M); return k+':'+r if r!=vl else None
def nc_css(css):
    css=re.sub(r'/\*.*?\*/','',css,flags=re.S); out=[]
    for pre,body in split_rules(css):
        if pre.startswith('@media') or pre.startswith('@supports'):
            if 'prefers-color-scheme' in pre: continue
            inner=nc_css(body)
            if inner: out.append(pre+'{'+inner+'}')
            continue
        if pre.startswith('@') or pre.startswith(':root') or 'data-theme' in pre: continue
        ds=[x for x in (_nc_decl(d) for d in body.split(';')) if x]
        if ds: out.append(pre+'{'+';'.join(ds)+'}')
    return '\n'.join(out)
NC_BASE=""":root{--bar:#7a3b22;--bar-dk:#5a2a17;--bar-ink:#f1eadf;--khaki:#d3bfad;--olive:#8e3420;--olive-dk:#5a2a17;--gold:#d3bfad;--gold-dk:#8e3420;
--page:#dcd7cd;--card:#f2efe9;--colhead:#d3bfad;--namebar:#4a3a30;--soft:#e3d6c9;--ink:#2e2a26;--muted:#6b6259;--line:#b6ab9c;--disc:#2e2a26;--rim:#b6ab9c;--bad:#a3341f;
--body:"Source Sans 3","Segoe UI",Arial,sans-serif;--navh:calc(58px + env(safe-area-inset-bottom,0px))}
body{font-size:16px;line-height:1.45;background-color:#dcd7cd;background-image:radial-gradient(ellipse at 20% 0%,rgba(255,255,255,.45),transparent 55%),radial-gradient(ellipse at 90% 60%,rgba(255,255,255,.25),transparent 50%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .3 0 0 0 0 .25 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-attachment:fixed}
.bar{background:linear-gradient(180deg,#7a3b22,#5a2a17);color:#f1eadf;border-bottom:3px solid #d3bfad;box-shadow:0 2px 8px rgba(46,42,38,.3)}
.bnav{height:var(--navh)}
.bar h1,.sec,.btn,.lbl,.bnav a span,.panel h2,.mtitle,h1,h2,h3{letter-spacing:.05em}
a{color:#8e3420}
/* Fiches : bandeaux brun foncé, pastilles carrées */
:root{--ph-hero:#4a3a30;--ph-shoot:#4a3a30;--ph-fight:#4a3a30;--ph-charge:#4a3a30;--ph-passive:#4a3a30;--ph-end:#4a3a30;--ph-defense:#4a3a30;--ph-move:#4a3a30;--save:#4a3a30}
#app-army .disc,#app-home .disc,#app-army .disc.sv,#app-home .disc.sv,#app-army .disc.wd,#app-home .disc.wd{border-radius:12px;background:#2e2a26;border:2px solid #d3bfad;box-shadow:0 1px 3px rgba(46,42,38,.35);color:#f1eadf}
#app-army .disc.sv,#app-home .disc.sv{background:#5a2a17}
#app-army .disc.wd,#app-home .disc.wd{background:#8e3420}
#app-army .statband,#app-home .statband{background:linear-gradient(180deg,#e3d6c9,#d3bfad);color:#2e2a26}
#app-army .statband .l,#app-home .statband .l,#app-army .statband .unit-pts,#app-home .statband .unit-pts{color:#2e2a26}
#app-army .statband .unit-en,#app-home .statband .unit-en{color:#6b6259}
"""

def get_css(path):
    s=open(path).read(); return s[s.index('<style>')+7:s.index('</style>')]

army_css=scope(get_css('shells/mega-shell.html'),'#app-army',True)
bs_css=scope(get_css('shells/partie-shell.html'),'#app-bs',False)
home_css=scope(get_css('shells/mega-shell.html'),'#app-home',False)
extra='''
.copy .legal{display:inline-block;margin-top:3px;font-size:9px;line-height:1.3;color:#b3b3b3;letter-spacing:.02em}
#app-army .lbar{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px}
#app-army .lbar .btn{flex:1;min-width:120px}
#app-army .lmsg{margin:0 0 12px;font-size:13px;color:var(--muted)}
#app-army .cbar{display:flex;height:12px;border-radius:6px;background:#e4ddd1;overflow:hidden;margin:6px 0 4px}
#app-army .cbar.sm{height:6px;margin:8px 0 0}
#app-army .cbar .cp{background:#3f7d4a}
#app-army .cbar .ce{background:#d4ae3f}
#app-army .cbar .ca{background:#b33a2b}
#app-army .cleg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:4px;vertical-align:0}
#app-army .cleg .dp{background:#3f7d4a}
#app-army .cleg .de{background:#d4ae3f}
#app-army .cleg .da{background:#b33a2b}
#app-army .cleg{margin:0 0 10px;font-size:13px;color:var(--muted)}
#app-army .ctot{background:#f7f2ea;border:1px solid #e4ddd1;border-radius:10px;padding:10px 12px 2px;margin-bottom:14px}
#app-army .clab{display:block;font:700 12px var(--body);text-transform:uppercase;letter-spacing:.05em;color:var(--accent,#6b2119)}
#app-army .csub{margin:0 -16px;padding:7px 16px;background:#6b2119;color:#fff;font:700 12px var(--body);text-transform:uppercase;letter-spacing:.06em}
#app-army .csub+.crow{border-top:0}
#app-army .crow{display:block;width:100%;text-align:left;background:none;border:0;border-top:1px solid #eee5d8;padding:10px 0 0;margin:0;font:inherit;color:inherit;cursor:pointer}
#app-army .crow>span{font-weight:600}
#app-army .crow>span{display:inline-flex;align-items:center;gap:6px}
#app-army .cdone{width:18px;height:18px;flex:none}
#app-army .cdone circle{fill:#3f7d4a}
#app-army .cdone path{fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
#app-army .crow.on>span{color:var(--accent,#6b2119)}
#app-army .cunit{padding:10px 0;border-top:1px solid #eee5d8}
#app-army .cunit:first-child{border-top:0;padding-top:0}
#app-army .cun{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px}
#app-army .cnum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#app-army .cst{display:flex;flex-direction:column;gap:4px;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;text-align:center}
#app-army .cstep{display:flex;align-items:center;justify-content:space-between;border:1px solid #d6cfc3;border-radius:10px;background:#fff;overflow:hidden}
#app-army .cstep button{width:38px;height:42px;border:0;background:#f7f2ea;color:#6b2119;font:700 22px/1 var(--body);cursor:pointer;touch-action:manipulation}
#app-army .cstep button:active{background:#e4ddd1}
#app-army .cstep button:disabled{color:#c9c2b6}
#app-army .cstep input{flex:1;min-width:0;width:100%;border:0;background:#fff;text-align:center;font:700 17px var(--body);color:var(--text,#222);padding:0;-moz-appearance:textfield}
#app-army .cstep input::-webkit-outer-spin-button,#app-army .cstep input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
#app-army #coll .body>select{width:100%;margin-bottom:10px}
#app-army .mwar,#app-home .mwar{margin-top:10px;border-top:1px dashed var(--line,#ccc);padding-top:8px}
#app-army .mwar>summary,#app-home .mwar>summary{cursor:pointer;font-weight:600;font-size:13px;color:var(--accent,#6b2119)}
#app-army .mwar .statband,#app-home .mwar .statband{margin:8px 0}
#app-army .imp-text{width:100%;box-sizing:border-box;min-height:120px;padding:10px;border:1px solid var(--line,#ccc);border-radius:8px;font:13px/1.4 ui-monospace,Menlo,Consolas,monospace;resize:vertical;margin-bottom:10px;background:#fff;color:inherit}
#app-army .msearch,#app-home .rsearch{width:100%;margin:0 0 12px;padding:11px 14px;border:1px solid #cfc9bf;border-radius:8px;font:400 15px var(--body);background:#fff;color:var(--ink)}
#app-army .nores{color:var(--muted);font-size:14px;text-align:center;margin:10px 0}
#app-army .list{grid-template-columns:1fr;gap:8px}
#app-army .unit-link[hidden],#app-home .rres[hidden],#app-home .rall[hidden]{display:none}
#app-army .unit-link{aspect-ratio:auto;display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;background:var(--card);color:var(--ink);border-left:5px solid var(--namebar);padding:13px 16px;font:700 16px/1.3 var(--body);box-shadow:0 1px 2px rgba(0,0,0,.12);cursor:pointer}
#app-army .unit-link:hover{background:#faf7f2}
#app-army .unit-link.army-link{background:var(--bar);color:#fff;border-left-color:var(--gold)}
#app-army .unit-link .badge{position:static;order:2;flex:none}
#app-army #list{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
#app-army #list .unit-link{aspect-ratio:1;display:grid;place-items:center;justify-content:center;align-content:center;text-align:center;padding:12px;border:0;border-radius:10px;background:var(--namebar);color:#fff;font:700 clamp(14px,4vw,17px)/1.25 var(--body);overflow-wrap:anywhere}
#app-army #list .unit-link:hover{background:var(--namebar);filter:brightness(1.12)}
#app-army #list .unit-link.army-link{background:var(--bar);box-shadow:inset 0 0 0 2px var(--gold)}
#app-army #list .unit-link .badge{position:absolute;top:8px;right:8px}
#app-army #list .unit-link.has-photo{place-items:end start;justify-content:stretch;align-content:end;text-align:left;background:linear-gradient(to top,rgba(0,0,0,.9) 0%,rgba(0,0,0,.55) 35%,rgba(0,0,0,0) 70%),var(--img) center 30%/cover no-repeat,#e8e5df}
#app-army #list .nores{grid-column:1/-1}
.bnav .in{margin:0 auto;padding-left:max(16px, env(safe-area-inset-left,0px));padding-right:max(16px, env(safe-area-inset-right,0px))}
#app-army .lc-fac{display:block;font:500 12px var(--display);text-transform:uppercase;letter-spacing:.06em;color:var(--gold-dk);margin-top:2px}
#app-army .newl{display:flex;gap:10px;align-items:center}
#app-army .newl select{flex:1;min-width:0}
#app-army .facname{margin:4px 0 0;font-weight:600}
#app-army .catsel{margin:-6px 0 14px}
#app-army .catsel select{width:100%}
:root{--navh:calc(64px + env(safe-area-inset-bottom,0px))}
#app-army main{padding-bottom:calc(40px + var(--navh))}
#app-bs main{padding-bottom:calc(96px + var(--navh))}
#app-bs .foot{bottom:var(--navh);padding-bottom:0}
#app-bs .modal{z-index:30}
.copy{margin:28px 0 0;text-align:center;font:400 11px/1.4 var(--body);color:#9d9d9d;letter-spacing:.04em}
.bnav{position:fixed;left:0;right:0;bottom:0;z-index:8;background:#fff;border-top:1px solid #d8d8d8;padding-bottom:env(safe-area-inset-bottom,0px);box-shadow:0 -2px 8px rgba(0,0,0,.08)}
.bnav .in{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));max-width:820px}
.bnav a{display:grid;justify-items:center;gap:3px;padding:8px 2px 9px;text-decoration:none;color:#6d6d6d;font:500 12px var(--display);text-transform:uppercase;letter-spacing:.06em;border-top:3px solid transparent;margin-top:-1px}
.bnav a[aria-current="page"]{color:var(--bar);border-top-color:var(--bar)}
.bnav svg{width:24px;height:24px}
.brand{display:flex;align-items:center;gap:10px;min-width:0}
.brand-mark{flex:none;width:34px;height:34px}
'''
I=lambda d:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>'
ICON_LIST=I('<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>')
ICON_BOOK=I('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M9 7h6"/>')
ICON_LAYERS=I('<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>')
ICON_RULES=I('<path d="M12 4v16M5 7l7-3 7 3M5 7l-2 6a3 3 0 0 0 4 0zM19 7l-2 6a3 3 0 0 0 4 0zM8 20h8"/>')
HOME_A='<a class="hm hm-col" href="#collection" aria-label="Collection">'+I('<path d="M18 3l3 3-9 9-3-3z"/><path d="M9 12l-4 1-2 7 7-2 1-4"/>')+'</a><a class="hm hm-map" href="#carte" aria-label="Carte des joueurs">'+I('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>')+'</a><a class="hm hm-acc" href="#compte" aria-label="Mon compte">'+I('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>')+'</a><a class="hm" href="#accueil" aria-label="Accueil">'+I('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>')+'</a>'
ICON_DICE=I('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>')
BACK='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>'

bs_shell=open('shells/partie-shell.html').read()
bs_body=bs_shell[bs_shell.index('</style>')+8:bs_shell.index('<script>')]
bs_body=bs_body.replace('id="back"','id="bs-back"').replace('<h1 id="title">Feuille de Bataille</h1>','<h1 id="bs-title">Feuille de Bataille</h1>')
bs_body=bs_body.replace('<main class="in"><div class="stack" id="view"></div></main>','<main class="in"><div class="stack" id="view"></div><p class="copy"><a class="sup-link" href="#soutenir">Si tu veux soutenir le projet</a><br>'+THEME_BTN+'<br>© 2026 elcounter. Tous droits réservés.<br>WarCounter version '+VERSION+' · MAJ '+MAJ+'<br>'+LEGAL+'</p></main>')
bs_body=bs_body.replace('<button class="icon-btn" id="bp-info"',HOME_A+'<button class="icon-btn" id="bp-info"')
assert 'id="bs-title"' in bs_body and 'class="copy"' in bs_body

army_body='''<header class="bar">
  <div class="in top">
    <button class="back" id="back" type="button" aria-label="Retour" hidden>'''+BACK+'''</button>
    <h1 id="title">WarCounter</h1>
    '''+HOME_A+'''
  </div>
</header>
<main class="in">
  <section id="view-lists" hidden><div id="lists"></div></section>
  <section id="view-edit" hidden><div id="edit"></div></section>
  <section id="view-coll" hidden><div id="coll"></div></section>
  <section id="view-memo"><div id="memo-banner"></div><div class="list" id="list"></div></section>
  <section id="view-unit" hidden><div class="sheet" id="unit"></div></section>
  <section id="view-phases" hidden><div id="phase-banner"></div><div class="phases" id="phases"></div></section>
  <p class="copy"><a class="sup-link" href="#soutenir">Si tu veux soutenir le projet</a><br>'''+THEME_BTN+'''<br>© 2026 elcounter. Tous droits réservés.<br>WarCounter version '''+VERSION+''' · MAJ '''+MAJ+'''<br>'''+LEGAL+'''</p>
</main>'''

nav='''<a id="back-game" class="back-game" href="#parties" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg><span>Retour à la partie</span><b id="back-score"></b></a>
<nav class="bnav" aria-label="Navigation principale"><div class="in">
  <a href="#regles" id="nav-regles">'''+ICON_RULES+'''<span>Règles</span></a>
  <a href="#listes" id="nav-lists">'''+ICON_LIST+'''<span>Listes</span></a>
  <a href="#memo" id="nav-memo">'''+ICON_BOOK+'''<span>Mémo</span></a>
  <a href="#phases" id="nav-phases">'''+ICON_LAYERS+'''<span>Phases</span></a>
  <a href="#parties" id="nav-parties">'''+ICON_DICE+'''<span>Parties</span></a>
</div></nav>'''

imgs={os.path.basename(f)[:-4]:'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob('army-img/*.jpg'))}
of={}
maps={os.path.basename(f)[:-4]:'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob('maps/*.jpg'))}

fac_js='window.WC_VERSION = "'+VERSION+'";\nwindow.WC_PHOTO = '+open('fac/photos.json').read()+';\nwindow.WC_FRN = '+open('fac/frnames.json').read()+';\nwindow.WC_FAC = '+open('fac/factions.json').read()+';\nwindow.WC_UMANIF = '+open('fac/universal.json').read()+';\nwindow.WC_MANIF = '+open('fac/manif.json').read()+';\nwindow.WC_ROR = '+open('fac/ror.json').read()+';\nwindow.WC_AOR = '+open('fac/aor.json').read()+';\nwindow.WC_FIMG = '+json.dumps({os.path.basename(f)[:-4]:'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob('fac-img/*.jpg'))})+';'
army_js='(function(){\n  "use strict";\n'+open('army-data.js').read()+"\n  const IMG = "+json.dumps(imgs)+";\n  const PHOTO_OF = "+json.dumps(of)+";\n"+open('army-app.js').read()+'\n})();'
bs_js='(function(){\n  "use strict";\n'+open('bs-data.js').read()+"\n  const MAPS = "+json.dumps(maps)+";\n  window.WC_BS = {BATTLEPLANS, TACTICS, TIERS, MAPS};\n"+open('bs-app.js').read()+'\n})();'
home_js='(function(){\n  "use strict";\n'+open('home.js').read().replace('/*AB*/',open('ab.js').read()).replace('/*PAYPALQR*/','data:image/png;base64,'+base64.b64encode(open('paypal-qr.png','rb').read()).decode()).replace('/*CORE*/',open('core/core.json').read()).replace('/*FACTIONS*/',open('fac/factions.json').read()).replace('/*FIMG*/',json.dumps({os.path.basename(f)[:-4]:'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob('fac-img/*.jpg'))}))+'\n})();'
top_js='''(function(){
  "use strict";
  const $ = id => document.getElementById(id);
  const ARMY_TABS = {listes:"lists", phases:"phases"};
  function top(){
    const h = location.hash.slice(1);
    let app = "army", tab = "memo";
    if (h === "" || h === "accueil") { app = "home"; tab = ""; }
    else if (h === "installer" || h === "soutenir" || h === "avenir" || h === "compte" || h === "confidentialite" || h === "carte") { app = "home"; tab = ""; }
    else if (h === "regles" || h.startsWith("regle-")) { app = "home"; tab = "regles"; }
    else if (h === "parties") { app = "bs"; tab = "parties"; }
    else if (h === "listes" || h.startsWith("liste-")) tab = "lists";
    else if (h === "phases") tab = "phases";
    else if (h === "collection") tab = "";
    ["army","bs","home"].forEach(k => { $("app-" + k).hidden = k !== app; });
    ["lists","memo","phases","regles","parties"].forEach(k => { if (k === tab) $("nav-" + k).setAttribute("aria-current", "page"); else $("nav-" + k).removeAttribute("aria-current"); });
    // Barre « Retour à la partie » tant que l'on consulte le Mémo / les Phases d'un joueur
    const G = window.WCGame || {};
    if (G.view && !(app === "army" && (tab === "memo" || tab === "phases"))) G.view = null;
    const bg = $("back-game"); if (bg) { bg.hidden = !G.view; $("back-score").textContent = G.view && G.scoreLine ? G.scoreLine() : ""; }
    document.body.classList.toggle("has-back-game", !!G.view);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", top);
  // La barre de navigation revient à ta propre liste
  document.addEventListener("click", e => {
    const a = e.target.closest(".bnav a"); const G = window.WCGame;
    if (!a || !G || !G.view) return;
    G.view = null;
    if (a.getAttribute("href") === location.hash) setTimeout(() => window.dispatchEvent(new HashChangeEvent("hashchange")), 0);
  });
  top();
})();'''

ALLCSS=army_css+'\n'+bs_css+'\n'+home_css+'\n'+extra+open('home.css').read()
html='''<title>WarCounter</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#5a2a17" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#3a1c10" media="(prefers-color-scheme: dark)">
<script>try{if(localStorage.getItem("wc-theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}</script>
<style>#boot{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#6a321d;transition:opacity .25s}#boot.out{opacity:0;pointer-events:none}#boot img{width:240px;height:240px;border-radius:50%;animation:bootspin 1.2s linear infinite}@keyframes bootspin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){#boot img{animation-duration:3s}}</style>
<div id="boot" aria-hidden="true"><img alt="" src="data:image/png;base64,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RERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERETeX/8PZtIU0unQ218AAAAASUVORK5CYII="></div>
<script>addEventListener("load",function(){setTimeout(function(){var b=document.getElementById("boot");if(!b)return;b.classList.add("out");setTimeout(function(){b.remove()},300)},1400)});</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&display=swap">
<style>
'''+ALLCSS+'\n'+NC_BASE+nc_css(ALLCSS)+'\n'+DARK_VARS+dark_css(ALLCSS)+'''
</style>
<div id="app-army" hidden>
'''+army_body+'''
</div>
<div id="app-home">
<header class="bar"><div class="in top"><button class="back" id="home-back" type="button" aria-label="Retour" hidden>'''+BACK+'''</button><h1 id="home-title">WarCounter</h1>'''+HOME_A+'''</div></header>
<main class="in"><div id="home-view"></div><p class="copy">'''+THEME_BTN+'''<br>© 2026 elcounter. Tous droits réservés.<br>WarCounter version '''+VERSION+''' · MAJ '''+MAJ+'''<br>'''+LEGAL+'''</p></main>
</div>
<div id="app-bs" hidden>
'''+bs_body+'''
</div>
'''+nav+'''
<script>
'''+fac_js+'''
</script>
<script>
'''+army_js+'''
</script>
<script>
'''+bs_js+'''
</script>
<script>
'''+home_js+'''
</script>
<script>
'''+top_js+'''
</script>
<script>
// Mode sombre : préférence gardée sur cet appareil
(function(){
  var root=document.documentElement, B=document.querySelectorAll(".theme-btn");
  function paint(){var d=root.dataset.theme==="dark";B.forEach(function(b){b.querySelector("span").textContent=d?"Mode clair":"Mode sombre";b.setAttribute("aria-pressed",d)})}
  B.forEach(function(b){b.addEventListener("click",function(){var d=root.dataset.theme!=="dark";if(d)root.dataset.theme="dark";else delete root.dataset.theme;try{localStorage.setItem("wc-theme",d?"dark":"light")}catch(e){}paint()})});
  paint();
})();
</script>
'''
open('warcounter.html','w').write(html)
for n,js in [('army',army_js),('bs',bs_js),('home',home_js),('top',top_js)]: open(f'build-check/wc-{n}.js','w').write(js)
print(len(html))
