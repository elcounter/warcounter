import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs('build-check', exist_ok=True)
VERSION='2.26.4'
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
<style>#boot{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#6a321d;transition:opacity .25s}#boot.out{opacity:0;pointer-events:none}#boot .bw{display:flex;flex-direction:column;align-items:center}#boot i{display:block;width:45px;height:6px;margin-top:6px;background:#d3bfad}#boot img{width:84px;height:84px;animation:bootspin 1.2s linear infinite}@keyframes bootspin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){#boot img{animation-duration:3s}}</style>
<div id="boot" aria-hidden="true"><div class="bw"><img alt="" src="data:image/png;base64,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"><i></i></div></div>
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
