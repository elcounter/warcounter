  // ---------- Accueil et Règles ----------
  const BS = window.WC_BS;
  const PHASE = {hero:"var(--ph-hero)", shoot:"var(--ph-shoot)", fight:"var(--ph-fight)", charge:"var(--ph-charge)", passive:"var(--ph-passive)", end:"var(--ph-end)", defense:"var(--ph-defense)", move:"var(--ph-move)"};
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
/*AB*/

  const GHB = [
    {id:"composition", en:"Composition d'armée", sub:"Manuel du Général 2026-27", blocks:[
      {k:"h", x:"Format"},
      {k:"ul", x:["1000 ou 2000 points. 3000 points d'un commun accord.","Une seule faction, et une formation de bataille de cette faction."]},
      {k:"h", x:"Régiments"},
      {k:"ul", x:[
        "Chaque régiment est mené par un HÉROS et peut contenir jusqu'à 3 unités non-HÉROS. Le régiment du général peut en contenir 4.",
        "5 régiments maximum.",
        "Selon les options de régiment de son profil, un HÉROS peut rejoindre le régiment d'un autre HÉROS à la place d'une unité.",
        "Chaque régiment compte comme une pose."]},
      {k:"h", x:"Unités auxiliaires"},
      {k:"ul", x:["Unités hors régiment : chacune compte comme une pose.","À partir de la deuxième, surcoût cumulatif de 20 pts : +20, +40, +60…"]},
      {k:"h", x:"Unités"},
      {k:"ul", x:[
        "Unité renforcée : effectif et coût doublés. Seulement pour les unités de plus d'une figurine.",
        "Unique : un seul exemplaire dans l'armée.",
        "Une unité ne peut pas coûter plus de la moitié des points de la partie."]},
      {k:"h", x:"Améliorations et domaines"},
      {k:"ul", x:[
        "1 amélioration par table (trait héroïque, artefact de pouvoir, etc.), chacune une seule fois.",
        "Pas d'amélioration sur un HÉROS Unique.",
        "1 domaine de sorts, 1 domaine de prières et 1 domaine de manifestations."]},
      {k:"h", x:"Bonus"},
      {k:"ul", x:[
        "50 pts ou plus non dépensés : 1 point de commandement supplémentaire au début du premier round.",
        "Plus de régiments que l'adversaire : tu peux relancer ton jet de priorité une fois par bataille."]}
    ]},
    {id:"round", en:"Déroulé d'un round", sub:"Priorité, outsider, double tour", blocks:[
      {k:"p", x:"Une bataille dure 5 rounds. Chaque round contient 2 tours, un par joueur."},
      {k:"h", x:"Début du round"},
      {k:"ol", x:[
        "Premier round : le joueur qui a fini de se déployer en premier choisit qui prend le premier tour.",
        "Rounds suivants : jet de priorité. Le gagnant choisit qui prend le premier tour. En cas d'égalité, celui qui a joué en premier au round précédent décide.",
        "Déterminez l'outsider.",
        "Chaque joueur reçoit ses points de commandement : 4, ou 5 pour l'outsider."]},
      {k:"h", x:"Outsider"},
      {k:"ul", x:[
        "Le joueur qui a le moins de points de victoire est l'outsider. En cas d'égalité, il n'y en a pas.",
        "Si un joueur prend un double tour, son adversaire devient l'outsider jusqu'à ce qu'il prenne lui-même un double tour.",
        "L'outsider reçoit 5 points de commandement au lieu de 4, et certains battleplans lui donnent une aptitude."]},
      {k:"h", x:"Double tour"},
      {k:"ul", x:[
        "Si le joueur qui a joué en second au round précédent joue en premier à ce round, il prend un double tour.",
        "Il ne peut valider aucune tactique de bataille à ce round.",
        "Exception : s'il est mené de 11 points de victoire ou plus, ça ne compte pas comme un double tour."]},
      {k:"h", x:"Ordre des phases d'un tour"},
      {k:"ol", x:["Phase des héros","Phase de mouvement","Phase de tir","Phase de charge","Phase de combat","Fin du tour"]},
      {k:"h", x:"Points de victoire"},
      {k:"ul", x:["À la fin de chacun de tes tours : objectifs du battleplan.","Tactiques de bataille : 5 PV par niveau validé."]}
    ]},
    {id:"aptitudes", en:"Aptitudes universelles", sub:"Mémo rapide", blocks:[
      {k:"h", x:"Aptitudes de base"},
      {k:"ab", a:AB.mvt}, {k:"ab", a:AB.course}, {k:"ab", a:AB.repli}, {k:"ab", a:AB.tir}, {k:"ab", a:AB.charge}, {k:"ab", a:AB.cac},
      {k:"h", x:"Aptitudes d'arme"},
      {k:"dl", x:[
        ["Anti-X (+1 Perf.)","Ajoutez 1 à la Perforation de l'arme si la cible a le mot-clé écrit après « Anti- » ou remplit la condition écrite. Plusieurs versions se cumulent."],
        ["Charge (+1 Dégât)","Ajoutez 1 aux Dégâts de l'arme si l'unité attaquante a chargé au même tour."],
        ["Compagnon","Sauf indication contraire, l'arme n'est pas affectée par les aptitudes amies qui modifient les caractéristiques des armes ou la séquence d'attaque, hormis celles qui appliquent des modificateurs négatifs."],
        ["Crit (2 Touches)","Une touche critique cause 2 touches au lieu d'1. Faites un jet de blessure pour chaque touche."],
        ["Crit (Blessure Auto.)","Une touche critique blesse automatiquement. Faites un jet de sauvegarde normalement."],
        ["Crit (Mortel)","Une touche critique inflige autant de dégâts mortels que les Dégâts de l'arme, et la séquence d'attaque s'arrête."],
        ["Tir en Mêlée","L'arme de tir peut être utilisée même si l'unité attaquante est en mêlée."]]}
    ]},
    {id:"battleplans", en:"Battleplans", sub:"Manuel du Général 2026-27", bp:true},
    {id:"tactiques", en:"Tactiques de bataille", sub:"Manuel du Général 2026-27", tac:true}
  ];


  // Règles officielles (PDF Les Règles, avril 2025)
  const CORE = /*CORE*/;
  const CORE_PAGES = [{id:"base", en:"Règles de base", sub:CORE.core.length + " sections", core:CORE.core}]
    .concat(CORE.adv.map((c, k) => ({id:"avancees-" + k, en:c.name, sub:"Règles avancées · " + c.sections.length + " sections", core:c.sections, adv:true})));
  const ARMY = window.WC_ARMY;
  const FACDATA = window.WC_FAC || [];
  const FIMG = window.WC_FIMG || {};
  const FACTIONS = [{id:"hashut", en:"Helsmiths of Hashut", ga:"Chaos", src:FIMG.hashut}]
    .concat(FACDATA.map(f => ({id:f.id, en:f.en, ga:{ogors:"Destruction", lumineth:"Ordre", skaven:"Chaos", cities:"Ordre", stormcast:"Ordre", slaves:"Chaos", soulblight:"Mort", daughters:"Ordre", fyreslayers:"Ordre", idoneth:"Ordre", kharadron:"Ordre", seraphon:"Ordre", sylvaneth:"Ordre", khorne:"Chaos", tzeentch:"Chaos", nurgle:"Chaos", slaanesh:"Chaos", fec:"Mort", nighthaunt:"Mort", ossiarch:"Mort", gloomspite:"Destruction", ironjawz:"Destruction", kruleboyz:"Destruction", sons:"Destruction"}[f.id] || "Autres", src:FIMG[f.img], data:f})));
  const ALLIANCES = ["Ordre", "Chaos", "Mort", "Destruction"];
  const RULES = GHB.concat(CORE_PAGES);
  function abCard(a){
    return `<div class="ab" style="--c:${PHASE[a.c]}"><div class="ab-head"><span>${esc(a.t)}</span>${a.cast ? `<span class="cast">${a.cast}</span>` : ""}${a.chant ? `<span class="chant"><span>${a.chant}</span></span>` : ""}${a.cost ? `<span class="cost">${esc(a.cost)}</span>` : ""}</div><div class="ab-name">${esc(a.n)}</div><div class="ab-body">${a.x.map(p => `<p>${esc(p)}</p>`).join("")}</div></div>`;
  }
  function blocks(list){
    return list.map(b => {
      switch (b.k) {
        case "p": return `<p class="blk">${esc(b.x)}</p>`;
        case "h": return `<h3>${esc(b.x)}</h3>`;
        case "ul": return `<ul class="blk">${b.x.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
        case "ol": return `<ol class="blk">${b.x.map(i => `<li>${esc(i)}</li>`).join("")}</ol>`;
        case "dl": return `<dl class="blk">${b.x.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl>`;
        case "ab": return abCard(b.a);
        default: return "";
      }
    }).join("");
  }
  const TCOL = t => /Mouvement/i.test(t) ? "move" : /Tir/.test(t) ? "shoot" : /Charge/i.test(t) ? "charge" : /Mêlée|Attaque|Combat/i.test(t) ? "fight" : /Héros|Sort|Prière/i.test(t) ? "hero" : /Fin d/i.test(t) ? "end" : /Défen|Protection/i.test(t) ? "defense" : "passive";
  const cap = s => { const l = s.toLowerCase(); return l.charAt(0).toUpperCase() + l.slice(1); };
  function coreBlocks(list){
    return list.map(b => {
      if (b.k === "ab") {
        const m = b.t.match(/^(.*?)\s+(\d)$/), t = m ? m[1] : b.t;
        return abCard({c:TCOL(t), t, n:cap(b.n), cost:m ? m[2] + " PC" : "", x:(b.flavor ? ["« " + b.flavor.trim() + " »"] : []).concat(b.x)});
      }
      const x = b.x;
      if (/^ÉTAPE|^[A-ZÉ][A-ZÉ’' ]{8,}$/.test(x)) return `<h5>${esc(x)}</h5>`;
      return `<p>${esc(x)}</p>`;
    }).join("");
  }
  function corePage(r){
    const note = r.adv ? `<p class="blk note-s">Règles avancées du livre de règles (avril 2025). Le Manuel du Général 2026-27 peut les modifier : en cas de doute, la section GHB prime.</p>` : "";
    return note + r.core.map(s => `<details class="fold"><summary><span><b>${esc(s.num)}</b> ${esc(cap(s.title))}</span></summary><div class="fold-body core">
      ${coreBlocks(s.blocks)}${(s.subs || []).map(x => `<h4>${esc(x.num)} ${esc(cap(x.title))}</h4>${coreBlocks(x.blocks)}`).join("")}</div></details>`).join("")
      + `<p class="hint">Texte extrait du PDF officiel « Les Règles ». Signale-moi toute coquille.</p>`;
  }
  function factionPage(){
    const A = ARMY, sec = (title, abs, open) => `<details class="fold"${open ? " open" : ""}><summary><span>${esc(title)}</span></summary><div class="fold-body">${abs.map(abCard).join("")}</div></details>`;
    return `<details class="fold" open><summary><span>Warscrolls <small>· ${A.UNITS.length} unités</small></span></summary><div class="fold-body ulist">${A.UNITS.map(u => `<a class="urow" href="#${u.id}"><span>${esc(u.en)}</span><b>${u.pts} pts</b></a>`).join("")}</div></details>`
      + sec("Traits de bataille", A.BATTLE_TRAITS)
      + sec("Formations de bataille", A.FORMATIONS.map(f => ({...f.ab, n:f.en + " : " + f.ab.n})))
      + sec("Traits héroïques", A.TRAITS.map(t => t.ab))
      + sec("Artefacts de pouvoir", A.ARTEFACTS.map(a => ({...a.ab, n:a.ab.n + (a.aqshy ? " (Fléau d'Aqshy)" : "")})))
      + sec("Accursed Devices (Fléau d'Aqshy)", A.PROCEDES.map(p => ({...p.ab, cost:"+" + p.pts + " pts"})))
      + sec("Sorts : " + A.LORE_NAMES.spell, A.SPELLS)
      + sec("Prières : " + A.LORE_NAMES.prayer, A.PRAYERS)
      + aorFold("hashut") + rorFold("hashut")
      + `<p class="hint">Données BSData, traduites en français.</p>`;
  }
  // Pages faction génériques (BSData traduit)
  const CRIT = {"2hits":"Crit (2 touches)", auto:"Crit (blessure auto)", mortal:"Crit (mortel)"};
  function wBlock(list, ranged){
    if (!list.length) return "";
    const head = ranged ? ["Portée","A","Tou","Bles","Perf","Dég"] : ["A","Tou","Bles","Perf","Dég"];
    return `<div class="${ranged ? "ranged" : "melee"}"><h3 class="sec">${ranged ? "Armes de tir" : "Armes de mêlée"}</h3><div class="colhead">${head.map(x => `<span>${x}</span>`).join("")}</div>` +
      list.map(w => { const v = [w.a, typeof w.h === "number" ? w.h + "+" : w.h, typeof w.w === "number" ? w.w + "+" : w.w, w.r || "-", w.d]; if (ranged) v.unshift(w.range);
        const chips = [w.crit !== "none" ? CRIT[w.crit] : null, ...(w.extra || [])].filter(Boolean);
        return `<div class="weapon"><div class="wname">${esc(w.n)}</div><div class="vals">${v.map(x => `<span>${esc(x)}</span>`).join("")}</div>${chips.length ? `<div class="chips">${chips.map(c => `<span class="chip">${esc(c)}</span>`).join("")}</div>` : ""}</div>`; }).join("") + `</div>`;
  }
  function unitSheet(u){
    const s = u.stats, d = [[s.M,"Mouv."],[s.S,"Santé"],[s.C,"Contrôle"],[s.Sv,"Sauv.","sv"]];
    return `<div class="sheet usheet"><div class="statband"><div class="stats" style="--n:4">${d.map(([v,l,c]) => `<div><div class="disc${c ? " " + c : ""}">${esc(v)}</div><div class="l">${l}</div></div>`).join("")}</div>
      <p class="unit-pts">${u.size} figurine${u.size > 1 ? "s" : ""} · ${u.pts ? u.pts + " pts" : /^rr-/.test(u.id) ? "régiment de renom uniquement" : "0 pt, prise avec son héros"}</p></div>
      ${wBlock(u.weapons.filter(w => w.range !== "Mêlée"), true)}${wBlock(u.weapons.filter(w => w.range === "Mêlée"), false)}
      ${u.abilities.length ? `<h3 class="sec">Aptitudes</h3><div class="abilities">${u.abilities.map(abCard).join("")}</div>` : ""}
      <h3 class="sec">Mots-clés</h3><div class="kw">Mots-clés : <b>${esc(u.kw)}</b></div></div>`;
  }
  // Régiments de renom
  const ROR = (window.WC_ROR || {}).regiments || [], RORU = (window.WC_ROR || {}).units || [];
  const UMANIF = window.WC_UMANIF || [];
  function uLink(n){
    for (const F of FACTIONS) { const u = F.data && F.data.units.find(x => x.en === n); if (u) return `#regle-u-${F.id}~${u.id}`; }
    const h = ARMY && ARMY.UNITS.find(x => x.en === n); if (h) return "#" + h.id;
    const r = RORU.find(x => x.en === n); return r ? `#regle-u-rr~${r.id}` : "";
  }
  const facEn = id => (FACTIONS.find(f => f.id === id) || {en:id}).en;
  function rorHtml(r, facs){
    const comp = r.units.map(([n, c]) => { const href = uLink(n), t = (c > 1 ? c + " × " : "") + n; return href ? `<a href="${href}">${esc(t)}</a>` : esc(t); }).join(", ");
    return `<details class="fold"><summary><span>${esc(r.en)} <small>· ${r.pts} pts</small></span></summary><div class="fold-body">
      <p><b>Unités :</b> ${comp}</p>${facs ? `<p class="hint"><b>Factions :</b> ${esc(r.facs.map(facEn).sort().join(", "))}</p>` : ""}
      ${r.abs.length ? r.abs.map(abCard).join("") : `<p class="hint">Pas d'aptitude de régiment : les règles sont sur les warscrolls.</p>`}</div></details>`;
  }
  // Armées de renom
  const AOR = window.WC_AOR || [], AORU = {};
  AOR.forEach(a => a.xunits.forEach(u => { AORU[u.id] = {u, fac:a.fac}; }));
  const TT = {trait:"Traits héroïques", artefact:"Artefacts de pouvoir"};
  function aorHtml(a){
    const urow = (n, pts, href) => href ? `<a class="urow" href="${href}"><span>${esc(n)}</span><b>${pts} pts</b></a>` : `<div class="urow"><span>${esc(n)}</span><b>${pts} pts</b></div>`;
    const items = L => L.map(i => i.abs.length === 1 && i.abs[0].n === i.en ? abCard({...i.abs[0], cost:i.pts ? "+" + i.pts + " pts" : i.abs[0].cost}) : `<h4 class="iname">${esc(i.en)}${i.pts ? ` · +${i.pts} pts` : ""}</h4>${i.abs.map(abCard).join("")}`).join("");
    const block = (t, body) => body ? `<h4 class="iname aor-h">${esc(t)}</h4>${body}` : "";
    return `<details class="fold"><summary><span>${esc(a.en)}</span></summary><div class="fold-body">
      ${block("Traits de bataille", a.bt.map(abCard).join(""))}
      ${a.tables.map(t => block(t.title || TT[t.key] || t.key, items(t.items))).join("")}
      ${block("Sorts", items(a.spells))}${block("Prières", items(a.prayers))}${block("Manifestations", items(a.manifs))}
      <h4 class="iname aor-h">Unités autorisées (${a.units.length + a.xunits.length})</h4><div class="ulist">${a.units.map(([n, pts]) => urow(n, pts, uLink(n))).concat(a.xunits.map(u => urow(u.en, u.pts, `#regle-u-ar~${u.id}`))).join("")}</div>
      <p class="hint">Pas de formation de bataille en armée de renom.</p></div></details>`;
  }
  function aorFold(fid){
    const L = AOR.filter(a => a.fac === fid);
    return L.length ? `<details class="fold"><summary><span>Armées de renom <small>· ${L.length}</small></span></summary><div class="fold-body">${L.map(aorHtml).join("")}</div></details>` : "";
  }
  function rorFold(fid){
    const L = ROR.filter(r => r.facs.includes(fid));
    return L.length ? `<details class="fold"><summary><span>Régiments de renom <small>· ${L.length}</small></span></summary><div class="fold-body">${L.map(r => rorHtml(r, false)).join("")}</div></details>` : "";
  }
  const rorPage = () => `<p class="hint">Liste et points issus de BSData (Manuel du Général 2025-26). 1 régiment de renom maximum par armée : il compte comme un de tes 5 régiments et ses unités ne peuvent pas être le général ni porter d'amélioration.</p>` + ROR.slice().sort((a, b) => a.en.localeCompare(b.en)).map(r => rorHtml(r, true)).join("");
  function manifPage(){
    const lore = L => `<details class="fold"><summary><span>${esc(L.en)} <small>· ${L.abs.length} sort${L.abs.length > 1 ? "s" : ""}</small></span></summary><div class="fold-body">${L.abs.map(abCard).join("")}</div></details>`;
    return `<p class="hint">Manifestations génériques (domaines universels). Un sorcier peut invoquer les manifestations de son domaine choisi.</p>` + UMANIF.slice().sort((a, b) => a.en.localeCompare(b.en)).map(lore).join("");
  }
  function genFactionPage(F){
    const sec = s => `<details class="fold"><summary><span>${esc(s.title)}</span></summary><div class="fold-body">${s.items.map(i => i.abs.length === 1 && i.abs[0].n === i.n
        ? abCard({...i.abs[0], cost:i.pts ? "+" + i.pts + " pts" : i.abs[0].cost})
        : `${i.n !== "Battle Traits" ? `<h4 class="iname">${esc(i.n)}${i.pts ? ` · +${i.pts} pts` : ""}</h4>` : ""}${i.abs.map(abCard).join("")}`).join("")}</div></details>`;
    const heroes = F.units.filter(u => u.hero && !u.terrain), others = F.units.filter(u => !u.hero && !u.terrain), terr = F.units.filter(u => u.terrain);
    const row = u => `<a class="urow" href="#regle-u-${F.id}~${u.id}"><span>${esc(u.en)}</span><b>${u.pts} pts</b></a>`;
    return `<details class="fold" open><summary><span>Warscrolls <small>· ${F.units.length} unités</small></span></summary><div class="fold-body ulist">
        <h4 class="iname">Héros</h4>${heroes.map(row).join("")}<h4 class="iname">Unités</h4>${others.map(row).join("")}${terr.length ? `<h4 class="iname">Terrain de faction</h4>${terr.map(row).join("")}` : ""}</div></details>`
      + F.sections.map(sec).join("") + aorFold(F.id) + rorFold(F.id) + `<p class="hint">Données BSData, traduites en français.</p>`;
  }
  function bpPage(){
    return BS.BATTLEPLANS.map(b => `<details class="fold"><summary><span><b>${esc(b.id)}</b> ${esc(b.n)}</span></summary><div class="fold-body">
      <img class="map" src="${BS.MAPS[b.id]}" alt="Carte de déploiement ${esc(b.n)}">
      <h4>Outsider</h4><p>${esc(b.out)}</p>
      <h4>Aptitudes</h4>${b.ab.map(abCard).join("")}
      <h4>Score primaire (fin de chacun de tes tours)</h4>
      <ul>${b.sc.map(s => `<li><b>${esc(s.n)} : ${s.v} PV.</b> ${esc(s.t)}</li>`).join("")}</ul></div></details>`).join("");
  }
  function tacPage(){
    return `<ul class="blk"><li>Chaque joueur choisit 2 cartes avant la bataille.</li><li>Chaque niveau rapporte 5 PV. Les niveaux se valident dans l'ordre, un seul par carte et par tour, à la fin de ton tour.</li><li>Pas de tactique validée au round où tu prends un double tour.</li></ul>` +
      BS.TACTICS.map(t => `<details class="fold"><summary><span><b>${t.card}</b> ${esc(t.n)}</span></summary><div class="fold-body">
        ${t.gen ? `<h4>Règle générale</h4><p>${esc(t.gen)}</p>` : ""}
        ${t.t.map((x, k) => `<h4>${esc(BS.TIERS[k])} : ${esc(x[0])}</h4><p>Réussie à la fin de ton tour ${esc(x[1].charAt(0).toLowerCase() + x[1].slice(1))}</p>`).join("")}</div></details>`).join("");
  }

  const I = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const FEATURES = [
    ["listes","Listes","Crée et vérifie tes listes d'armée.",'<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>'],
    ["regles","Règles","Découvre les règles de base et de saison.",'<path d="M12 4v16M5 7l7-3 7 3M5 7l-2 6a3 3 0 0 0 4 0zM19 7l-2 6a3 3 0 0 0 4 0zM8 20h8"/>'],
    ["memo","Mémo","Retrouve tes warscrolls et les règles de ton armée.",'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M9 7h6"/>'],
    ["phases","Phases","Vois quoi faire à chaque phase de jeu.",'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'],
    ["parties","Parties","Suis le score de tes parties entre amis, round par round.",'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>']
  ];
  function homeHtml(){
    return `<div class="welcome"><svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#6b2119"/><circle cx="32" cy="32" r="25" fill="none" stroke="#d4ae3f" stroke-width="2.5"/><path d="M20 18l6 28 6-18 6 18 6-28" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg>
      <h2>Bienvenue sur WarCounter</h2><p>Ton compagnon pour Warhammer Age of Sigmar.</p></div>
      ${STANDALONE ? "" : `<a class="btn-install" href="#installer">${I('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 19h14"/>')}<span>Installer l'app</span></a>`}
      <div class="feat">${FEATURES.map(([id, n, d, svg]) => `<a class="fcard" href="#${id}"><span class="ficon">${I(svg)}</span><span><b>${n}</b><br>${d}</span></a>`).join("")}</div>
      <div class="home-extra">
        <a class="btn-link" href="#feedback">Signaler un bug / Suggestion</a>
        <a class="btn-link" href="#avenir">Fonctionnalités à venir</a>
        <a class="btn-link" href="#soutenir">Si tu veux soutenir le projet</a>
      </div>`;
  }
  const STANDALONE = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; const b = $("direct-install"); if (b) b.hidden = false; });
  window.addEventListener("appinstalled", () => { deferredPrompt = null; const b = $("direct-install"); if (b) b.hidden = true; });
  const PAYPAL_URL = "https://www.paypal.com/qrcodes/p2pqrc/MXBPC6EUBZBGN", PAYPAL_QR = "/*PAYPALQR*/";
  function supportHtml(){
    const step = (n, t) => `<li><span class="snum">${n}</span><span>${t}</span></li>`;
    return `<div class="sup">
      <div class="sup-hero"><svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#6b2119"/><circle cx="32" cy="32" r="25" fill="none" stroke="#d4ae3f" stroke-width="2.5"/><path d="M32 46s-13-8-13-17a7 7 0 0 1 13-3.5A7 7 0 0 1 45 29c0 9-13 17-13 17z" fill="#fff"/></svg>
        <h2>Soutenir WarCounter</h2>
        <p>Projet piloté sur mon temps libre, ton don servira à payer un meilleur hébergement et à me donner du temps pour peaufiner l'application.</p>
        <p>WarCounter est gratuit, sans publicité, et le restera. <b>Ce n'est absolument pas obligatoire</b> : utiliser l'app et me faire des retours, c'est déjà un super soutien.</p></div>
      <div class="panel"><h3 class="sec">Faire un don avec PayPal</h3><div class="body">
        <a class="btn primary sup-main" href="${PAYPAL_URL}" target="_blank" rel="noopener">Faire un don avec PayPal</a>
        <ol class="steps">
          ${step(1, "Appuie sur le bouton ci-dessus (ou scanne le QR code avec ton téléphone).")}
          ${step(2, "Indique le montant de ton choix.")}
          ${step(3, "Sélectionne <b>Entre proches</b> : ainsi, aucun frais n'est prélevé sur ton don.")}
        </ol>
        <div class="sup-qr"><img src="${PAYPAL_QR}" alt="QR code PayPal pour faire un don" width="200" height="200"></div>
      </div></div>
      <p class="sup-thanks">Merci du fond du cœur, et bonnes parties !<br><b>elcounter</b></p>
    </div>`;
  }
  function roadmapHtml(){
    const items = [
      ["Gestion de collection", "Suivre tes figurines peintes, en cours et à peindre."],
      ["Notes personnalisées et renommage des unités", "Annoter et renommer tes unités pour coller à ton armée."],
      ["Mode campagne PtG / Narratif", "Suivre une campagne Path to Glory ou narrative."],
      ["Carte communautaire", "Trouver des joueurs, des associations, se localiser sur la map."]
    ];
    return `<div class="sup">
      <div class="sup-hero">
        <h2>Fonctionnalités à venir</h2>
        <p>Voici ce qui est prévu pour améliorer WarCounter. L'ordre et les délais peuvent évoluer.</p>
      </div>
      <div class="panel"><div class="body">
        <ul class="blk">${items.map(([t,d]) => `<li><b>${t}</b><br>${d}</li>`).join("")}</ul>
      </div></div>
      <p class="sup-thanks">Tu as une idée ?<br>Utilise le bouton <b>Signaler un bug / Suggestion</b> sur l'accueil.</p>
    </div>`;
  }
  function feedbackMailto(type, message){
    const subject = encodeURIComponent("[WarCounter] " + (type || "Retour"));
    const body = encodeURIComponent((message || "").trim() || "(Écris ton message ici)");
    return `mailto:warcounter@proton.me?subject=${subject}&body=${body}`;
  }
  function feedbackHtml(){
    return `<div class="sup">
      <div class="sup-hero">
        <h2>Signaler un bug ou suggérer une amélioration</h2>
        <p>Décris le problème ou ton idée. Un e-mail s'ouvrira vers <b>warcounter@proton.me</b>.</p>
      </div>
      <div class="panel"><div class="body">
        <a class="btn primary" href="mailto:warcounter@proton.me?subject=${encodeURIComponent("[WarCounter] Retour")}">Écrire un e-mail</a>
      </div></div>
    </div>`;
  }
  function installHtml(){
    const step = (n, t) => `<li><span class="snum">${n}</span><span>${t}</span></li>`;
    return `<div class="inst">
      <p class="inst-lead">Installe WarCounter sur ton téléphone ou ton ordinateur : elle s'ouvre en plein écran, comme une vraie application, et fonctionne même sans réseau.</p>
      <button type="button" class="btn-install" id="direct-install"${deferredPrompt ? "" : " hidden"}>${I('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 19h14"/>')}<span>Installer maintenant</span></button>
      <p class="inst-pc">Sur ordinateur, si le bouton n'apparaît pas, ouvre WarCounter avec Chrome ou Edge.</p>
      <div class="inst-mobile">
      <h2 class="rh">Android (Chrome)</h2>
      <ol class="steps">
        ${step(1, "Appuie sur les <b>3 petits points</b> en haut à droite de ton navigateur (la flèche te les montre).")}
        ${step(2, "Appuie sur <b>Ajouter à l'écran d'accueil</b> (ou <b>Installer l'application</b>).")}
        ${step(3, "Choisis <b>Installer</b> (et non « Créer un raccourci »), puis confirme avec <b>Installer</b>.")}
        ${step(4, "L'icône <b>W</b> de WarCounter apparaît sur l'écran d'accueil de ton téléphone. C'est prêt !")}
      </ol>
      <h2 class="rh">iPhone (Safari)</h2>
      <ol class="steps">
        ${step(1, "Appuie sur le bouton <b>Partager</b> (le carré avec une flèche vers le haut).")}
        ${step(2, "Choisis <b>Sur l'écran d'accueil</b>, puis <b>Ajouter</b>.")}
      </ol>
      <p class="hint">Tes listes et tes parties restent enregistrées sur ton téléphone, dans l'app.</p>
      </div>
    </div>`;
  }
  document.addEventListener("click", async e => {
    if (!e.target.closest("#direct-install") || !deferredPrompt) return;
    deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; $("direct-install").hidden = true;
  });
  const fold = x => String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let rulesQ = "", INDEX = null;
  // Index de recherche : pages de règles, factions, unités et aptitudes
  function buildIndex(){
    const out = [], add = (t, sub, href, extra) => out.push({t, sub, href, s:fold([t, sub].concat(extra || []).join(" "))});
    CORE_PAGES.concat(GHB).forEach(r => add(r.en, r.sub, "#regle-" + r.id));
    const names = o => o && typeof o === "object" ? [].concat(o.n || o.title || [], ...Object.values(o).filter(v => v && typeof v === "object").map(names)) : [];
    CORE_PAGES.forEach(r => (r.core || []).forEach(sec => { add(sec.title, `${sec.num ? sec.num + " · " : ""}${r.en}`, "#regle-" + r.id, names(sec)); }));
    FACTIONS.forEach(F => {
      add(F.en, "Faction · " + F.ga, "#regle-faction-" + F.id);
      const units = F.data ? F.data.units : (ARMY ? ARMY.UNITS : []);
      units.forEach(u => add(u.en, "Unité · " + F.en, F.data ? `#regle-u-${F.id}~${u.id}` : "#regle-faction-" + F.id, [u.kw]));
      const abs = F.data ? F.data.sections.flatMap(sec => sec.items.flatMap(i => i.abs.map(a => [a, sec.title])))
        : ARMY ? [].concat(ARMY.BATTLE_TRAITS.map(a => [a, "Traits de bataille"]), ARMY.SPELLS.map(a => [a, "Sorts"]), ARMY.PRAYERS.map(a => [a, "Prières"])) : [];
      abs.forEach(([a, sec]) => add(a.n, `${sec} · ${F.en}`, "#regle-faction-" + F.id));
      units.forEach(u => u.abilities.forEach(a => add(a.n, `Aptitude · ${u.en} (${F.en})`, F.data ? `#regle-u-${F.id}~${u.id}` : "#regle-faction-" + F.id)));
    });
    add("Régiments de renom", "Manuel du Général", "#regle-renom");
    AOR.forEach(a => { const fe = facEn(a.fac), h = "#regle-faction-" + a.fac; add(a.en, "Armée de renom · " + fe, h); a.bt.concat(...a.tables.map(t => t.items.flatMap(i => i.abs)), ...[a.spells, a.prayers, a.manifs].map(L => L.flatMap(i => i.abs))).forEach(x => add(x.n, `Aptitude · ${a.en} (armée de renom)`, h)); a.xunits.forEach(u => add(u.en, "Unité · armée de renom " + a.en, `#regle-u-ar~${u.id}`, [u.kw])); });
    ROR.forEach(r => { add(r.en, `Régiment de renom · ${r.pts} pts`, "#regle-renom", r.units.map(x => x[0]).concat(r.abs.map(a => a.n))); r.abs.forEach(a => add(a.n, "Aptitude · " + r.en + " (régiment de renom)", "#regle-renom")); });
    UMANIF.forEach(L => { add(L.en, "Manifestations génériques · domaine", "#regle-manifestations"); L.abs.forEach(a => add(a.n, "Manifestation · " + L.en, "#regle-manifestations")); });
    RORU.forEach(u => add(u.en, "Unité · régiment de renom", `#regle-u-rr~${u.id}`, [u.kw]));
    const seen = new Set(); return out.filter(x => { const k = x.t + "|" + x.href; if (seen.has(k)) return false; seen.add(k); return true; });
  }
  function searchRules(){
    const box = $("rres"), all = $("rall"); if (!box) return;
    const q = fold(rulesQ).trim().split(/\s+/).filter(Boolean);
    if (!q.length || rulesQ.trim().length < 2) { box.hidden = true; all.hidden = false; return; }
    if (!INDEX) INDEX = buildIndex();
    const hits = INDEX.filter(x => q.every(w => x.s.includes(w))).sort((a, b) => (fold(a.t).startsWith(q[0]) ? 0 : 1) - (fold(b.t).startsWith(q[0]) ? 0 : 1)).slice(0, 60);
    box.innerHTML = hits.length ? `<div class="rgrid">${hits.map(x => `<a class="rcard" href="${x.href}"><b>${esc(x.t)}</b><span>${esc(x.sub)}</span></a>`).join("")}</div>${hits.length === 60 ? `<p class="hint">60 premiers résultats : précise ta recherche.</p>` : ""}` : `<p class="hint">Aucun résultat.</p>`;
    box.hidden = false; all.hidden = true;
  }
  document.addEventListener("input", e => { if (e.target.id === "rules-q") { rulesQ = e.target.value; searchRules(); } });
  function rulesHtml(){
    const card = r => `<a class="rcard core" href="#regle-${r.id}"><b>${esc(r.en)}</b><span>${esc(r.sub)}</span></a>`;
    return `<input type="search" class="rsearch" id="rules-q" placeholder="Rechercher une règle, une faction, une unité, une aptitude…" value="${esc(rulesQ)}" autocomplete="off"><div id="rres" class="rres" hidden></div><div id="rall" class="rall"><h2 class="rh">Général</h2><div class="rgrid">${CORE_PAGES.slice(0, 1).map(card).join("")}</div>
      <h2 class="rh">Règles avancées</h2><div class="rgrid">${CORE_PAGES.slice(1).map(card).join("")}</div>
      <h2 class="rh">Manuel du Général 2026-27</h2><div class="rgrid">${GHB.map(card).join("")}${ROR.length ? card({id:"renom", en:"Régiments de renom", sub:ROR.length + " régiments"}) : ""}${UMANIF.length ? card({id:"manifestations", en:"Manifestations génériques", sub:UMANIF.length + " domaines"}) : ""}</div>
      ${ALLIANCES.map(g => { const L = FACTIONS.filter(f => f.ga === g); return L.length ? `<h2 class="rh">${g}</h2><div class="rgrid">${L.map(f => `<a class="rcard" href="#regle-faction-${f.id}"><b>${esc(f.en)}</b><span>${f.data ? f.data.units.length : (ARMY ? ARMY.UNITS.length : "")} unités</span></a>`).join("")}</div>` : ""; }).join("")}</div>`;
  }
  function route(){
    const h = location.hash.slice(1);
    const fac = h.startsWith("regle-faction-") ? FACTIONS.find(f => f.id === h.slice(14)) : null;
    let unitPage = null;
    if (h.startsWith("regle-u-")) { const [fid, ...rest] = h.slice(8).split("~"); const F = FACTIONS.find(f => f.id === fid); const U = fid === "ar" ? (AORU[rest.join("~")] || {}).u : fid === "rr" ? RORU.find(u => u.id === rest.join("~")) : F && F.data && F.data.units.find(u => u.id === rest.join("~")); if (U) unitPage = {F, U}; }
    const rule = unitPage ? {en:unitPage.U.en, unit:true} : fac ? {en:fac.en, fac:true} : h === "regle-renom" ? {en:"Régiments de renom", renom:true} : h === "regle-manifestations" ? {en:"Manifestations génériques", manif:true} : h.startsWith("regle-") ? RULES.find(r => r.id === h.slice(6)) : null;
    if (!(h === "" || h === "accueil" || h === "regles" || h === "installer" || h === "soutenir" || h === "avenir" || h === "feedback" || rule)) return;
    $("menu-hint").hidden = STANDALONE || !(h === "" || h === "accueil" || h === "installer");
    $("home-back").hidden = !rule && h !== "installer" && h !== "soutenir" && h !== "avenir" && h !== "feedback";
    if (rule) {
      $("home-title").textContent = rule.en;
      $("home-view").innerHTML = `<div class="rules">${rule.unit ? unitSheet(unitPage.U) : rule.renom ? rorPage() : rule.manif ? manifPage() : rule.fac ? (fac.data ? genFactionPage(fac.data) : factionPage()) : rule.core ? corePage(rule) : rule.bp ? bpPage() : rule.tac ? tacPage() : blocks(rule.blocks)}</div>`;
    } else if (h === "soutenir") {
      $("home-title").textContent = "Soutenir le projet";
      $("home-view").innerHTML = supportHtml();
    } else if (h === "avenir") {
      $("home-title").textContent = "À venir";
      $("home-view").innerHTML = roadmapHtml();
    } else if (h === "feedback") {
      $("home-title").textContent = "Retour";
      $("home-view").innerHTML = feedbackHtml();
    } else if (h === "installer") {
      $("home-title").textContent = "Installer l'app";
      $("home-view").innerHTML = installHtml();
    } else if (h === "regles") {
      $("home-title").textContent = "Règles";
      $("home-view").innerHTML = rulesHtml(); searchRules();
    } else {
      $("home-title").textContent = "WarCounter";
      $("home-view").innerHTML = homeHtml();
    }
    window.scrollTo(0, 0);
  }
  $("home-back").addEventListener("click", () => { const h = location.hash.slice(1); location.hash = h === "installer" || h === "soutenir" || h === "avenir" || h === "feedback" ? "accueil" : h.startsWith("regle-u-rr~") ? "regle-renom" : h.startsWith("regle-u-ar~") ? "regle-faction-" + ((AORU[h.slice(11)] || {}).fac || "") : h.startsWith("regle-u-") ? "regle-faction-" + h.slice(8).split("~")[0] : "regles"; });
  window.addEventListener("hashchange", route);
  route();
