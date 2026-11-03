  window.WC_ARMY = {UNITS, BATTLE_TRAITS, FORMATIONS, TRAITS, ARTEFACTS, PROCEDES, SPELLS, PRAYERS, LORE_NAMES};
  window.WC_IMG = Object.fromEntries(Object.entries(PHOTO_OF).map(([k, v]) => [k, IMG[v]]));
  // ---------- Outils ----------
  const PHASE = {
    hero:"var(--ph-hero)", shoot:"var(--ph-shoot)", fight:"var(--ph-fight)", charge:"var(--ph-charge)",
    passive:"var(--ph-passive)", end:"var(--ph-end)", defense:"var(--ph-defense)", move:"var(--ph-move)"
  };
  const CRIT_LABEL = {none:"", "2hits":"Crit (2 touches)", auto:"Crit (blessure auto)", mortal:"Crit (mortel)"};
  const PHASES = [
    {k:"deploy",      n:"Phase de déploiement",       c:"passive"},
    {k:"start",       n:"Début du tour",              c:"passive"},
    {k:"start-opp",   n:"Début du tour adverse",      c:"passive"},
    {k:"hero",        n:"Phase des héros",            c:"hero"},
    {k:"hero-opp",    n:"Phase des héros adverse",    c:"hero"},
    {k:"move",        n:"Phase de mouvement",         c:"move"},
    {k:"move-opp",    n:"Phase de mouvement adverse", c:"move"},
    {k:"shoot",       n:"Phase de tir",               c:"shoot"},
    {k:"shoot-opp",   n:"Phase de tir adverse",       c:"shoot"},
    {k:"charge",      n:"Phase de charge",            c:"charge"},
    {k:"charge-opp",  n:"Phase de charge adverse",    c:"charge"},
    {k:"fight",       n:"Phase de combat",            c:"fight"},
    {k:"fight-opp",   n:"Phase de combat adverse",    c:"fight"},
    {k:"end",         n:"Fin du tour",                c:"end"},
    {k:"end-opp",     n:"Fin du tour adverse",        c:"end"}
  ];
  const LIMITS = [1000, 2000, 3000];
  const MAX_REG = 5;
  const AQSHY = " (Fléau d'Aqshy)";

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const isMelee = w => w.range === "Mêlée";
  const byId = (arr, id) => arr.find(o => o.id === id);
  const newKey = () => Math.random().toString(36).slice(2, 9);
  const clone = o => JSON.parse(JSON.stringify(o));
  const ICON_X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  // ---------- Factions ----------
  // Moment d'utilisation d'une aptitude BSData, déduit de son texte de timing
  function whenOf(a){
    const t = (a.t || "").toLowerCase(), out = [];
    const P = {"des héros":"hero", "de mouvement":"move", "de tir":"shoot", "de charge":"charge", "de mêlée":"fight"};
    if (t.includes("phase de déploiement")) out.push("deploy");
    if (t.includes("réaction")) {
      const r = t.split("réaction")[1];
      const k = /sort|prière|dissipation/.test(r) ? "hero" : /\btir\b/.test(r) ? "shoot" : /charge/.test(r) ? "charge"
              : /corps à corps/.test(r) ? "fight" : /mouvement|course|repli|redéploiement/.test(r) ? "move" : "";
      if (k) { if (!r.includes("l'adversaire")) out.push(k); if (!r.includes("vous avez")) out.push(k + "-opp"); }
      return out;
    }
    Object.entries(P).forEach(([fr, k]) => {
      if (t.includes("votre phase " + fr)) out.push(k);
      if (t.includes("phase " + fr + " adverse")) out.push(k + "-opp");
      if (t.includes("n'importe quelle phase " + fr)) out.push(k, k + "-opp");
    });
    if (t.includes("début du round") || t.includes("début du premier round") || t.includes("début de votre tour")) out.push("start");
    if (t.includes("début du tour adverse")) out.push("start-opp");
    if (t.includes("début de n'importe quel tour")) out.push("start", "start-opp");
    if (t.includes("fin de votre tour") || t.includes("fin du round")) out.push("end");
    if (t.includes("fin du tour adverse")) out.push("end-opp");
    if (t.includes("fin de n'importe quel tour")) out.push("end", "end-opp");
    return out;
  }
  const FX = {};
  FX.hashut = {id:"hashut", en:"Helsmiths of Hashut", hashut:true, units:UNITS, bt:BATTLE_TRAITS,
    formations: FORMATIONS.map(f => ({id:f.id, en:f.en, pts:0, abs:[f.ab]})),
    tables: [
      {key:"trait", title:"Trait héroïque", plural:"Traits héroïques", hero:true, items:TRAITS.map(t => ({id:t.id, en:t.en, pts:0, abs:[t.ab], aqshy:t.aqshy}))},
      {key:"artefact", title:"Artefact de pouvoir", plural:"Artefacts de pouvoir", hero:true, items:ARTEFACTS.map(t => ({id:t.id, en:t.en, pts:0, abs:[t.ab], aqshy:t.aqshy}))},
      {key:"proc", title:"Procédé Maudit", plural:"Procédés Maudits", war:true, items:PROCEDES.map(p => ({id:p.id, en:p.en, pts:p.pts, abs:[p.ab], aqshy:true}))}
    ],
    spells:[{id:"s0", en:LORE_NAMES && LORE_NAMES.spell || "Lore of Infernal Power", abs:SPELLS}],
    prayers:[{id:"p0", en:LORE_NAMES && LORE_NAMES.prayer || "Prayers of the Scorched Sect", abs:PRAYERS}],
    manifs:[],
    when: a => a.when || WHEN[a.n] || [],
    photo: id => IMG[PHOTO_OF[id]] || ""
  };
  const FIMG = window.WC_FIMG || {};
  const KNOWN = ["Traits de bataille","Formations de bataille","Traits héroïques","Artefacts de pouvoir","Sorts","Prières","Manifestations"];
  (window.WC_FAC || []).forEach(F => {
    const sec = t => F.sections.find(s => s.title === t);
    const mk = (s, p) => s ? s.items.map((it, i) => ({id:p + i, en:it.n, pts:it.pts || 0, abs:it.abs})) : [];
    const units = F.units.map(u => ({...u, unique:/\bUNIQUE\b/.test(u.kw), wizard:/SORCIER/.test(u.kw), priest:/PRÊTRE/.test(u.kw),
      war:/MACHINE DE GUERRE/.test(u.kw), aqshy:/Scourge of Aqshy/.test(u.en)}));
    FX[F.id] = {id:F.id, en:F.en, units, bt:mk(sec("Traits de bataille"), "b").flatMap(i => i.abs),
      formations: mk(sec("Formations de bataille"), "f"),
      tables: [
        {key:"trait", title:"Trait héroïque", plural:"Traits héroïques", hero:true, items:mk(sec("Traits héroïques"), "t")},
        {key:"artefact", title:"Artefact de pouvoir", plural:"Artefacts de pouvoir", hero:true, items:mk(sec("Artefacts de pouvoir"), "a")},
        ...F.sections.filter(s => !KNOWN.includes(s.title)).map((s, i) => ({key:"x" + i, title:s.title, plural:s.title, items:mk(s, "x" + i + "-")}))
      ].filter(t => t.items.length),
      spells: mk(sec("Sorts"), "s"), prayers: mk(sec("Prières"), "p"), manifs: mk(sec("Manifestations"), "m"),
      when: whenOf,
      photo: id => id === "armee" ? (FIMG[F.img] || "") : id === "tactiques" ? (IMG[PHOTO_OF.tactiques] || "") : (IMG[PHOTO_OF[id]] || "")
    };
  });
  const FAC_ORDER = Object.values(FX).sort((a, b) => a.en.localeCompare(b.en));
  const fx = l => (l && FX[l.fac]) || FX.hashut;
  const UF = (F, id) => F.units.find(u => u.id === id);

  // ---------- Stockage local ----------
  const STORE = "warcounter-listes";
  function load(){
    try {
      const s = JSON.parse(localStorage.getItem(STORE));
      if (s && Array.isArray(s.lists)) return s;
    } catch(e) {}
    return {lists:[clone(SEED)], active:SEED.id};
  }
  let state = load();
  function save(){ try { localStorage.setItem(STORE, JSON.stringify(state)); } catch(e) {} }
  const getList = id => state.lists.find(l => l.id === id);
  const activeList = () => getList(state.active) || null;

  // ---------- Calculs de liste ----------
  function entries(l){
    const F = fx(l), out = [];
    l.regiments.forEach((r, i) => {
      if (r.hero) out.push({e:r.hero, role:"hero", reg:i});
      (r.cmd || []).forEach(e => out.push({e, role:"cmd", reg:i}));
      r.units.forEach(e => out.push({e, role:"unit", reg:i}));
    });
    l.aux.forEach(e => out.push({e, role:"aux", reg:-1}));
    return out.filter(o => UF(F, o.e.u));
  }
  const tableOf = (F, key) => F.tables.find(t => t.key === key);
  const enhItem = (F, key, id) => { const t = tableOf(F, key); return t ? byId(t.items, id) : null; };
  // Améliorations portées par une entrée
  const enhOn = (l, e) => Object.entries(l.enh || {}).filter(([k, v]) => v && v.id && v.on === e.k).map(([k, v]) => ({t:tableOf(fx(l), k), x:enhItem(fx(l), k, v.id)})).filter(o => o.t && o.x);
  const entryPts = (l, e) => { const u = UF(fx(l), e.u); return u.pts * (e.reinf ? 2 : 1) + enhOn(l, e).reduce((s, o) => s + (o.x.pts || 0), 0); };
  const formOf = l => byId(fx(l).formations, l.formation);
  const auxSurcharge = l => 20 * l.aux.length * (l.aux.length - 1) / 2;
  const listPts = l => entries(l).reduce((s, o) => s + entryPts(l, o.e), 0) + auxSurcharge(l) + ((formOf(l) || {}).pts || 0);
  const tacticAb = t => ({c:"end", t:"Fin de votre tour", n:`${t.n} (carte n°${t.card})`, when:["end"],
    x:[...(t.gen ? ["Mise en place : " + t.gen] : []), ...t.t.map(([name, cond], i) => `${TIERS[i]}, ${name} : réussie à la fin de votre tour ${cond.charAt(0).toLowerCase() + cond.slice(1)}`)]});
  const regPts = (l, r) => [r.hero, ...(r.cmd || []), ...r.units].filter(Boolean).reduce((s, e) => s + entryPts(l, e), 0);
  const drops = l => l.regiments.length + l.aux.length;
  const sizeOf = (l, e) => UF(fx(l), e.u).size * (e.reinf ? 2 : 1);
  const holdersFor = (l, t) => entries(l).filter(o => { const u = UF(fx(l), o.e.u); return !u.unique && (t.hero ? u.hero : t.war ? u.war : true); });
  const lore = (l, kind) => { const L = fx(l)[kind]; const id = l.lore && l.lore[kind]; return id === "" ? null : byId(L, id) || L[0] || null; };

  // Migration et nettoyage des références
  function normalize(l){
    if (!l.fac || !FX[l.fac]) l.fac = "hashut";
    if (!Array.isArray(l.tactics)) l.tactics = [];
    if (!l.lore) l.lore = {};
    if (!l.enh) {
      l.enh = {};
      if (l.trait) l.enh.trait = l.trait;
      if (l.artefact) l.enh.artefact = l.artefact;
      entries(l).forEach(({e}) => { if (e.proc && !l.enh.proc) l.enh.proc = {id:e.proc, on:e.k}; });
    }
    delete l.trait; delete l.artefact;
    const F = fx(l), keys = new Set(entries(l).map(o => o.e.k));
    Object.keys(l.enh).forEach(k => {
      const v = l.enh[k];
      if (!v || !v.id || !enhItem(F, k, v.id)) { delete l.enh[k]; return; }
      if (v.on && !keys.has(v.on)) v.on = "";
    });
    entries(l).forEach(({e}) => {
      const u = UF(F, e.u);
      delete e.proc;
      if (u.size <= 1 || u.hero) delete e.reinf;
    });
  }
  state.lists.forEach(normalize);
  save();

  function validate(l){
    const F = fx(l), err = [], info = [];
    const pts = listPts(l);
    if (pts > l.limit) err.push(`Dépassement de ${pts - l.limit} pts pour une partie à ${l.limit} pts.`);
    if (!l.formation) err.push("Choisis une formation de bataille.");
    if (!l.regiments.length) err.push("Ajoute le régiment du général.");
    if (l.regiments.length > MAX_REG) err.push(`${MAX_REG} régiments maximum.`);
    l.regiments.forEach((r, i) => {
      const name = i === 0 ? "Régiment du général" : `Régiment ${i + 1}`;
      if (!r.hero) { err.push(`${name} : choisis le héros qui le commande.`); return; }
      const h = UF(F, r.hero.u), cap = i === 0 ? 4 : 3, n = (r.cmd || []).length + r.units.length;
      if (n > cap) err.push(`${name} : ${n} unités pour ${cap} maximum.`);
      if (F.hashut) {
        if (h.lead === "units" && r.cmd.length) err.push(`${name} : ${h.en} ne peut pas prendre de Commandant Hashutite.`);
        if (h.lead === "cmd-01" && r.cmd.length > 1) err.push(`${name} : 1 Commandant Hashutite maximum.`);
      }
    });
    const all = entries(l);
    F.units.filter(u => u.unique).forEach(u => { if (all.filter(o => o.e.u === u.id).length > 1) err.push(`${u.en} est Unique : 1 seul exemplaire.`); });
    Object.entries(l.enh).forEach(([k, v]) => {
      const t = tableOf(F, k); if (!t) return;
      const holder = all.find(o => o.e.k === v.on);
      if (!holder) err.push(`Choisis l'unité qui porte : ${t.title}.`);
      else if (UF(F, holder.e.u).unique) err.push(`${t.title} : une unité Unique ne peut pas porter d'amélioration.`);
    });
    all.forEach(o => { if (entryPts(l, o.e) > l.limit / 2) err.push(`${UF(F, o.e.u).en} coûte ${entryPts(l, o.e)} pts : une unité ne peut pas dépasser la moitié des points (${l.limit / 2} pts).`); });
    if (pts <= l.limit && l.limit - pts >= 50) info.push(`${l.limit - pts} pts non dépensés : 1 point de commandement supplémentaire au début du premier round.`);
    if (l.regiments.length) info.push(`${l.regiments.length} régiment${l.regiments.length > 1 ? "s" : ""} : si tu en as plus que ton adversaire, tu peux relancer ton jet de priorité une fois par bataille.`);
    const aq = all.some(o => UF(F, o.e.u).aqshy) || Object.entries(l.enh).some(([k, v]) => (enhItem(F, k, v.id) || {}).aqshy);
    if (aq) info.push("Contenu Fléau d'Aqshy : jouable uniquement avec le pack de bataille du Manuel du Général 2026-27.");
    if (l.aux.length) info.push(`${l.aux.length} unité${l.aux.length > 1 ? "s" : ""} auxiliaire${l.aux.length > 1 ? "s" : ""}${auxSurcharge(l) ? ` (surcoût de ${auxSurcharge(l)} pts)` : ""} : le joueur qui en a le moins gagne 1 point de commandement supplémentaire au début de chaque round.`);
    return {err, info};
  }

  // ---------- Rendu commun ----------
  function abCard(a){
    return `<div class="ab" style="--c:${PHASE[a.c] || PHASE.passive}"><div class="ab-head"><span>${esc(a.t)}</span>${a.cast ? `<span class="cast" aria-label="Valeur de lancement ${a.cast}">${a.cast}</span>` : ""}${a.chant ? `<span class="chant" aria-label="Valeur de récitation ${a.chant}"><span>${a.chant}</span></span>` : ""}${a.cost ? `<span class="cost">${esc(a.cost)}</span>` : ""}</div>
        <div class="ab-name">${esc(a.n)}</div><div class="ab-body">${a.x.map(p => `<p>${esc(p)}</p>`).join("")}</div></div>`;
  }
  function weaponBlock(list, ranged){
    if (!list.length) return "";
    const head = ranged ? ["Portée","A","Tou","Bles","Perf","Dég"] : ["A","Tou","Bles","Perf","Dég"];
    return `<div class="${ranged ? "ranged" : "melee"}"><h3 class="sec">${ranged ? "Armes de tir" : "Armes de mêlée"}</h3>
      <div class="colhead">${head.map(x => `<span>${x}</span>`).join("")}</div>` +
      list.map(w => {
        const vals = [w.a, w.h + "+", w.w + "+", w.r || "-", w.d];
        if (ranged) vals.unshift(w.range);
        const chips = [w.crit && w.crit !== "none" ? CRIT_LABEL[w.crit] : null, ...(w.extra || [])].filter(Boolean);
        return `<div class="weapon"><div class="wname">${esc(w.n)}</div>
          <div class="vals">${vals.map(v => `<span>${esc(v)}</span>`).join("")}</div>
          ${chips.length ? `<div class="chips">${chips.map(c => `<span class="chip">${esc(c)}</span>`).join("")}</div>` : ""}</div>`;
      }).join("") + `</div>`;
  }
  const withPts = (a, pts, aqshy) => ({...a, n:a.n + (aqshy ? AQSHY : ""), cost: pts ? "+" + pts + " pts" : a.cost});

  // Ce qui est joué : liste active ou catalogue de la faction consultée
  function scope(){
    const l = activeList();
    if (!l) {
      const F = FX[state.cat] || FX.hashut;
      return {l:null, F, units:F.units.slice(), formations:F.formations, tables:F.tables.map(t => ({t, items:t.items, holder:""})),
        spells:F.spells, prayers:F.prayers, manifs:F.manifs, tactics:TACTICS, wizard:true, priest:true, holders:{}};
    }
    const F = fx(l), ents = entries(l), ids = [];
    ents.forEach(o => { if (!ids.includes(o.e.u)) ids.push(o.e.u); });
    const units = ids.map(id => UF(F, id));
    const holders = {}, tables = [];
    F.tables.forEach(t => {
      const v = l.enh[t.key]; if (!v) return;
      const x = byId(t.items, v.id); if (!x) return;
      const o = ents.find(z => z.e.k === v.on);
      tables.push({t, items:[x], holder: o ? UF(F, o.e.u).en : ""});
      if (o) (holders[o.e.u] = holders[o.e.u] || []).push({kind:t.title, x});
    });
    const f = formOf(l), m = lore(l, "manifs");
    const wizard = units.some(u => u.wizard), priest = units.some(u => u.priest);
    return {l, F, units, tactics:(l.tactics || []).map(n => TACTICS.find(t => t.n === n)).filter(Boolean), formations:f ? [f] : [], tables,
      spells: wizard && lore(l, "spells") ? [lore(l, "spells")] : [], prayers: priest && lore(l, "prayers") ? [lore(l, "prayers")] : [],
      manifs: (wizard || priest) && m ? [m] : [], wizard, priest, holders,
      count: id => ents.filter(o => o.e.u === id).length};
  }

  // ---------- Écran Listes ----------
  const facOptions = sel => FAC_ORDER.map(F => `<option value="${F.id}"${F.id === sel ? " selected" : ""}>${esc(F.en)}</option>`).join("");
  function renderLists(){
    const cards = state.lists.map(l => {
      const v = validate(l), pts = listPts(l), f = formOf(l);
      return `<button type="button" class="lcard${l.id === state.active ? " on" : ""}" data-open="${esc(l.id)}">
        <span class="lc-top"><b>${esc(l.name || "Sans nom")}</b>${l.id === state.active ? `<span class="tag act">Active</span>` : ""}</span>
        <span class="lc-fac">${esc(fx(l).en)}</span>
        <span class="lc-pts${pts > l.limit ? " over" : ""}">${pts} / ${l.limit} pts</span>
        <span class="lc-sub">${f ? esc(f.en) + " · " : ""}${drops(l)} pose${drops(l) > 1 ? "s" : ""}${v.err.length ? ` · <span class="bad">${v.err.length} point${v.err.length > 1 ? "s" : ""} à corriger</span>` : ` · <span class="good">Liste valide</span>`}</span>
      </button>`;
    }).join("");
    $("lists").innerHTML = `<div class="lhead"><h2>Mes listes</h2></div>
      <div class="panel"><h3 class="sec">Nouvelle liste</h3><div class="body"><div class="row newl"><select id="new-fac" aria-label="Faction de la nouvelle liste">${facOptions(state.newFac || "hashut")}</select><button type="button" class="btn primary" id="new-list">Créer</button></div></div></div>` +
      (cards ? `<div class="lgrid">${cards}</div>` : `<p class="hint center">Aucune liste. Crée ta première liste.</p>`) +
      `<p class="hint">Règles de construction du Manuel du Général 2026-27. Tes listes restent enregistrées sur cet appareil.</p>`;
  }
  $("lists").addEventListener("change", e => { if (e.target.id === "new-fac") { state.newFac = e.target.value; save(); } });
  $("lists").addEventListener("click", e => {
    if (e.target.closest("#new-list")) {
      const fac = $("new-fac").value || "hashut";
      const l = {id:newKey(), fac, name:"Nouvelle liste", limit:2000, formation:"", regiments:[{hero:null, cmd:[], units:[]}], aux:[], tactics:[], enh:{}, lore:{}};
      state.lists.push(l); save(); location.hash = "liste-" + l.id; return;
    }
    const c = e.target.closest("[data-open]");
    if (c) location.hash = "liste-" + c.dataset.open;
  });

  // ---------- Éditeur de liste ----------
  let editing = null;
  const optList = (arr, sel, label) => arr.map(o => `<option value="${esc(o.id)}"${o.id === sel ? " selected" : ""}>${esc(label(o))}</option>`).join("");
  const unitLabel = u => `${u.en} (${u.pts} pts)`;

  function entRow(e, path, l){
    const F = fx(l), u = UF(F, e.u), tags = enhOn(l, e).map(o => o.x.en);
    const canReinf = !u.hero && u.size > 1;
    return `<div class="ent">
      <div class="ent-main"><div class="ent-name">${esc(u.en)}</div>
        <div class="ent-meta">${sizeOf(l, e)} fig. · <b>${entryPts(l, e)} pts</b>${tags.map(t => ` <span class="tag gold">${esc(t)}</span>`).join("")}</div></div>
      <button type="button" class="del" data-act="del" data-path="${path}" aria-label="Retirer ${esc(u.en)}">${ICON_X}</button>
      ${canReinf ? `<div class="ent-opts"><label class="check"><input type="checkbox" data-act="reinf" data-path="${path}"${e.reinf ? " checked" : ""}> Renforcée (+${u.pts} pts)</label></div>` : ""}
    </div>`;
  }

  function renderEdit(){
    const l = getList(editing);
    if (!l) { location.hash = "listes"; return; }
    normalize(l);
    const F = fx(l), pts = listPts(l), v = validate(l), pct = Math.min(100, Math.round(pts / l.limit * 100));
    const f = formOf(l), empty = !entries(l).length;
    const HEROES = F.units.filter(u => u.hero), TROOPS = F.units.filter(u => !u.hero), CMDS = F.units.filter(u => u.cmd);
    const unitOpts = F.hashut ? optList(TROOPS, "", unitLabel)
      : `<optgroup label="Unités">${optList(TROOPS, "", unitLabel)}</optgroup><optgroup label="Héros (si l'option de régiment le permet)">${optList(HEROES, "", unitLabel)}</optgroup>`;
    let h = `<div class="panel"><h3 class="sec dark">Liste</h3><div class="body">
      <div><label class="lbl" for="lname">Nom de la liste</label><input type="text" id="lname" value="${esc(l.name)}" placeholder="Ex. Castigation Battery" autocomplete="off"></div>
      <div><label class="lbl" for="lfac">Faction</label>${empty ? `<select id="lfac" data-act="fac">${facOptions(l.fac)}</select>` : `<p class="facname">${esc(F.en)}</p>`}</div>
      <div><span class="lbl">Format (3000 pts : d'un commun accord)</span><div class="seg">${LIMITS.map(x => `<button type="button" class="pick" data-act="limit" data-v="${x}" aria-pressed="${l.limit === x}">${x} pts</button>`).join("")}</div></div>
      <div class="total${pts > l.limit ? " over" : ""}"><div class="big">${pts} <span>/ ${l.limit} pts</span></div>
        <div class="meter" role="img" aria-label="${pct} % des points utilisés"><span style="width:${pct}%"></span></div>
        <div class="sub"><span>${drops(l)} pose${drops(l) > 1 ? "s" : ""}</span><span>${l.limit - pts >= 0 ? `${l.limit - pts} pts restants` : `${pts - l.limit} pts en trop`}</span></div></div>
      ${l.id === state.active ? `<p class="note gold">Liste active : le Mémo et les Phases affichent cette liste.</p>` : `<button type="button" class="btn primary" data-act="activate">Utiliser cette liste</button>`}
    </div></div>`;

    const loreSel = (kind, label, none) => {
      const L = F[kind]; if (!L.length) return "";
      const cur = lore(l, kind);
      if (L.length === 1 && !none) return `<p class="hint">${label} : ${esc(L[0].en)} (inclus d'office).</p>`;
      return `<div><label class="lbl" for="lore-${kind}">${label}</label><select id="lore-${kind}" data-act="lore" data-k="${kind}">${none ? `<option value=""${!cur ? " selected" : ""}>Aucun</option>` : ""}${optList(L, cur && cur.id, o => o.en)}</select></div>`;
    };
    h += `<div class="panel"><h3 class="sec">Formation et domaines</h3><div class="body">
      <div><label class="lbl" for="formation">Formation de bataille</label><select id="formation" data-act="formation"><option value="">Choisir…</option>${optList(F.formations, l.formation, o => o.en + (o.pts ? ` (+${o.pts} pts)` : ""))}</select>
      ${f ? `<p class="hint">${esc(f.abs.map(a => a.n).join(", "))}</p>` : ""}</div>
      ${loreSel("spells", "Domaine de sorts")}${loreSel("prayers", "Domaine de prières")}${loreSel("manifs", "Domaine de manifestations", true)}
      ${!F.spells.length && !F.prayers.length ? `<p class="hint">Pas de domaine de sorts ni de prières pour cette faction.</p>` : ""}
    </div></div>`;

    l.regiments.forEach((r, i) => {
      const hu = r.hero && UF(F, r.hero.u), cap = i === 0 ? 4 : 3, n = (r.cmd || []).length + r.units.length;
      const cmdMax = !F.hashut || !hu ? 0 : hu.lead === "cmd-any" ? 99 : hu.lead === "cmd-01" ? 1 : 0;
      h += `<div class="panel"><h3 class="sec${i === 0 ? " gen" : ""}"><span>${i === 0 ? "Régiment du général" : "Régiment " + (i + 1)}</span><span class="sec-r">${regPts(l, r)} pts<button type="button" class="del light" data-act="delreg" data-i="${i}" aria-label="Supprimer ce régiment">${ICON_X}</button></span></h3><div class="body">`;
      if (r.hero) {
        h += `<div><span class="lbl">${i === 0 ? "Général" : "Héros"}</span>${entRow(r.hero, `r${i}.hero`, l)}</div>`;
      } else {
        h += `<div><label class="lbl" for="hero${i}">${i === 0 ? "Général" : "Héros"}</label><select id="hero${i}" data-act="sethero" data-i="${i}"><option value="">Choisir le héros…</option>${optList(HEROES, "", unitLabel)}</select></div>`;
      }
      if (cmdMax) {
        h += `<div><span class="lbl">Commandant${cmdMax > 1 ? "s" : ""} Hashutite${cmdMax > 1 ? "s" : ""} ${cmdMax > 1 ? "(sans limite)" : "(0-1)"}</span>${r.cmd.map((e, j) => entRow(e, `r${i}.cmd.${j}`, l)).join("")}
          ${r.cmd.length < cmdMax && n < cap ? `<select data-act="addcmd" data-i="${i}" aria-label="Ajouter un commandant"><option value="">+ Ajouter un commandant</option>${optList(CMDS, "", unitLabel)}</select>` : ""}</div>`;
      }
      h += `<div><span class="lbl">Unités <span class="cnt${n > cap ? " bad" : ""}">${n} / ${cap}</span></span>${r.units.map((e, j) => entRow(e, `r${i}.units.${j}`, l)).join("")}
        ${n < cap ? `<select data-act="addunit" data-i="${i}" aria-label="Ajouter une unité"><option value="">+ Ajouter une unité</option>${unitOpts}</select>` : ""}</div>`;
      h += `</div></div>`;
    });
    h += `<button type="button" class="btn wide" data-act="addreg"${l.regiments.length >= MAX_REG ? " disabled" : ""}>+ Ajouter un régiment (${l.regiments.length} / ${MAX_REG})</button>`;
    if (!F.hashut) h += `<p class="hint">Les options de régiment propres à chaque héros (warscroll) ne sont pas vérifiées : contrôle-les dans ton tome de bataille.</p>`;

    h += `<div class="panel"><h3 class="sec"><span>Unités auxiliaires</span><span class="sec-r">${l.aux.reduce((s, e) => s + entryPts(l, e), 0) + auxSurcharge(l)} pts</span></h3><div class="body">
      ${l.aux.map((e, j) => entRow(e, `aux.${j}`, l)).join("")}
      <select data-act="addaux" aria-label="Ajouter une unité auxiliaire"><option value="">+ Ajouter une unité auxiliaire</option>${unitOpts}</select>
      ${auxSurcharge(l) ? `<p class="note">Surcoût des auxiliaires : +${auxSurcharge(l)} pts (+20, +40, +60… à partir de la deuxième).</p>` : ""}
      <p class="hint">Hors régiment : chaque unité auxiliaire compte comme une pose. À partir de la deuxième, surcoût cumulatif de 20 pts (+20, +40, +60…).</p>
    </div></div>`;

    h += `<div class="panel"><h3 class="sec">Améliorations</h3><div class="body">` + F.tables.map(t => {
      const v = l.enh[t.key], hs = holdersFor(l, t);
      const holderSel = `<select data-act="on" data-t="${t.key}" aria-label="Porteur : ${esc(t.title)}"><option value="">Porté par…</option>${hs.map(o => `<option value="${esc(o.e.k)}"${v && v.on === o.e.k ? " selected" : ""}>${esc(UF(F, o.e.u).en)}${o.role === "cmd" ? " (commandant)" : ""}</option>`).join("")}</select>`;
      return `<div><label class="lbl" for="enh-${t.key}">${esc(t.title)}</label><select id="enh-${t.key}" data-act="enh" data-t="${t.key}"><option value="">Aucun</option>${optList(t.items, v && v.id, o => o.en + (o.pts ? ` (+${o.pts} pts)` : "") + (o.aqshy && t.key !== "proc" ? AQSHY : ""))}</select>
        ${v && v.id ? holderSel : ""}</div>`;
    }).join("") + `<p class="hint">${F.hashut ? "1 amélioration par table : 1 trait héroïque, 1 artefact (héros non Unique) et 1 Procédé Maudit, à choisir sur une Machine de Guerre non Unique." : "1 amélioration par table, sur une unité non Unique (un même héros peut cumuler un trait et un artefact). Les tables spéciales ont leurs propres conditions : vérifie-les dans ton tome de bataille."}</p>
    </div></div>`;

    const tsel = j => `<select data-act="tactic" data-j="${j}" aria-label="Carte de tactique ${j + 1}"><option value="">Carte ${j + 1} : aucune</option>${TACTICS.filter(t => t.n === l.tactics[j] || !l.tactics.includes(t.n)).map(t => `<option value="${esc(t.n)}"${l.tactics[j] === t.n ? " selected" : ""}>n°${t.card} · ${esc(t.n)}</option>`).join("")}</select>`;
    h += `<div class="panel"><h3 class="sec">Battle Tactics</h3><div class="body">${tsel(0)}${tsel(1)}<p class="hint">Jusqu'à 2 cartes du module Battle Tactics 2026-27.</p></div></div>`;

    h += `<div class="panel"><h3 class="sec dark">Vérification</h3><div class="body">
      ${v.err.length ? `<ul class="errs">${v.err.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p class="ok">Liste valide.</p>`}
      ${v.info.map(x => `<p class="note">${esc(x)}</p>`).join("")}
    </div></div>`;

    h += `<div class="actions"><button type="button" class="btn" data-act="dup">Dupliquer</button><button type="button" class="btn danger" data-act="dellist">Supprimer la liste</button></div>`;
    $("edit").innerHTML = h;
    $("title").textContent = l.name || "Sans nom";
  }

  // Résout un chemin "r0.units.2" / "r1.hero" / "aux.0"
  function resolve(l, path){
    const p = path.split(".");
    if (p[0] === "aux") return {arr:l.aux, idx:+p[1]};
    const r = l.regiments[+p[0].slice(1)];
    if (p[1] === "hero") return {reg:r};
    return {arr:r[p[1]], idx:+p[2]};
  }
  function getEntry(l, path){ const x = resolve(l, path); return x.reg ? x.reg.hero : x.arr[x.idx]; }

  function onEdit(e){
    const t = e.target.closest("[data-act]");
    if (!t) return;
    const l = getList(editing); if (!l) return;
    const act = t.dataset.act, isSel = t.tagName === "SELECT", isChk = t.type === "checkbox";
    if (e.type === "click" && (isSel || isChk)) return;
    if (e.type === "change" && !(isSel || isChk)) return;
    const i = +t.dataset.i;
    switch (act) {
      case "limit": l.limit = +t.dataset.v; break;
      case "fac": if (!entries(l).length && FX[t.value]) { l.fac = t.value; l.formation = ""; l.enh = {}; l.lore = {}; l.regiments.forEach(r => { r.cmd = []; }); } break;
      case "activate": state.active = l.id; break;
      case "formation": l.formation = t.value; break;
      case "lore": l.lore[t.dataset.k] = t.value; break;
      case "sethero": if (t.value) l.regiments[i].hero = {u:t.value, k:newKey()}; break;
      case "addcmd": if (t.value) l.regiments[i].cmd.push({u:t.value, k:newKey()}); break;
      case "addunit": if (t.value) l.regiments[i].units.push({u:t.value, k:newKey()}); break;
      case "addaux": if (t.value) l.aux.push({u:t.value, k:newKey()}); break;
      case "addreg": if (l.regiments.length < MAX_REG) l.regiments.push({hero:null, cmd:[], units:[]}); break;
      case "delreg": l.regiments.splice(i, 1); break;
      case "del": { const x = resolve(l, t.dataset.path); if (x.reg) { x.reg.hero = null; x.reg.cmd = []; } else x.arr.splice(x.idx, 1); break; }
      case "reinf": getEntry(l, t.dataset.path).reinf = t.checked; break;
      case "enh": { const k = t.dataset.t; if (t.value) l.enh[k] = {id:t.value, on:(l.enh[k] && l.enh[k].on) || ""}; else delete l.enh[k]; break; }
      case "on": if (l.enh[t.dataset.t]) l.enh[t.dataset.t].on = t.value; break;
      case "tactic": { const j = +t.dataset.j; l.tactics[j] = t.value; l.tactics = l.tactics.slice(0, 2).map(x => x || ""); break; }
      case "dup": { const c = clone(l); c.id = newKey(); c.name = (l.name || "Liste") + " (copie)"; state.lists.push(c); save(); location.hash = "liste-" + c.id; return; }
      case "dellist": {
        if (!t.dataset.confirm) { t.dataset.confirm = "1"; t.textContent = "Confirmer la suppression"; return; }
        state.lists = state.lists.filter(x => x.id !== l.id);
        if (state.active === l.id) state.active = null;
        save(); location.hash = "listes"; return;
      }
      default: return;
    }
    normalize(l); save();
    const y = window.scrollY; renderEdit(); window.scrollTo(0, y);
  }
  $("edit").addEventListener("click", onEdit);
  $("edit").addEventListener("change", onEdit);
  $("edit").addEventListener("input", e => {
    if (e.target.id !== "lname") return;
    const l = getList(editing); if (!l) return;
    l.name = e.target.value; save();
    $("title").textContent = l.name || "Sans nom";
  });

  // ---------- Mémo ----------
  function groupsFor(s){
    const g = [{id:"armee", en:"Règles de l'armée"}];
    if (s.spells.length) g.push({id:"sorts", en:"Sorts"});
    if (s.prayers.length) g.push({id:"prieres", en:"Prières"});
    if (s.manifs.length) g.push({id:"manifestations", en:"Manifestations"});
    if (s.tactics.length) g.push({id:"tactiques", en:"Battle Tactics"});
    return g;
  }
  function tile(F, id, name, army, badge){
    const p = F.photo(id);
    return `<button type="button" class="unit-link${army ? " army-link" : ""}${p ? " has-photo" : ""}" data-id="${esc(id)}"${p ? ` style="--img:url('${p}')"` : ""}>${badge ? `<span class="badge">${badge}</span>` : ""}<span>${esc(name)}</span></button>`;
  }
  function renderMemo(){
    const s = scope();
    $("memo-banner").innerHTML = s.l
      ? `<a class="banner" href="#liste-${esc(s.l.id)}"><span><b>${esc(s.l.name || "Sans nom")}</b><br>${esc(s.F.en)} · ${listPts(s.l)} / ${s.l.limit} pts${s.formations[0] ? " · " + esc(s.formations[0].en) : ""}</span><span class="banner-go">Modifier</span></a>`
      : `<div class="banner off"><span>Aucune liste active : catalogue de la faction choisie.</span><a class="banner-go" href="#listes">Listes</a></div>
         <div class="catsel"><label class="lbl" for="cat-fac">Faction consultée</label><select id="cat-fac">${facOptions(s.F.id)}</select></div>`;
    $("list").innerHTML = groupsFor(s).map(g => tile(s.F, g.id, g.en, true)).join("") +
      s.units.map(u => tile(s.F, u.id, u.en, false, s.l && s.count(u.id) > 1 ? "×" + s.count(u.id) : "")).join("");
  }
  $("list").addEventListener("click", e => { const t = e.target.closest(".unit-link"); if (t) location.hash = t.dataset.id; });
  $("memo-banner").addEventListener("change", e => { if (e.target.id === "cat-fac") { state.cat = e.target.value; save(); renderMemo(); } });

  function sectionHtml(title, abilities){
    return abilities.length ? `<h3 class="sec">${esc(title)}</h3><div class="abilities">${abilities.map(abCard).join("")}</div>` : "";
  }
  const loreHtml = L => L.map(x => sectionHtml(x.en, x.abs)).join("");
  function showGroup(id){
    const s = scope();
    let h = "";
    if (id === "sorts") h += loreHtml(s.spells);
    else if (id === "prieres") h += loreHtml(s.prayers);
    else if (id === "manifestations") h += loreHtml(s.manifs);
    else if (id === "tactiques") h += sectionHtml(s.l ? "Tes cartes" : "Battle Tactics 2026-27", s.tactics.map(tacticAb));
    else {
      h += sectionHtml("Traits de bataille", s.F.bt);
      h += s.l ? sectionHtml(s.formations[0] ? "Formation : " + s.formations[0].en : "Formation", s.formations.flatMap(f => f.abs.map(a => withPts(a, f.pts))))
               : sectionHtml("Formations de bataille (1 au choix)", s.F.formations.flatMap(f => f.abs.map(a => withPts({...a, n: f.abs.length > 1 ? f.en + " : " + a.n : a.n}, f.pts))));
      s.tables.forEach(({t, items, holder}) => {
        h += sectionHtml(s.l ? `${t.title}${holder ? " : " + holder : ""}` : `${t.plural} (1 au choix)`, items.flatMap(x => x.abs.map(a => withPts(a, x.pts, x.aqshy && t.key !== "proc"))));
      });
    }
    $("unit").innerHTML = h;
  }
  function showUnit(F, u){
    const s = scope(), st = u.stats, p = F.photo(u.id);
    let h = p ? `<div class="hero-photo"><img src="${p}" alt=""></div>` : "";
    const discs = [[st.M,"Mouv."],[st.S,"Santé"],[st.C,"Contrôle"],[st.Sv,"Sauv.","sv"]];
    if (st.W) discs.push([st.W,"Prot.","wd"]);
    h += `<div class="statband"><div class="stats" style="--n:${discs.length}">` +
      discs.map(([v,lab,c]) => `<div><div class="disc${c ? " " + c : ""}">${esc(v)}</div><div class="l">${lab}</div></div>`).join("") + `</div>
      <p class="unit-pts">${u.size} figurine${u.size > 1 ? "s" : ""} · ${u.pts} pts${u.size > 1 && !u.hero ? ` · renforcée : ${u.size * 2} fig., ${u.pts * 2} pts` : ""}${u.aqshy ? " · Fléau d'Aqshy" : ""}</p></div>`;
    h += weaponBlock(u.weapons.filter(w => !isMelee(w)), true);
    h += weaponBlock(u.weapons.filter(isMelee), false);
    h += sectionHtml("Aptitudes", u.abilities);
    const mine = (s.holders[u.id] || []);
    if (mine.length) h += `<h3 class="sec">Améliorations de ta liste</h3><div class="abilities">${mine.map(m => `<div class="ab-wrap"><p class="who">${esc(m.kind)}</p>${m.x.abs.map(a => abCard(withPts(a, m.x.pts))).join("")}</div>`).join("")}</div>`;
    h += `<h3 class="sec">Mots-clés</h3><div class="kw">Mots-clés : <b>${esc(u.kw)}</b></div>`;
    $("unit").innerHTML = h;
  }

  // ---------- Phases ----------
  function renderPhases(){
    const s = scope(), F = s.F, src = [];
    F.bt.forEach(a => src.push({who:"Trait de bataille", a}));
    s.formations.forEach(f => f.abs.forEach(a => src.push({who:"Formation " + f.en, a})));
    s.tables.forEach(({t, items, holder}) => items.forEach(x => x.abs.forEach(a => src.push({who:t.title + (holder ? " · " + holder : ""), a}))));
    s.spells.forEach(L => L.abs.forEach(a => src.push({who:"Sort · " + L.en, a})));
    s.prayers.forEach(L => L.abs.forEach(a => src.push({who:"Prière · " + L.en, a})));
    s.manifs.forEach(L => L.abs.forEach(a => src.push({who:"Manifestation · " + L.en, a})));
    s.tactics.forEach(t => src.push({who:"Battle Tactic", a:tacticAb(t)}));
    s.units.forEach(u => { const n = s.l ? s.count(u.id) : 1; u.abilities.forEach(a => src.push({who:u.en + (n > 1 ? " ×" + n : ""), a})); });
    const seen = new Set();
    $("phase-banner").innerHTML = s.l
      ? `<a class="banner" href="#liste-${esc(s.l.id)}"><span><b>${esc(s.l.name || "Sans nom")}</b><br>Phases de ta liste active · ${esc(F.en)}</span><span class="banner-go">Modifier</span></a>`
      : `<a class="banner off" href="#listes"><span>Aucune liste active : toutes les aptitudes de ${esc(F.en)} sont affichées.</span><span class="banner-go">Choisir</span></a>`;
    $("phases").innerHTML = PHASES.map(ph => {
      const items = src.filter(({who, a}) => {
        if (!(a.when || F.when(a) || []).includes(ph.k)) return false;
        const key = ph.k + "|" + who + "|" + a.n;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
      if (!items.length) return "";
      return `<details class="phase" style="--c:${PHASE[ph.c]}"><summary><span>${ph.n}</span><span class="count">${items.length}</span></summary><div class="abilities">` +
        items.map(({who, a}) => `<div class="ab-wrap"><p class="who">${esc(who)}</p>${abCard(a)}</div>`).join("") + `</div></details>`;
    }).join("");
  }

  // ---------- Navigation ----------
  const GROUPS = {armee:"Règles de l'armée", sorts:"Sorts", prieres:"Prières", manifestations:"Manifestations", tactiques:"Battle Tactics"};
  function route(){
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash === "parties" || hash === "" || hash === "accueil" || hash === "installer" || hash === "regles" || hash.startsWith("regle-")) return;
    const F = scope().F, unit = UF(F, hash), group = hash in GROUPS;
    let view = "memo";
    if (hash === "listes") view = "lists";
    else if (hash.startsWith("liste-")) { editing = hash.slice(6); view = getList(editing) ? "edit" : "lists"; }
    else if (hash === "phases") view = "phases";
    else if (unit || group) view = "unit";
    ["lists","edit","memo","unit","phases"].forEach(k => { $("view-" + k).hidden = k !== view; });
    $("back").hidden = !(view === "unit" || view === "edit");
    const tab = view === "edit" ? "lists" : view === "unit" ? "memo" : view;
    ["lists","memo","phases"].forEach(k => { if (k === tab) $("nav-" + k).setAttribute("aria-current", "page"); else $("nav-" + k).removeAttribute("aria-current"); });
    $("title").textContent = "WarCounter";
    if (view === "lists") renderLists();
    else if (view === "edit") renderEdit();
    else if (view === "memo") renderMemo();
    else if (view === "phases") renderPhases();
    else if (group) { showGroup(hash); $("title").textContent = GROUPS[hash]; }
    else { showUnit(F, unit); $("title").textContent = unit.en; }
    window.scrollTo(0, 0);
  }
  $("back").addEventListener("click", () => { location.hash = $("view-edit").hidden ? "memo" : "listes"; });
  window.addEventListener("hashchange", route);
  route();
