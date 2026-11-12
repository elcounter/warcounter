import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs('build-check', exist_ok=True)
VERSION='2.22.1'
MAJ='12-11-2026'
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
DK_BG={'#fff':'#1e1e1e','#ffffff':'#1e1e1e','white':'#1e1e1e'}
for c in ['#f7f2ea','#fbfaf7','#faf7f2','#f7f7f7','#eee5d8','#f1f1f1','#e8e5df','#e4ddd1','#e3dfd8','#efe9df','#f3ede4','#ececec','#eee','#f5f5f5','#f0ebe3','#f4efe6','#ebe5da','#f2ede5']: DK_BG[c]='#262626'
DK_TX={'#1b1b1b':'#ececec','#000':'#ececec','#000000':'#ececec','#222':'#e0e0e0','#333':'#d0d0d0','#333333':'#d0d0d0','#3a3a3a':'#c8c8c8','#444':'#bdbdbd','#555':'#b0b0b0','#5f5f5f':'#a8a8a8','#666':'#a8a8a8'}
DK_LN={c:'#3a3a3a' for c in ['#d6cfc3','#ccc','#dcdcdc','#d8d8d8','#e4ddd1','#eee5d8','#e3dfd8','#e8e5df','#ddd','#e0e0e0','#c9c9c9','#d6d6d6','#e6e0d6','#eee','#e5e5e5']}
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
DARK_VARS="""html[data-theme="dark"]{color-scheme:dark;--page:#121212;--card:#1e1e1e;--colhead:#2c2c2c;--namebar:#2a2a2a;--soft:#262626;--ink:#ececec;--muted:#a8a8a8;--line:#3a3a3a;--khaki:#6f6340;--disc:#0c0c0c;--ph-passive:#3a3a3a}
html[data-theme="dark"] body{background:var(--page);color:var(--ink)}
html[data-theme="dark"] input,html[data-theme="dark"] select,html[data-theme="dark"] textarea{background:#262626;color:var(--ink);border-color:#444}
html[data-theme="dark"] a{color:#e9c96b}
html[data-theme="dark"] .bar a,html[data-theme="dark"] .btn-install,html[data-theme="dark"] .sc-btn,html[data-theme="dark"] .bnav a{color:inherit}
.copy .theme-btn,.theme-btn{cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin:0 0 6px;padding:5px 12px;border:1px solid #d6cfc3;border-radius:999px;background:#fff;color:var(--bar);font:600 12px var(--body);vertical-align:top}
html[data-theme="dark"] .copy .sup-link,html[data-theme="dark"] .theme-btn{background:#262626;border-color:#444;color:#e9c96b}
.theme-btn svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round}
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

nav='''<nav class="bnav" aria-label="Navigation principale"><div class="in">
  <a href="#listes" id="nav-lists">'''+ICON_LIST+'''<span>Listes</span></a>
  <a href="#memo" id="nav-memo">'''+ICON_BOOK+'''<span>Mémo</span></a>
  <a href="#phases" id="nav-phases">'''+ICON_LAYERS+'''<span>Phases</span></a>
  <a href="#regles" id="nav-regles">'''+ICON_RULES+'''<span>Règles</span></a>
  <a href="#parties" id="nav-parties">'''+ICON_DICE+'''<span>Parties</span></a>
</div></nav>'''

imgs={os.path.basename(f)[:-4]:'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob('army-img/*.jpg'))}
of={}
maps={os.path.basename(f)[:-4]:'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob('maps/*.jpg'))}

fac_js='window.WC_VERSION = "'+VERSION+'";\nwindow.WC_FAC = '+open('fac/factions.json').read()+';\nwindow.WC_UMANIF = '+open('fac/universal.json').read()+';\nwindow.WC_MANIF = '+open('fac/manif.json').read()+';\nwindow.WC_ROR = '+open('fac/ror.json').read()+';\nwindow.WC_AOR = '+open('fac/aor.json').read()+';\nwindow.WC_FIMG = '+json.dumps({os.path.basename(f)[:-4]:'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob('fac-img/*.jpg'))})+';'
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
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", top);
  top();
})();'''

ALLCSS=army_css+'\n'+bs_css+'\n'+home_css+'\n'+extra+open('home.css').read()
html='''<title>WarCounter</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#6b2119">
<script>try{if(localStorage.getItem("wc-theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}</script>
<style>#boot{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#6b2119;transition:opacity .25s}#boot.out{opacity:0;pointer-events:none}#boot img{width:240px;height:240px;border-radius:50%;animation:bootspin 1.2s linear infinite}@keyframes bootspin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){#boot img{animation-duration:3s}}</style>
<div id="boot" aria-hidden="true"><img alt="" src="data:image/png;base64,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"></div>
<script>addEventListener("load",function(){setTimeout(function(){var b=document.getElementById("boot");if(!b)return;b.classList.add("out");setTimeout(function(){b.remove()},300)},1400)});</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Bitter:wght@400;600;700&display=swap">
<style>
'''+ALLCSS+'\n'+DARK_VARS+dark_css(ALLCSS)+'''
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
