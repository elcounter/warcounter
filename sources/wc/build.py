import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs('build-check', exist_ok=True)
VERSION='2.19.1'
MAJ='07-11-2026'
LEGAL='<span class="legal">Application non officielle, non affiliée à Games Workshop.<br>Warhammer Age of Sigmar est une marque de Games Workshop Ltd.</span>'
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
#app-army .cleg{margin:0 0 10px;font-size:13px;color:var(--muted)}
#app-army .ctot{background:#f7f2ea;border:1px solid #e4ddd1;border-radius:10px;padding:10px 12px 2px;margin-bottom:14px}
#app-army .clab{display:block;font:700 12px var(--body);text-transform:uppercase;letter-spacing:.05em;color:var(--accent,#6b2119)}
#app-army .csub{margin:0 -16px;padding:7px 16px;background:#6b2119;color:#fff;font:700 12px var(--body);text-transform:uppercase;letter-spacing:.06em}
#app-army .csub+.crow{border-top:0}
#app-army .crow{display:block;width:100%;text-align:left;background:none;border:0;border-top:1px solid #eee5d8;padding:10px 0 0;margin:0;font:inherit;color:inherit;cursor:pointer}
#app-army .crow>span{font-weight:600}
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
HOME_A='<a class="hm hm-map" href="#carte" aria-label="Carte des joueurs">'+I('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>')+'</a><a class="hm hm-acc" href="#compte" aria-label="Mon compte">'+I('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>')+'</a><a class="hm" href="#accueil" aria-label="Accueil">'+I('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>')+'</a>'
ICON_DICE=I('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>')
BACK='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>'

bs_shell=open('shells/partie-shell.html').read()
bs_body=bs_shell[bs_shell.index('</style>')+8:bs_shell.index('<script>')]
bs_body=bs_body.replace('id="back"','id="bs-back"').replace('<h1 id="title">Feuille de Bataille</h1>','<h1 id="bs-title">Feuille de Bataille</h1>')
bs_body=bs_body.replace('<main class="in"><div class="stack" id="view"></div></main>','<main class="in"><div class="stack" id="view"></div><p class="copy"><a class="sup-link" href="#soutenir">Si tu veux soutenir le projet</a><br>© 2026 elcounter. Tous droits réservés.<br>WarCounter version '+VERSION+' · MAJ '+MAJ+'<br>'+LEGAL+'</p></main>')
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
  <p class="copy"><a class="sup-link" href="#soutenir">Si tu veux soutenir le projet</a><br>© 2026 elcounter. Tous droits réservés.<br>WarCounter version '''+VERSION+''' · MAJ '''+MAJ+'''<br>'''+LEGAL+'''</p>
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

html='''<title>WarCounter</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#6b2119">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Bitter:wght@400;600;700&display=swap">
<style>
'''+army_css+'\n'+bs_css+'\n'+home_css+'\n'+extra+open('home.css').read()+'''
</style>
<div id="app-army" hidden>
'''+army_body+'''
</div>
<div id="app-home">
<header class="bar"><div class="in top"><button class="back" id="home-back" type="button" aria-label="Retour" hidden>'''+BACK+'''</button><h1 id="home-title">WarCounter</h1>'''+HOME_A+'''<span class="menu-hint" id="menu-hint" hidden aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5M6 11l6-6 6 6"/></svg><span>App</span></span></div></header>
<main class="in"><div id="home-view"></div><p class="copy">© 2026 elcounter. Tous droits réservés.<br>WarCounter version '''+VERSION+''' · MAJ '''+MAJ+'''<br>'''+LEGAL+'''</p></main>
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
'''
open('warcounter.html','w').write(html)
for n,js in [('army',army_js),('bs',bs_js),('home',home_js),('top',top_js)]: open(f'build-check/wc-{n}.js','w').write(js)
print(len(html))
