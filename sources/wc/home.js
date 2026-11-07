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
  // Factions annoncées, sans données pour l'instant
  FACTIONS.push({id:"khazalite", en:"Khazalite Holds", ga:"Ordre", soon:true});
  FACTIONS.sort((a, b) => a.en.localeCompare(b.en));
  const ALLIANCES = ["Ordre", "Chaos", "Mort", "Destruction"];
  const RULES = GHB.concat(CORE_PAGES);
  // Warscrolls de manifestations, affichés sous leur sort d'invocation
  const MANIF = window.WC_MANIF || {};
  const MI = {}; Object.values(MANIF).forEach(m => { MI[m.en.toLowerCase()] = m; });
  // sort « Summon X », ou aptitude qui fait apparaître une manifestation citée dans son texte (Avatar of Khaine, Abyssal Tendril…)
  const manifOf = a => {
    if (!a || !a.n) return [];
    if (/^Summon /.test(a.n)) { const n = a.n.slice(7).toLowerCase(), m = MI[n] || MI["the " + n]; if (m) return [m]; }
    const txt = (a.x || []).join(" ");
    return Object.values(MANIF).filter(m => m.nosum && m.en !== a.self && txt.includes(m.en) && !(a.seen && a.seen.has(m.en)) && (!a.seen || a.seen.add(m.en)));
  };
  function mSheet(m){
    const seen = new Set([m.en]);
    const st = m.stats, d = [[st.M,"Mouv."],[st.S,"Santé"],[st.Sv,"Sauv.","sv"],[st.B,"Bann."]];
    if (st.W) d.push([st.W,"Prot.","wd"]);
    return `<div class="statband"><div class="stats" style="--n:${d.length}">${d.map(([v,l,c]) => `<div><div class="disc${c ? " " + c : ""}">${esc(v)}</div><div class="l">${l}</div></div>`).join("")}</div></div>`
      + wBlock(m.weapons.filter(w => w.range !== "Mêlée"), true) + wBlock(m.weapons.filter(w => w.range === "Mêlée"), false)
      + (m.abilities.length ? `<div class="abilities">${m.abilities.map(x => abCard({...x, self:m.en, seen})).join("")}</div>` : "")
      + `<div class="kw">Mots-clés : <b>${esc(m.kw)}</b></div>`;
  }
  const mWar = a => manifOf(a).map(m => `<details class="mwar"><summary>Warscroll : ${esc(m.en)}</summary>${mSheet(m)}</details>`).join("");
  function abCard(a){
    return `<div class="ab" style="--c:${PHASE[a.c]}"><div class="ab-head"><span>${esc(a.t)}</span>${a.cast ? `<span class="cast">${a.cast}</span>` : ""}${a.chant ? `<span class="chant"><span>${a.chant}</span></span>` : ""}${a.cost ? `<span class="cost">${esc(a.cost)}</span>` : ""}</div><div class="ab-name">${esc(a.n)}</div><div class="ab-body">${a.x.map(p => `<p>${esc(p)}</p>`).join("")}</div>${mWar(a)}</div>`;
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
    ["parties","Parties","Suis le score de tes parties entre amis, round par round.",'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>'],
    ["collection","Collection","Suis la peinture de tes figurines, faction par faction.",'<path d="M18 3l3 3-9 9-3-3z"/><path d="M9 12l-4 1-2 7 7-2 1-4"/>'],
  ];
  const EXTRA = [
    ["mailto:warcounter@proton.me?subject=%5BWarCounter%5D%20Retour","Signaler un bug / Suggestion","Envoie un e-mail pour faire remonter un souci ou une idée.",'<path d="M4 4h16v16H4z"/><path d="M4 8l8 5 8-5"/>'],
    ["#avenir","Fonctionnalités à venir","Découvre ce qui arrive bientôt dans l'app.",'<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>'],
    ["#soutenir","Si tu veux soutenir le projet","Un don pour l'hébergement et le développement.",'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>']
  ];
  function homeHtml(){
    return `<div class="welcome"><svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#6b2119"/><circle cx="32" cy="32" r="25" fill="none" stroke="#d4ae3f" stroke-width="2.5"/><path d="M20 18l6 28 6-18 6 18 6-28" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg>
      <h2>Bienvenue sur WarCounter</h2><p>Ton compagnon pour Warhammer Age of Sigmar.</p></div>
      ${STANDALONE ? "" : `<a class="btn-install" href="#installer">${I('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 19h14"/>')}<span>Installer l'app</span></a>`}
      <a class="btn-install btn-acc" href="#compte">${I('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>')}<span>${sess ? "Mon compte" : "Créer mon compte"}</span></a>
      ${sess ? "" : `<p class="acc-pitch">Gratuit : tes listes et ta collection sauvegardées et retrouvées sur tous tes appareils.</p>`}
      <div class="feat">${FEATURES.map(([id, n, d, svg]) => `<a class="fcard" href="#${id}"><span class="ficon">${I(svg)}</span><span><b>${n}</b><br>${d}</span></a>`).join("")}</div>
      <div class="home-extra">
        <div class="feat">${EXTRA.map(([href, n, d, svg]) => `<a class="fcard" href="${href}"><span class="ficon">${I(svg)}</span><span><b>${n}</b><br>${d}</span></a>`).join("")}</div>
        <a class="btn-link nc-btn" href="https://elcounter.github.io/necrocounter/" target="_blank" rel="noopener"><b>Découvrir NecroCounter</b><span>Ton compagnon pour Necromunda</span></a>
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
          ${step(1, "Appuie sur le bouton ci-dessus.")}
          ${step(2, "Indique le montant de ton choix.")}
          ${step(3, "Sélectionne <b>Entre proches</b> : ainsi, aucun frais n'est prélevé sur ton don.")}
        </ol>
      </div></div>
      <p class="sup-thanks">Merci du fond du cœur, et bonnes parties !<br><b>elcounter</b></p>
    </div>`;
  }
  function roadmapHtml(){
    const items = [
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
      if (F.soon) return;
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
      ${ALLIANCES.map(g => { const L = FACTIONS.filter(f => f.ga === g); return L.length ? `<h2 class="rh">${g}</h2><div class="rgrid">${L.map(f => `<a class="rcard" href="#regle-faction-${f.id}"><b>${esc(f.en)}</b><span>${f.soon ? "À venir" : (f.data ? f.data.units.length : (ARMY ? ARMY.UNITS.length : "")) + " unités"}</span></a>`).join("")}</div>` : ""; }).join("")}</div>`;
  }
  // ---------- Compte (Supabase) : synchronisation des listes et de la collection ----------
  const SB = "https://agqdwjkxeodxdrujphrv.supabase.co", SBK = "sb_publishable_B0a1M8wjrilqmHfGnAErMQ_iueIp0g8";
  const SK = {lists:"warcounter-listes", collection:"warcounter-collection", sess:"warcounter-session", meta:"warcounter-sync"};
  const ls = {get:k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; } },
    set:(k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }, del:k => { try { localStorage.removeItem(k); } catch(e) {} }};
  let sess = ls.get(SK.sess), accMsg = "", accErr = false, accBusy = false, delArmed = false, pushT = null;
  async function api(path, opt = {}, auth = true){
    const h = Object.assign({apikey:SBK, "Content-Type":"application/json"}, opt.headers || {});
    if (auth && sess) h.Authorization = "Bearer " + sess.access_token;
    const r = await fetch(SB + path, Object.assign({}, opt, {headers:h}));
    const t = await r.text(); let j = null; try { j = t ? JSON.parse(t) : null; } catch(e) {}
    if (!r.ok) { const e = new Error((j && (j.msg || j.message || j.error_description || j.error)) || "Erreur " + r.status); e.status = r.status; throw e; }
    return j;
  }
  function setSess(j){
    sess = {access_token:j.access_token, refresh_token:j.refresh_token, expires_at:Date.now() / 1000 + (j.expires_in || 3600),
      email:(j.user || {}).email || (sess || {}).email, uid:(j.user || {}).id || (sess || {}).uid};
    ls.set(SK.sess, sess);
  }
  function clearSess(){ sess = null; ls.del(SK.sess); ls.del(SK.meta); }
  async function fresh(){
    if (!sess) return false;
    if (sess.expires_at - 60 > Date.now() / 1000) return true;
    try { setSess(await api("/auth/v1/token?grant_type=refresh_token", {method:"POST", body:JSON.stringify({refresh_token:sess.refresh_token})}, false)); return true; }
    catch(e) { if (e.status === 400 || e.status === 401) clearSess(); return false; }   // hors ligne : on garde la session
  }
  const frMsg = m => /invalid login/i.test(m) ? "E-mail ou mot de passe incorrect." : /already registered|already exists/i.test(m) ? "Un compte existe déjà avec cet e-mail : connecte-toi." : /password.*(6|characters)/i.test(m) ? "Le mot de passe doit faire au moins 6 caractères." : /valid email|invalid.*email/i.test(m) ? "Adresse e-mail invalide." : /fetch|network/i.test(m) ? "Connexion impossible : vérifie ton accès à Internet." : m;
  async function pull(){ const r = await api(`/rest/v1/user_data?select=lists,collection,updated_at&user_id=eq.${sess.uid}`); return (r || [])[0] || null; }
  async function push(){
    const at = new Date().toISOString();
    await api("/rest/v1/user_data", {method:"POST", headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
      body:JSON.stringify({user_id:sess.uid, lists:ls.get(SK.lists) || {}, collection:ls.get(SK.collection) || {}, updated_at:at})});
    ls.set(SK.meta, {at, dirty:false});
  }
  function mergeRemote(R){   // première connexion sur cet appareil : on additionne local et compte
    const L = ls.get(SK.lists) || {lists:[], active:null}, RL = R.lists || {}, ids = new Set((RL.lists || []).map(l => l.id));
    ls.set(SK.lists, Object.assign({}, RL, L, {lists:(RL.lists || []).concat((L.lists || []).filter(l => !ids.has(l.id))), active:L.active || RL.active || null}));
    const C = ls.get(SK.collection) || {}, RC = R.collection || {};
    Object.keys(RC).forEach(f => { C[f] = Object.assign({}, RC[f], C[f] || {}); });
    ls.set(SK.collection, C);
  }
  async function sync(first){
    if (!(await fresh())) return;
    try {
      const m = ls.get(SK.meta) || {}, r = await pull();
      if (first) { if (r) mergeRemote(r); await push(); location.reload(); return; }
      if (r && !m.dirty && (!m.at || Date.parse(r.updated_at) > Date.parse(m.at))) {
        ls.set(SK.lists, r.lists || {lists:[], active:null}); ls.set(SK.collection, r.collection || {}); ls.set(SK.meta, {at:r.updated_at, dirty:false});
        location.reload(); return;
      }
      if (m.dirty || !r) await push();
    } catch(e) { accMsg = "Synchronisation impossible : " + frMsg(e.message); accErr = true; if (location.hash === "#compte") renderAccount(); }
  }
  window.WCSync = {dirty(){
    if (!sess) return;
    ls.set(SK.meta, Object.assign(ls.get(SK.meta) || {}, {dirty:true}));
    clearTimeout(pushT); pushT = setTimeout(() => { fresh().then(ok => ok && push()).catch(() => {}); }, 2000);
  }};
  if (sess) sync(false);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && sess) sync(false); });
  window.addEventListener("online", () => { if (sess) sync(false); });
  // ---------- Profil joueur (carte communautaire) ----------
  let prof = null, profLoaded = false, profCity = null, cityT = null;
  async function loadProfile(){
    try { if (await fresh()) { const r = await api(`/rest/v1/profiles?select=*&user_id=eq.${sess.uid}`); prof = (r || [])[0] || null; profCity = prof && prof.city ? {city:prof.city, insee:prof.insee, lat:prof.lat, lng:prof.lng} : null; } }
    catch(e) { accMsg = "Profil indisponible : " + frMsg(e.message); accErr = true; }
    profLoaded = true; if (location.hash === "#compte") renderAccount();
  }
  function profileHtml(){
    if (!profLoaded) return `<div class="panel"><h3 class="sec">Mon profil joueur</h3><div class="body acc"><p class="hint">Chargement…</p></div></div>`;
    const P = prof || {}, mine = new Set(P.factions || []);
    return `<div class="panel"><h3 class="sec">Mon profil joueur</h3><div class="body acc">
      <p class="hint">Pour la future carte communautaire : trouve des joueurs et des clubs près de chez toi.</p>
      <label class="lbl" for="pf-pseudo">Pseudo</label><input id="pf-pseudo" maxlength="30" value="${esc(P.pseudo || "")}" autocomplete="nickname">
      <label class="lbl" for="pf-city">Ville</label>
      <div class="pf-cityw"><input id="pf-city" value="${esc(profCity ? profCity.city : "")}" autocomplete="off" placeholder="Tape le nom de ta commune"><div id="pf-sug" class="pf-sug" hidden></div></div>
      <label class="lbl" for="pf-club">Club / Association (facultatif)</label><input id="pf-club" maxlength="60" value="${esc(P.club || "")}">
      <details class="pf-fold"${mine.size ? "" : " open"}><summary><span class="lbl">Factions jouées</span><span class="pf-count">${mine.size ? [...mine].join(", ") : "Aucune"}</span></summary>
      <div class="pf-facs">${FACTIONS.filter(f => !f.soon).map(f => `<label><input type="checkbox" class="pf-fac" value="${esc(f.en)}"${mine.has(f.en) ? " checked" : ""}> ${esc(f.en)}</label>`).join("")}</div></details>
      <label class="pf-vis"><input type="checkbox" id="pf-vis"${P.visible ? " checked" : ""}> <span><b>Apparaître sur la carte communautaire</b><br>Seuls ton pseudo, ta ville, ton club et tes factions seront visibles. Jamais ton e-mail.</span></label>
      <button type="button" class="btn primary wide" id="pf-save"${accBusy ? " disabled" : ""}>Enregistrer mon profil</button>
    </div></div>`;
  }
  async function saveProfile(){
    const pseudo = ($("pf-pseudo").value || "").trim(), club = ($("pf-club").value || "").trim(), vis = $("pf-vis").checked;
    const factions = [...document.querySelectorAll(".pf-fac:checked")].map(x => x.value);
    if (($("pf-city").value || "").trim() === "") profCity = null;
    if (pseudo.length < 2) { accMsg = "Choisis un pseudo d'au moins 2 caractères."; accErr = true; renderAccount(); return; }
    if (vis && !profCity) { accMsg = "Pour apparaître sur la carte, choisis ta ville dans la liste proposée."; accErr = true; renderAccount(); return; }
    accBusy = true;
    try {
      if (!(await fresh())) throw new Error("Session expirée, reconnecte-toi.");
      const row = {user_id:sess.uid, pseudo, club:club || null, factions, visible:vis, updated_at:new Date().toISOString(),
        city:profCity ? profCity.city : null, insee:profCity ? profCity.insee : null, lat:profCity ? profCity.lat : null, lng:profCity ? profCity.lng : null};
      await api("/rest/v1/profiles", {method:"POST", headers:{Prefer:"resolution=merge-duplicates,return=minimal"}, body:JSON.stringify(row)});
      prof = row; accMsg = vis ? "Profil enregistré : tu apparaîtras sur la carte." : "Profil enregistré (non visible sur la carte)."; accErr = false;
    } catch(e) { accMsg = /duplicate|unique|23505/i.test(e.message) ? "Ce pseudo est déjà pris, choisis-en un autre." : "Enregistrement impossible : " + frMsg(e.message); accErr = true; }
    accBusy = false; renderAccount(); window.scrollTo(0, 0);
  }
  async function citySuggest(q){
    const box = $("pf-sug"); if (!box) return;
    if (q.length < 2) { box.hidden = true; return; }
    try {
      const r = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(q)}&fields=nom,code,centre,departement&boost=population&limit=6`);
      const L = await r.json();
      box.innerHTML = L.map(c => `<button type="button" data-city="${esc(JSON.stringify({city:c.nom + (c.departement ? " (" + c.departement.code + ")" : ""), insee:c.code, lat:c.centre ? c.centre.coordinates[1] : null, lng:c.centre ? c.centre.coordinates[0] : null}))}">${esc(c.nom)}${c.departement ? ` <small>${esc(c.departement.nom)} (${esc(c.departement.code)})</small>` : ""}</button>`).join("") || `<p class="hint">Aucune commune trouvée.</p>`;
      box.hidden = false;
    } catch(e) { box.innerHTML = `<p class="hint">Recherche de ville indisponible (connexion ?).</p>`; box.hidden = false; }
  }
  $("home-view").addEventListener("input", e => {
    if (e.target.id === "pf-city") { profCity = null; clearTimeout(cityT); const q = e.target.value.trim(); cityT = setTimeout(() => citySuggest(q), 300); }
  });
  function accountHtml(){
    const m = ls.get(SK.meta) || {};
    const msg = accMsg ? `<p class="acc-msg${accErr ? " err" : ""}">${esc(accMsg)}</p>` : "";
    if (sess) return `<div class="sup"><div class="sup-hero"><h2>Mon compte</h2><p>Connecté avec <b>${esc(sess.email || "")}</b></p></div>${msg}
      <div class="panel"><div class="body acc">
        <p>Tes listes et ta collection sont synchronisées automatiquement sur tous les appareils où tu es connecté.</p>
        <p class="hint">${m.dirty ? "Modifications en attente d'envoi." : m.at ? "Dernière synchronisation : " + new Date(m.at).toLocaleString("fr-FR") : ""}</p>
        <button type="button" class="btn primary wide" id="acc-sync"${accBusy ? " disabled" : ""}>Synchroniser maintenant</button>
        <button type="button" class="btn wide" id="acc-out">Se déconnecter</button>
      </div></div>
      ${profileHtml()}
      <div class="panel"><div class="body acc">
        <p class="hint">Supprimer ton compte efface définitivement tes données sur le serveur. Les données de cet appareil sont conservées.</p>
        <button type="button" class="btn danger wide" id="acc-del">${delArmed ? "Confirmer la suppression définitive" : "Supprimer mon compte"}</button>
      </div></div>
      <p class="sup-thanks"><a href="#confidentialite">Confidentialité et données personnelles</a></p></div>`;
    return `<div class="sup"><div class="sup-hero"><h2>Mon compte</h2><p>Facultatif : sans compte, l'app fonctionne comme avant.<br>Avec un compte, tu retrouves tes listes et ta collection sur tous tes appareils.</p></div>${msg}
      <div class="panel"><div class="body acc">
        <label class="lbl" for="acc-mail">E-mail</label><input type="email" id="acc-mail" autocomplete="email" inputmode="email">
        <label class="lbl" for="acc-pass">Mot de passe (6 caractères minimum)</label><input type="password" id="acc-pass" autocomplete="current-password">
        <button type="button" class="btn primary wide" id="acc-in"${accBusy ? " disabled" : ""}>Se connecter</button>
        <button type="button" class="btn wide" id="acc-up"${accBusy ? " disabled" : ""}>Créer un compte</button>
        <p class="hint">À la première connexion, les listes et la collection de cet appareil sont ajoutées à ton compte.</p>
      </div></div>
      <p class="sup-thanks"><a href="#confidentialite">Confidentialité et données personnelles</a></p></div>`;
  }
  function renderAccount(){ $("home-view").innerHTML = accountHtml(); if (sess && !profLoaded) loadProfile(); }
  async function accAuth(signup){
    const email = ($("acc-mail").value || "").trim(), password = $("acc-pass").value || "";
    if (!email || !password) { accMsg = "Indique ton e-mail et ton mot de passe."; accErr = true; renderAccount(); return; }
    accBusy = true; accMsg = ""; renderAccount();
    try {
      const j = signup ? await api("/auth/v1/signup", {method:"POST", body:JSON.stringify({email, password})}, false)
                       : await api("/auth/v1/token?grant_type=password", {method:"POST", body:JSON.stringify({email, password})}, false);
      if (!j || !j.access_token) { accMsg = "Compte créé, mais il doit être confirmé avant la connexion."; accErr = true; }
      else { setSess(j); accBusy = false; accMsg = "Connexion réussie, synchronisation…"; accErr = false; renderAccount(); await sync(true); return; }
    } catch(e) { accMsg = frMsg(e.message); accErr = true; }
    accBusy = false; renderAccount();
  }
  $("home-view").addEventListener("click", async e => {
    const id = e.target.id;
    if (id === "acc-in" || id === "acc-up") { accAuth(id === "acc-up"); return; }
    if (id === "pf-save") { saveProfile(); return; }
    const cb = e.target.closest("[data-city]");
    if (cb) { profCity = JSON.parse(cb.dataset.city); $("pf-city").value = profCity.city; $("pf-sug").hidden = true; return; }
    if (id === "acc-sync") { accBusy = true; renderAccount(); window.WCSync.dirty(); clearTimeout(pushT); try { if (await fresh()) await push(); accMsg = "Synchronisé."; accErr = false; } catch(x) { accMsg = "Synchronisation impossible : " + frMsg(x.message); accErr = true; } accBusy = false; renderAccount(); return; }
    if (id === "acc-out") { try { await api("/auth/v1/logout", {method:"POST"}); } catch(x) {} clearSess(); prof = null; profLoaded = false; profCity = null; accMsg = "Tu es déconnecté. Tes données restent sur cet appareil."; accErr = false; delArmed = false; renderAccount(); return; }
    if (id === "acc-del") {
      if (!delArmed) { delArmed = true; renderAccount(); return; }
      try { if (await fresh()) await api("/rest/v1/rpc/delete_my_account", {method:"POST", body:"{}"}); clearSess(); prof = null; profLoaded = false; profCity = null; accMsg = "Ton compte et tes données en ligne ont été supprimés."; accErr = false; }
      catch(x) { accMsg = "Suppression impossible : " + frMsg(x.message); accErr = true; }
      delArmed = false; renderAccount();
    }
  });
  const privacyHtml = () => `<div class="sup"><div class="sup-hero"><h2>Confidentialité</h2><p>Ce que WarCounter fait de tes données.</p></div>
    <div class="panel"><div class="body"><dl class="blk">
      <dt><b>Sans compte</b></dt><dd>Tes listes, ta collection et tes parties restent uniquement sur ton appareil. Rien n'est envoyé.</dd>
      <dt><b>Avec un compte (facultatif)</b></dt><dd>Sont enregistrés : ton adresse e-mail, ton mot de passe (chiffré, jamais lisible), tes listes et ta collection. Ils servent uniquement à te connecter et à synchroniser tes données entre tes appareils.</dd>
      <dt><b>Profil joueur (facultatif)</b></dt><dd>Pseudo, ville (centre de la commune, jamais d'adresse), club et factions jouées. Ils ne sont visibles des autres joueurs que si tu coches « Apparaître sur la carte communautaire », et tu peux décocher à tout moment.</dd>
      <dt><b>Hébergement</b></dt><dd>Supabase, sur des serveurs situés dans l'Union européenne.</dd>
      <dt><b>Durée de conservation</b></dt><dd>Jusqu'à la suppression de ton compte.</dd>
      <dt><b>Tes droits</b></dt><dd>Tu peux supprimer ton compte et toutes tes données en ligne à tout moment depuis la page Mon compte. Pour toute question (accès, rectification, suppression) : warcounter@proton.me.</dd>
      <dt><b>Ce qu'on ne fait pas</b></dt><dd>Aucune publicité, aucune revente, aucun partage de tes données. La mesure d'audience (GoatCounter) est anonyme et sans cookie.</dd>
      <dt><b>Responsable</b></dt><dd>elcounter, éditeur de WarCounter (warcounter@proton.me).</dd>
    </dl></div></div></div>`;
  function route(){
    const h = location.hash.slice(1);
    const fac = h.startsWith("regle-faction-") ? FACTIONS.find(f => f.id === h.slice(14)) : null;
    let unitPage = null;
    if (h.startsWith("regle-u-")) { const [fid, ...rest] = h.slice(8).split("~"); const F = FACTIONS.find(f => f.id === fid); const U = fid === "ar" ? (AORU[rest.join("~")] || {}).u : fid === "rr" ? RORU.find(u => u.id === rest.join("~")) : F && F.data && F.data.units.find(u => u.id === rest.join("~")); if (U) unitPage = {F, U}; }
    const rule = unitPage ? {en:unitPage.U.en, unit:true} : fac ? {en:fac.en, fac:true} : h === "regle-renom" ? {en:"Régiments de renom", renom:true} : h === "regle-manifestations" ? {en:"Manifestations génériques", manif:true} : h.startsWith("regle-") ? RULES.find(r => r.id === h.slice(6)) : null;
    if (!(h === "" || h === "accueil" || h === "regles" || h === "installer" || h === "soutenir" || h === "avenir" || h === "compte" || h === "confidentialite" || rule)) return;
    $("menu-hint").hidden = STANDALONE || !(h === "" || h === "accueil" || h === "installer");
    $("home-back").hidden = !rule && h !== "installer" && h !== "soutenir" && h !== "avenir" && h !== "compte" && h !== "confidentialite" && h !== "regles";
    if (rule) {
      $("home-title").textContent = rule.en;
      $("home-view").innerHTML = `<div class="rules">${rule.unit ? unitSheet(unitPage.U) : rule.renom ? rorPage() : rule.manif ? manifPage() : rule.fac ? (fac.soon ? `<p class="hint">Faction en cours de construction. Ses règles, unités et warscrolls arriveront dans une prochaine mise à jour.</p>` : fac.data ? genFactionPage(fac.data) : factionPage()) : rule.core ? corePage(rule) : rule.bp ? bpPage() : rule.tac ? tacPage() : blocks(rule.blocks)}</div>`;
    } else if (h === "soutenir") {
      $("home-title").textContent = "Soutenir le projet";
      $("home-view").innerHTML = supportHtml();
    } else if (h === "compte") {
      $("home-title").textContent = "Mon compte"; delArmed = false; renderAccount();
    } else if (h === "confidentialite") {
      $("home-title").textContent = "Confidentialité";
      $("home-view").innerHTML = privacyHtml();
    } else if (h === "avenir") {
      $("home-title").textContent = "À venir";
      $("home-view").innerHTML = roadmapHtml();
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
  $("home-back").addEventListener("click", () => { const h = location.hash.slice(1); location.hash = h === "confidentialite" ? "compte" : h === "installer" || h === "soutenir" || h === "avenir" || h === "compte" || h === "regles" ? "accueil" : h.startsWith("regle-u-rr~") ? "regle-renom" : h.startsWith("regle-u-ar~") ? "regle-faction-" + ((AORU[h.slice(11)] || {}).fac || "") : h.startsWith("regle-u-") ? "regle-faction-" + h.slice(8).split("~")[0] : "regles"; });
  window.addEventListener("hashchange", route);
  route();
