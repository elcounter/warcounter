  const PHASE = {hero:"var(--ph-hero)", shoot:"var(--ph-shoot)", fight:"var(--ph-fight)", charge:"var(--ph-charge)", passive:"var(--ph-passive)", end:"var(--ph-end)", defense:"var(--ph-defense)", move:"var(--ph-move)"};
  const ROUNDS = 5, TAC_PTS = 5;
  const TRASH = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
  const KEY = "warcounter-partie-v1", LKEY = "warcounter-parties", HKEY = "warcounter-historique", LISTS = "warcounter-listes";
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  // ---------- Sauvegarde locale ----------
  const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const drop = k => { try { localStorage.removeItem(k); } catch (e) {} };

  function newGame(){
    return {
      id:"p" + Date.now(), status:"setup", view:"setup", bp:null, label:"",
      players:[0,1].map(i => ({name:"", faction:"", tac:[null,null], poses:0, aux:false})), noTac:false,
      attacker:null,
      rounds:Array.from({length:ROUNDS}, () => ({first:null, init:null, prim:[[],[]], cpd:[0,0]})),
      tac:[[[null,null,null],[null,null,null]],[[null,null,null],[null,null,null]]]
    };
  }
  // Parties en cours (plusieurs) ; reprise de l'ancienne sauvegarde unique
  let GAMES = load(LKEY, null);
  if (!GAMES) {
    GAMES = [];
    const old = load(KEY, null);
    if (old && old.status !== "done" && old.bp != null) GAMES.push(old);
    store(LKEY, GAMES); drop(KEY);
  }
  GAMES.forEach((g, i) => { if (!g.id) g.id = "p" + Date.now() + i; });
  let G = null;
  let view = "home", histG = null;
  const save = () => { if (G) { G.updated = Date.now(); if (!GAMES.includes(G)) GAMES.unshift(G); store(LKEY, GAMES); } };
  const withG = (g, f) => { const k = G; G = g; try { return f(); } finally { G = k; } };

  // ---------- Calculs ----------
  const bp = () => G.bp == null ? null : BATTLEPLANS[G.bp];
  const other = p => 1 - p;
  const avail = (s, r) => !(s.only && s.only !== r) && !(s.from && r < s.from);
  function primScore(p, r){
    const b = bp(); if (!b) return 0;
    return b.sc.reduce((t, s, i) => t + (G.rounds[r-1].prim[p][i] && avail(s, r) ? s.v : 0), 0);
  }
  function tacScore(p, c, r){ return G.tac[p][c].filter(x => x === r).length * TAC_PTS; }
  function roundScore(p, r){ return primScore(p, r) + tacScore(p, 0, r) + tacScore(p, 1, r); }
  function total(p, upTo){ let t = 0; for (let r = 1; r <= (upTo || ROUNDS); r++) t += roundScore(p, r); return t; }

  // Outsider et double tour, round par round
  function analysis(){
    const out = [null], seize = [null], voided = [null];
    let persistent = null;
    for (let r = 1; r <= ROUNDS; r++){
      let s = null, v = null;
      if (r >= 2){
        const pf = G.rounds[r-2].first, cf = G.rounds[r-1].first;
        if (pf != null && cf != null && cf !== pf){
          const lead = total(other(cf), r-1) - total(cf, r-1);
          if (lead >= 11) v = cf; else { s = cf; persistent = other(cf); }
        }
      }
      let u = null;
      if (r >= 2){
        if (persistent != null) u = persistent;
        else { const a = total(0, r-1), b = total(1, r-1); u = a < b ? 0 : b < a ? 1 : null; }
      }
      out.push(u); seize.push(s); voided.push(v);
    }
    return {out, seize, voided};
  }
  const cpBase = (p, r, A) => A.out[r] === p ? 5 : 4;

  // ---------- Fenêtres ----------
  function openModal(title, html){
    $("sheet").innerHTML = `<h2 class="sec dark"><span>${esc(title)}</span><button class="icon-btn" type="button" data-act="close" aria-label="Fermer"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></h2><div class="body">${html}</div>`;
    $("modal").hidden = false;
    $("sheet").scrollTop = 0;
  }
  const closeModal = () => { $("modal").hidden = true; $("sheet").innerHTML = ""; };
  $("modal").addEventListener("click", e => { if (e.target === $("modal")) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("modal").hidden) closeModal(); });

  const abCard = a => `<div class="ab" style="--c:${PHASE[a.c]}"><div class="ab-head">${esc(a.t)}</div><div class="ab-name">${esc(a.n)}</div><div class="ab-body">${a.x.map(p => `<p>${esc(p)}</p>`).join("")}</div></div>`;
  function bpInfo(i){
    const b = BATTLEPLANS[i];
    openModal(b.id + " " + b.n, `
      <img class="map" src="${MAPS[b.id]}" alt="Carte de déploiement ${esc(b.n)}">
      <div><span class="lbl">Outsider</span><p style="margin:0">${esc(b.out)}</p></div>
      <div><span class="lbl">Aptitudes du battleplan</span><div class="stack" style="gap:10px">${b.ab.map(abCard).join("")}</div></div>
      <div><span class="lbl">Score primaire</span><div class="stack" style="gap:8px">${b.sc.map(s => `<div><b>${esc(s.n)} : ${s.v} PV</b><br><span class="hint">${esc(s.t)}</span></div>`).join("")}</div></div>`);
  }
  function tacInfo(i){
    const t = TACTICS[i];
    openModal(t.n, `<p class="hint">Carte n°${t.card} · chaque niveau rapporte ${TAC_PTS} PV, à valider dans l'ordre, un seul par tour.</p>
      ${t.gen ? `<div><span class="lbl">Règle générale</span><p style="margin:0">${esc(t.gen)}</p></div>` : ""}
      ${t.t.map((x, k) => `<div class="tier"><h4>${TIERS[k]}</h4><b>${esc(x[0])}</b><span>Réussie à la fin de votre tour ${esc(x[1].charAt(0).toLowerCase() + x[1].slice(1))}</span></div>`).join("")}`);
  }

  // ---------- Vues ----------
  const STEPS = ["setup","start","r1","r2","r3","r4","r5","summary"];
  const rawName = p => (G.players[p].name || "").trim() || ("Joueur " + (p+1));
  const pname = p => esc(rawName(p));

  function vHome(){
    const hist = load(HKEY, []);
    let h = `<button class="btn primary" type="button" data-act="new">Nouvelle partie</button>`;
    const live = GAMES.slice().sort((x, y) => (y.updated || 0) - (x.updated || 0));
    if (live.length) h += `<div><span class="lbl">Parties en cours</span><div class="stack" style="gap:10px">${live.map(g => withG(g, () => {
      const where = g.view === "setup" ? "Préparation" : g.view === "start" ? "Début de partie" : g.view === "summary" ? "Récapitulatif" : g.view && g.view[0] === "r" ? "Round " + g.view.slice(1) : "";
      return `<div class="panel live"><div class="body">
        <div class="row"><div class="grow"><b>${pname(0)}</b> contre <b>${pname(1)}</b><div class="hint">${bp() ? esc(bp().id + " " + bp().n) : "Battleplan à choisir"}${g.label ? " · " + esc(g.label) : ""}</div></div><div class="big">${total(0)} - ${total(1)}</div></div>
        <div class="row"><span class="tag">${where}</span><span class="grow"></span><button class="del" type="button" data-act="del" data-id="${g.id}" aria-label="Supprimer cette partie">${TRASH}</button><button class="btn gold" type="button" data-act="resume" data-id="${g.id}">Reprendre</button></div>
      </div></div>`; })).join("")}</div></div>`;
    else h += `<div class="panel hero"><h2>Aucune partie en cours</h2><p class="hint">Battleplan, joueurs et tactiques, puis le score round par round.</p></div>`;
    if (hist.length) h += `<div><span class="lbl">Parties terminées</span><div class="hist">${hist.slice(0,15).map((x, i) => `<div>${x.g ? `<button class="grow hopen" type="button" data-act="hopen" data-i="${i}">` : `<span class="grow">`}<b>${esc(x.a)}</b> ${x.sa} - ${x.sb} <b>${esc(x.b)}</b><br><span class="hint">${esc(x.bp)} · ${esc(x.d)}</span>${x.g ? `</button>` : `</span>`}<button class="del" type="button" data-act="hdel" data-i="${i}" aria-label="Supprimer cette partie">${TRASH}</button></div>`).join("")}</div></div>`;
    return h;
  }

  function factionSelect(p){
    const v = G.players[p].faction;
    return `<select id="f${p}" data-set="faction" data-p="${p}"><option value="">Choisir une faction</option>${FACTIONS.map(([g, list]) => `<optgroup label="${g}">${list.map(f => `<option${f === v ? " selected" : ""}>${esc(f)}</option>`).join("")}</optgroup>`).join("")}</select>`;
  }
  // Listes WarCounter
  const facName = l => ((window.WC_FAC || []).find(F => F.id === l.fac) || {en:"Helsmiths of Hashut"}).en;
  // Remplit le joueur 1 depuis une liste : faction, poses, auxiliaires, nom de partie et Battle Tactics
  function applyList(l){
    const P = G.players[0];
    P.list = l.id; P.faction = facName(l);
    P.poses = (l.regiments || []).length + (l.aux || []).length; P.aux = (l.aux || []).length > 0;
    if (!G.label) G.label = l.name || "";
    if (!G.noTac) {
      const idx = (l.tactics || []).filter(Boolean).map(n => TACTICS.findIndex(t => t.n === n)).filter(i => i >= 0).slice(0, 2);
      if (idx.length) { P.tac = [idx[0] ?? null, idx[1] ?? null]; G.tac[0] = [[null,null,null],[null,null,null]]; }
    }
  }
  function myLists(){ const s = load(LISTS, null); return s && Array.isArray(s.lists) ? s.lists : []; }
  function listSelect(){
    const L = myLists(); if (!L.length) return "";
    const v = G.players[0].list || "";
    return `<div><label class="lbl" for="ml">Ma liste WarCounter (facultatif)</label><select id="ml" data-set="list" data-p="0"><option value="">Aucune</option>${L.map(l => `<option value="${esc(l.id)}"${l.id === v ? " selected" : ""}>${esc(l.name || "Sans nom")}</option>`).join("")}</select><p class="hint" style="margin-top:6px">Remplit la faction, le nombre de poses, les auxiliaires et les 2 Battle Tactics de la liste. Choisir la faction d'une de tes listes la sélectionne aussi automatiquement.</p></div>`;
  }
  function tacSelect(p, k){
    const v = G.players[p].tac[k], o = G.players[p].tac[1-k];
    return `<div class="row"><select class="grow" id="t${p}${k}" data-set="tac" data-p="${p}" data-k="${k}"><option value="">Aucune</option>${TACTICS.map((t, i) => `<option value="${i}"${i === v ? " selected" : ""}${i === o ? " disabled" : ""}>${esc(t.n)}</option>`).join("")}</select>${v != null ? `<button class="info" type="button" data-act="tinfo" data-i="${v}" aria-label="Voir la tactique">i</button>` : ""}</div>`;
  }
  function vSetup(){
    let h = `<div class="panel"><h2 class="sec">Partie</h2><div class="body">
      <div><label class="lbl" for="bp">Battleplan</label>
        <div class="row"><select class="grow" id="bp" data-set="bp"><option value="">Choisir un battleplan</option>${BATTLEPLANS.map((b, i) => `<option value="${i}"${i === G.bp ? " selected" : ""}>${b.id} ${esc(b.n)}</option>`).join("")}</select>
        ${G.bp != null ? `<button class="info" type="button" data-act="bpinfo" aria-label="Voir le battleplan">i</button>` : ""}</div>
        <button class="btn ghost" type="button" data-act="random" style="margin-top:6px">Battleplan aléatoire</button></div>
      <div><label class="lbl" for="label">Nom de la partie (facultatif)</label><input type="text" id="label" data-set="label" value="${esc(G.label)}" placeholder="Ex. Partie avec ..."></div>
      <label class="switch"><span><b>Jouer sans tactiques</b><br><span class="hint">Pour les deux joueurs</span></span><input type="checkbox" data-set="notac"${G.noTac ? " checked" : ""}></label>
    </div></div>`;
    [0,1].forEach(p => {
      const P = G.players[p];
      h += `<div class="panel"><h2 class="sec">${p === 0 ? "Joueur" : "Adversaire"}</h2><div class="body">
        <div><label class="lbl" for="n${p}">Nom</label><input type="text" id="n${p}" data-set="name" data-p="${p}" value="${esc(P.name)}" placeholder="Joueur ${p+1}" autocomplete="off"></div>
        ${p === 0 ? listSelect() : ""}
        <div><label class="lbl" for="f${p}">Faction</label>${factionSelect(p)}</div>
        ${G.noTac ? "" : `<div><label class="lbl" for="t${p}0">Tactique de bataille 1</label>${tacSelect(p,0)}</div><div><label class="lbl" for="t${p}1">Tactique de bataille 2</label>${tacSelect(p,1)}</div>`}
        <div class="switch"><span class="lbl" style="margin:0">Nombre de poses</span><div class="stepper"><button type="button" data-act="poses" data-p="${p}" data-d="-1" aria-label="Une pose de moins">−</button><output>${P.poses}</output><button type="button" data-act="poses" data-p="${p}" data-d="1" aria-label="Une pose de plus">+</button></div></div>
        <label class="switch"><span class="lbl" style="margin:0">Unités auxiliaires</span><input type="checkbox" data-set="aux" data-p="${p}"${P.aux ? " checked" : ""}></label>
      </div></div>`;
    });
    h += `<p class="missing" id="missing" aria-live="polite"></p>`;
    return h;
  }
  function missing(){
    const m = [];
    if (G.bp == null) m.push("battleplan");
    [0,1].forEach(p => {
      const P = G.players[p], nm = (P.name || "").trim(), n = nm ? "de " + nm : (p === 0 ? "du joueur" : "de l'adversaire");
      if (!(P.name || "").trim()) m.push(p === 0 ? "nom du joueur" : "nom de l'adversaire");
      if (!P.faction) m.push("faction" + " " + n);
      if (!G.noTac) { if (P.tac[0] == null) m.push("tactique 1" + " " + n); if (P.tac[1] == null) m.push("tactique 2" + " " + n); }
      if (!(P.poses > 0)) m.push("nombre de poses" + " " + n);
    });
    return m;
  }
  function refreshSetup(){
    if (view !== "setup") return;
    const m = missing();
    $("next").disabled = m.length > 0;
    const el = $("missing"); if (el) el.textContent = m.length ? "Il manque : " + m.join(", ") + "." : "";
  }

  const pickRow = (key, val, r) => `<div class="two">${[0,1].map(p => `<button class="pick" type="button" data-act="${key}" data-p="${p}"${r != null ? ` data-r="${r}"` : ""} aria-pressed="${val === p}">${pname(p)}</button>`).join("")}</div>`;
  function vStart(){
    const b = bp();
    return `<div class="panel"><h2 class="sec">Qui est l'attaquant ?</h2><div class="body">${pickRow("attacker", G.attacker)}</div></div>
      <div class="panel"><h2 class="sec">Qui joue en premier au round 1 ?</h2><div class="body">${pickRow("first", G.rounds[0].first, 1)}</div></div>
      <div class="panel"><h2 class="sec"><span>Carte de déploiement</span><button class="info" type="button" data-act="bpinfo" aria-label="Voir le battleplan" style="color:#fff">i</button></h2><div class="body">
        <img class="map" src="${MAPS[b.id]}" alt="Carte de déploiement ${esc(b.n)}">
        ${G.attacker != null ? `<p class="hint" style="text-align:center">Territoire rouge : <b>${pname(G.attacker)}</b> · Territoire bleu : <b>${pname(other(G.attacker))}</b></p>` : ""}</div></div>`;
  }

  function vRound(r){
    const A = analysis(), R = G.rounds[r-1], b = bp();
    let h = "";
    if (r >= 2) h += `<div class="panel"><h2 class="sec">Début du round ${r}</h2><div class="body">
      <div><span class="lbl">Qui a gagné l'initiative ?</span>${pickRow("init", R.init, r)}</div>
      <div><span class="lbl">Qui joue en premier ce round ?</span>${pickRow("first", R.first, r)}</div></div></div>`;
    const notes = [];
    if (A.seize[r] != null) notes.push(`<div class="note"><b>Double tour pour ${pname(A.seize[r])}.</b> Il ne peut valider aucune tactique de bataille ce round.</div>`);
    if (A.voided[r] != null) notes.push(`<div class="note gold"><b>${pname(A.voided[r])}</b> joue deux fois de suite, mais il est mené de 11 points ou plus : ça ne compte pas comme un double tour.</div>`);
    if (r >= 2) notes.push(A.out[r] != null
      ? `<div class="note gold"><b>Outsider : ${pname(A.out[r])}</b> · 5 points de commandement.${b ? " " + esc(b.out) : ""}</div>`
      : `<div class="note gold"><b>Pas d'outsider ce round</b> : égalité au score.</div>`);
    h += notes.join("");
    const order = R.first != null ? [R.first, other(R.first)] : [0,1];
    order.forEach(p => {
      const P = G.players[p], cp = cpBase(p, r, A) + R.cpd[p];
      const locked = A.seize[r] === p;
      const tags = [];
      if (R.first === p) tags.push(`<span class="tag first">Joue en premier</span>`);
      if (G.attacker === p) tags.push(`<span class="tag">Attaquant</span>`);
      if (A.out[r] === p) tags.push(`<span class="tag out">Outsider</span>`);
      h += `<div class="panel"><h2 class="sec dark"><span>${pname(p)}</span><span>${total(p, r)} PV</span></h2><div class="body">
        ${tags.length ? `<div class="who">${tags.join("")}</div>` : ""}
        <div class="cp"><div class="row"><span class="hex${A.out[r] === p ? " plus" : ""}">${cp}</span><b>Points de commandement</b></div>
          <div class="stepper"><button type="button" data-act="cp" data-p="${p}" data-r="${r}" data-d="-1" aria-label="Retirer un point">−</button><button type="button" data-act="cp" data-p="${p}" data-r="${r}" data-d="1" aria-label="Ajouter un point">+</button></div></div>
        <div><span class="lbl">Score primaire</span><div class="chips">${b.sc.map((s, i) => avail(s, r) ? `<button class="chip" type="button" data-act="prim" data-p="${p}" data-r="${r}" data-i="${i}" aria-pressed="${!!R.prim[p][i]}">${esc(s.n)}<span class="v">${s.v}</span></button>` : "").join("")}</div></div>
        ${G.noTac ? "" : `<div><span class="lbl">Tactiques de bataille${locked ? " · bloquées (double tour)" : ""}</span>${tacTable(p, r, locked)}</div>`}
        <div class="sub"><span>Points ce round</span><b>${roundScore(p, r)} PV</b></div>
      </div></div>`;
    });
    return h;
  }
  function tacTable(p, r, locked){
    const P = G.players[p];
    const rows = [0,1].filter(k => P.tac[k] != null);
    if (!rows.length) return `<p class="hint">Aucune tactique choisie.</p>`;
    return `<table class="tt"><thead><tr><th>Tactique</th><th title="Échauffourée">É</th><th title="Frappe">F</th><th title="Domination">D</th></tr></thead><tbody>${rows.map(k => {
      const st = G.tac[p][k], t = TACTICS[P.tac[k]];
      return `<tr><td><span class="tname">${esc(t.n)}<button class="info" type="button" data-act="tinfo" data-i="${P.tac[k]}" aria-label="Voir ${esc(t.n)}">i</button></span></td>${[0,1,2].map(i => {
        const d = st[i];
        if (d != null && d !== r) return `<td><span class="box past" title="Validée au round ${d}">R${d}</span></td>`;
        if (d === r) return `<td><button class="box on" type="button" data-act="tac" data-p="${p}" data-k="${k}" data-i="${i}" data-r="${r}" aria-label="${TIERS[i]} validée, annuler"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg></button></td>`;
        const ok = canTac(p, k, i, r, locked);
        return ok ? `<td><button class="box" type="button" data-act="tac" data-p="${p}" data-k="${k}" data-i="${i}" data-r="${r}" aria-label="Valider ${TIERS[i]}"></button></td>`
                  : `<td><span class="box lock" title="Verrouillée"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span></td>`;
      }).join("")}</tr>`;
    }).join("")}</tbody></table>`;
  }
  function canTac(p, k, i, r, locked){
    if (locked) return false;
    const st = G.tac[p][k];
    if (st.some(x => x === r)) return false;
    if (i > 0 && (st[i-1] == null || st[i-1] >= r)) return false;
    return true;
  }

  function vSummary(ro){
    const a = total(0), b = total(1), done = G.status === "done";
    const st = !done ? `<span class="status">En cours</span>` : a === b ? `<span class="status">Égalité</span>` : `<span class="status win">Victoire de ${pname(a > b ? 0 : 1)}</span>`;
    let h = `<div class="panel final">${st}<div class="names"><span>${pname(0)}<br><span class="hint">${esc(G.players[0].faction || "Faction inconnue")}</span></span><span>${pname(1)}<br><span class="hint">${esc(G.players[1].faction || "Faction inconnue")}</span></span></div><div class="big">${a} - ${b}</div><span class="hint">${esc(bp().id + " " + bp().n)}${G.label ? " · " + esc(G.label) : ""}</span></div>`;
    [0,1].forEach(p => {
      const P = G.players[p];
      const line = (name, f) => `<tr><td>${esc(name)}</td>${[1,2,3,4,5].map(r => { const v = f(r); return `<td class="cell"><span>${v ? v : "-"}</span></td>`; }).join("")}<td class="tot">${[1,2,3,4,5].reduce((t, r) => t + f(r), 0)}</td></tr>`;
      h += `<div class="panel"><h2 class="sec dark"><span>${pname(p)}</span><span>${total(p)} PV</span></h2><div class="body scroll">
        <table class="rt"><thead><tr><th>Source</th><th>R1</th><th>R2</th><th>R3</th><th>R4</th><th>R5</th><th>Total</th></tr></thead><tbody>
        ${line("Objectifs primaires", r => primScore(p, r))}
        ${[0,1].filter(k => P.tac[k] != null).map(k => line(TACTICS[P.tac[k]].n, r => tacScore(p, k, r))).join("")}
        </tbody></table>
        <p class="hint" style="margin:0">${G.rounds[0].first === p ? "A commencé la partie · " : ""}${G.attacker === p ? "Attaquant · " : ""}${P.poses} pose${P.poses > 1 ? "s" : ""}${P.aux ? " · unités auxiliaires" : ""}</p></div></div>`;
    });
    h += `<div class="stack" style="gap:10px">
      ${ro ? `<button class="btn primary" type="button" data-act="home">Retour à l'accueil</button>` : done ? `<button class="btn primary" type="button" data-act="new">Nouvelle partie</button>` : `<button class="btn primary" type="button" data-act="finish">Terminer la partie</button>`}
      ${ro ? "" : `<button class="btn" type="button" data-act="home">Retour à l'accueil</button>`}
      <button class="btn" type="button" data-act="copy">Copier le résumé</button>
      ${ro ? "" : `<button class="btn ghost" type="button" data-act="del">Supprimer la partie</button>`}
      <p class="hint" id="copy-msg" style="text-align:center" aria-live="polite"></p></div>`;
    return h;
  }

  // ---------- Rendu ----------
  function render(keepScroll){
    const y = window.scrollY;
    let html = "", title = "Feuille de Bataille";
    const hv = view.startsWith("hist:"), saved = G;
    if (hv) { histG = load(HKEY, [])[+view.slice(5)]; histG = histG && histG.g; if (!histG) { view = "home"; return render(false); } G = histG; }
    if (view === "home") html = vHome();
    else if (hv) { html = vSummary(true); title = "Partie terminée"; }
    else if (view === "setup") { html = vSetup(); title = "Préparation"; }
    else if (view === "start") { html = vStart(); title = "Début de partie"; }
    else if (view === "summary") { html = vSummary(); title = "Récapitulatif"; }
    else { const r = +view.slice(1); html = vRound(r); title = "Round " + r; }
    $("view").innerHTML = html;
    $("bs-title").textContent = title;
    const inGame = view !== "home" && view !== "setup";
    $("bs-back").hidden = view === "home";
    $("bp-info").hidden = !(inGame && bp());
    $("score").hidden = !(view[0] === "r" || view === "summary" || hv);
    if (!$("score").hidden){ $("s-n0").textContent = rawName(0); $("s-n1").textContent = rawName(1); $("s-pts").textContent = total(0) + " - " + total(1); }
    const i = STEPS.indexOf(view);
    $("foot").hidden = view === "home" || view === "summary" || hv;
    $("prev").textContent = i <= 0 ? "Accueil" : "Précédent";
    $("next").textContent = view === "r5" ? "Récapitulatif" : view === "setup" ? "Suivant" : view === "start" ? "Commencer" : "Round suivant";
    $("next").disabled = (view === "setup" && missing().length > 0) || (view === "start" && (G.attacker == null || G.rounds[0].first == null));
    refreshSetup();
    if (hv) G = saved;
    else if (G && view !== "home"){ G.view = view; save(); }
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  }
  function go(v){ view = v; if (G && G.status === "setup" && v !== "setup" && v !== "home") G.status = "live"; render(false); }

  $("bs-back").addEventListener("click", () => {
    const i = STEPS.indexOf(view);
    go(i <= 0 ? "home" : STEPS[i-1]);
  });
  $("prev").addEventListener("click", () => $("bs-back").click());
  $("next").addEventListener("click", () => { const i = STEPS.indexOf(view); if (i >= 0 && i < STEPS.length - 1) go(STEPS[i+1]); });
  $("bp-info").addEventListener("click", () => bpInfo(view.startsWith("hist:") ? histG.bp : G.bp));

  // Saisies
  $("view").addEventListener("change", e => {
    const el = e.target, k = el.dataset.set; if (!k || k === "name" || k === "label") return;
    const p = +el.dataset.p;
    if (k === "bp") { G.bp = el.value === "" ? null : +el.value; G.rounds.forEach(R => R.prim = [[],[]]); }
    else if (k === "faction") {
      G.players[p].faction = el.value;
      if (p === 0) {
        // Une de mes listes WarCounter correspond à cette faction : on la reprend (liste active en priorité)
        const st = load(LISTS, null) || {}, L = myLists().filter(l => facName(l) === el.value);
        const l = L.find(x => x.id === st.active) || L[0];
        if (l) applyList(l); else G.players[0].list = "";
      }
    }
    else if (k === "list") {
      const l = myLists().find(x => x.id === el.value);
      G.players[0].list = el.value;
      if (l) applyList(l);
    }
    else if (k === "tac") { const v = el.value === "" ? null : +el.value; G.players[p].tac[+el.dataset.k] = v; G.tac[p][+el.dataset.k] = [null,null,null]; }
    else if (k === "aux") G.players[p].aux = el.checked;
    else if (k === "notac") { G.noTac = el.checked; if (G.noTac) { G.players.forEach(P => P.tac = [null,null]); G.tac = [[[null,null,null],[null,null,null]],[[null,null,null],[null,null,null]]]; } }
    save(); if (k !== "aux") render(true); else refreshSetup();
  });
  $("view").addEventListener("input", e => {
    const el = e.target, k = el.dataset.set;
    if (k === "name") { G.players[+el.dataset.p].name = el.value; save(); refreshSetup(); }
    else if (k === "label") { G.label = el.value; save(); }
  });

  // Actions
  $("app-bs").addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const a = b.dataset.act, p = +b.dataset.p, r = +b.dataset.r;
    if (a === "close") return closeModal();
    if (a === "bpinfo") return bpInfo(G.bp);
    if (a === "tinfo") return tacInfo(+b.dataset.i);
    if (a === "new") { G = newGame(); GAMES.unshift(G); save(); closeModal(); return go("setup"); }
    if (a === "del") { const g = b.dataset.id ? GAMES.find(x => x.id === b.dataset.id) : G; if (!g) return;
      return openModal("Supprimer la partie ?", withG(g, () => `<p style="margin:0">La partie entre <b>${pname(0)}</b> et <b>${pname(1)}</b> sera effacée de ce téléphone.</p>`) + `<div class="two"><button class="btn" type="button" data-act="close">Annuler</button><button class="btn primary" type="button" data-act="del-ok" data-id="${g.id}">Supprimer</button></div>`); }
    if (a === "del-ok") { GAMES = GAMES.filter(x => x.id !== b.dataset.id); store(LKEY, GAMES); if (G && G.id === b.dataset.id) G = null; closeModal(); view = "home"; return render(false); }
    if (a === "hdel") { const x = load(HKEY, [])[+b.dataset.i]; if (!x) return; return openModal("Supprimer de l'historique ?", `<p style="margin:0"><b>${esc(x.a)}</b> ${x.sa} - ${x.sb} <b>${esc(x.b)}</b> · ${esc(x.bp)} · ${esc(x.d)}</p><div class="two"><button class="btn" type="button" data-act="close">Annuler</button><button class="btn primary" type="button" data-act="hdel-ok" data-i="${b.dataset.i}">Supprimer</button></div>`); }
    if (a === "hdel-ok") { const h = load(HKEY, []); h.splice(+b.dataset.i, 1); store(HKEY, h); closeModal(); return render(true); }
    if (a === "home") { closeModal(); return go("home"); }
    if (a === "hopen") return go("hist:" + b.dataset.i);
    if (a === "resume") { const g = GAMES.find(x => x.id === b.dataset.id); if (!g) return; G = g; return go(g.view || "setup"); }
    if (a === "random") { G.bp = Math.floor(Math.random() * BATTLEPLANS.length); G.rounds.forEach(R => R.prim = [[],[]]); save(); return render(true); }
    if (a === "poses") { const P = G.players[p]; P.poses = Math.max(0, Math.min(10, (P.poses || 0) + +b.dataset.d)); save(); return render(true); }
    if (a === "attacker") { G.attacker = p; save(); return render(true); }
    if (a === "first") { G.rounds[r-1].first = p; save(); return render(true); }
    if (a === "init") { const R = G.rounds[r-1]; R.init = p; if (R.first == null) R.first = p; save(); return render(true); }
    if (a === "cp") { const R = G.rounds[r-1], A = analysis(); const cur = cpBase(p, r, A) + R.cpd[p]; if (cur + +b.dataset.d >= 0) R.cpd[p] += +b.dataset.d; save(); return render(true); }
    if (a === "prim") { const arr = G.rounds[r-1].prim[p], i = +b.dataset.i; arr[i] = !arr[i]; save(); return render(true); }
    if (a === "tac") {
      const k = +b.dataset.k, i = +b.dataset.i, st = G.tac[p][k];
      if (st[i] === r) { st[i] = null; for (let j = i+1; j < 3; j++) if (st[j] != null && st[j] >= r) st[j] = null; }
      else { const A = analysis(); if (canTac(p, k, i, r, A.seize[r] === p)) st[i] = r; }
      save(); return render(true);
    }
    if (a === "finish") return openModal("Terminer la partie ?", `<p style="margin:0">La partie passera dans les parties terminées, et son récapitulatif ne sera plus modifiable.</p><div class="two"><button class="btn" type="button" data-act="close">Annuler</button><button class="btn primary" type="button" data-act="finish-ok">Terminer</button></div>`);
    if (a === "finish-ok") {
      G.status = "done";
      const hist = load(HKEY, []);
      hist.unshift({a:rawName(0), b:rawName(1), sa:total(0), sb:total(1), bp:bp().n, d:new Date().toLocaleDateString("fr-FR"), g:JSON.parse(JSON.stringify(G))});
      store(HKEY, hist.slice(0, 50));
      GAMES = GAMES.filter(x => x.id !== G.id); store(LKEY, GAMES); G = null;
      closeModal(); return go("hist:0");
    }
    if (a === "copy") {
      const keep = G; if (view.startsWith("hist:") && histG) G = histG; const txt = summaryText(); G = keep;
      const msg = $("copy-msg");
      const fallback = () => { openModal("Résumé de la partie", `<textarea readonly style="width:100%;min-height:220px;font:14px var(--body);padding:10px;border:2px solid var(--line);border-radius:6px">${esc(txt)}</textarea><p class="hint">Sélectionne le texte pour le copier.</p>`); };
      try { navigator.clipboard.writeText(txt).then(() => { msg.textContent = "Résumé copié."; }, fallback); } catch (err) { fallback(); }
      return;
    }
  });
  function summaryText(){
    const L = [];
    L.push(`${rawName(0)} ${total(0)} - ${total(1)} ${rawName(1)}`);
    L.push(`${bp().id} ${bp().n}${G.label ? " · " + G.label : ""}`);
    [0,1].forEach(p => {
      const P = G.players[p];
      L.push("", `${rawName(p)}${P.faction ? " (" + P.faction + ")" : ""}`);
      L.push(`Objectifs primaires : ${[1,2,3,4,5].map(r => primScore(p, r)).join(" / ")}`);
      [0,1].filter(k => P.tac[k] != null).forEach(k => L.push(`${TACTICS[P.tac[k]].n} : ${[1,2,3,4,5].map(r => tacScore(p, k, r)).join(" / ")}`));
    });
    return L.join("\n");
  }

  render(false);
