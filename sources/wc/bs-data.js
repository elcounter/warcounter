  // ---------- Données de saison (GHB 2026-2027) ----------
  const FACTIONS = [
    ["Ordre", ["Cities of Sigmar","Daughters of Khaine","Fyreslayers","Idoneth Deepkin","Khazalite Holds","Kharadron Overlords","Lumineth Realm-lords","Seraphon","Stormcast Eternals","Sylvaneth"]],
    ["Chaos", ["Blades of Khorne","Disciples of Tzeentch","Hedonites of Slaanesh","Helsmiths of Hashut","Maggotkin of Nurgle","Skaven","Slaves to Darkness"]],
    ["Mort", ["Flesh-eater Courts","Nighthaunt","Ossiarch Bonereapers","Soulblight Gravelords"]],
    ["Destruction", ["Gloomspite Gitz","Ironjawz","Kruleboyz","Ogor Mawtribes","Sons of Behemat"]]
  ];

  // s = points, from/only = rounds concernés, t = texte de règle
  const P = {
    c1: {n:"Contrôle 1+", v:3, t:"Si vous contrôlez au moins 1 objectif."},
    c2: {n:"Contrôle 2+", v:3, t:"Si vous contrôlez au moins 2 objectifs."},
    more: {n:"Plus d'objectifs", v:4, t:"Si vous contrôlez plus d'objectifs que votre adversaire."}
  };
  const BATTLEPLANS = [
    {id:"1-1", n:"Into the Fire",
      out:"Les deux armées ont l'aptitude Secure the Gate. Tant que vous êtes l'outsider, votre armée a l'aptitude Determined Defenders.",
      ab:[
        {c:"passive", t:"Passif", n:"Secure the Gate", x:["Tant que vous contrôlez le Site de Pouvoir entièrement situé dans votre territoire, les armes de mêlée des unités amies ont Anti-charge (+1 Perf.) tant qu'elles contestent un objectif que vous contrôlez."]},
        {c:"passive", t:"Passif", n:"Determined Defenders", x:["Ajoutez 3 au score de contrôle des unités amies tant qu'elles sont entièrement hors du territoire ennemi."]}],
      sc:[P.c1, P.c2, P.more]},
    {id:"1-2", n:"Bloodstained Coasts",
      out:"À partir du 2e round, les deux joueurs peuvent utiliser les aptitudes Emberstone Weapons et Emberstone Cache.",
      ab:[
        {c:"fight", t:"N'importe quelle phase de mêlée", n:"Emberstone Weapons", x:["Déclaration : choisissez une unité amie qui a chargé à ce tour et qui possède un ou plusieurs éclats de braisepierre.","Effet : au choix, pour le reste du tour, +1 aux jets de touche ou +1 aux jets de blessure de ses attaques de mêlée. Puis, si vous êtes l'outsider, retirez tous les éclats de la cible. Sinon, retirez tous les éclats de toutes les unités amies."]},
        {c:"hero", t:"Une fois par tour (armée), votre phase des héros", n:"Emberstone Cache", x:["Déclaration : choisissez une unité amie qui conteste un objectif que vous contrôlez.","Effet : donnez-lui un éclat de braisepierre."]}],
      sc:[P.c1, P.c2, {n:"Plus d'objectifs (R1)", v:4, only:1, t:"Au 1er round seulement : si vous contrôlez plus d'objectifs que votre adversaire."},
          {n:"Voler un objectif", v:4, from:2, t:"À partir du 2e round : si vous contrôlez un objectif que votre adversaire contrôlait au début du tour."}]},
    {id:"1-3", n:"Avalanche of Ash",
      out:"Si vous êtes l'outsider, vous devez utiliser l'aptitude Unstable Passage.",
      ab:[
        {c:"passive", t:"Une fois par round de bataille, début du round", n:"Unstable Passage", x:["Déclaration : tous les objectifs sont les cibles. Choisissez-en 1 comme point focal.","Effet : jetez un dé par cible et ajoutez 1 par unité (amie ou ennemie) qui la conteste. Pour le point focal, vous pouvez ajouter ou soustraire 3. Sur 8+, retirez la cible du champ de bataille."]}],
      sc:[P.c1, P.c2, P.more,
          {n:"1 objectif restant", v:3, t:"S'il ne reste qu'un objectif et que vous contrôlez un élément de terrain (hors terrain de faction) en territoire ennemi."},
          {n:"Aucun objectif restant", v:7, t:"S'il ne reste aucun objectif et que vous contrôlez plus d'éléments de terrain (hors terrains de faction) que votre adversaire."}]},
    {id:"1-4", n:"Caverns of Slaughter",
      out:"Si vous êtes l'outsider, vous pouvez utiliser Shifting Passages. Les deux joueurs peuvent utiliser Navigate the Tunnels.",
      ab:[
        {c:"passive", t:"Une fois par round de bataille, début du round", n:"Shifting Passages", x:["Déclaration : choisissez 2 éléments de terrain (hors terrains de faction).","Effet : retirez tous les pions de passage secret du champ de bataille, puis donnez-en un à chaque cible."]},
        {c:"move", t:"Une fois par tour (armée), votre phase de mouvement", n:"Navigate the Tunnels", x:["Déclaration : choisissez une unité amie entièrement à 6\" d'un élément de terrain qui a un pion de passage secret.","Effet : retirez-la et replacez-la entièrement à 6\" d'un autre élément de terrain qui a un pion de passage secret, à plus de 9\" des unités ennemies."]}],
      sc:[P.c1, P.c2, {n:"Contrôler une paire", v:4, t:"Si vous contrôlez une ou plusieurs paires d'objectifs."}]},
    {id:"1-5", n:"What's Yours Is Ours",
      out:"Aux rounds impairs, la paire Lions Dorés est la paire convoitée. Aux rounds pairs, c'est la paire Soliphiles. Si vous êtes l'outsider, vous pouvez utiliser Unleash Your Fury.",
      ab:[
        {c:"passive", t:"Une fois par round de bataille, début du round", n:"Unleash Your Fury", x:["Déclaration : choisissez une paire d'objectifs.","Effet : pour le reste du round, elle devient la paire convoitée (à la place de l'autre)."]}],
      sc:[P.c1, {n:"Paire convoitée", v:3, t:"Si vous contrôlez la paire d'objectifs convoitée."}, P.more]},
    {id:"1-6", n:"Hidden Under Ash-Clouds",
      out:"Au début de chaque round, l'outsider décide si les nuages de cendres sont bas ou non. S'il n'y a pas d'outsider, ils sont bas.",
      ab:[
        {c:"passive", t:"Passif", n:"Swirling Ash Clouds", x:["Tant que les nuages de cendres sont bas :","Les unités et manifestations ne peuvent pas être placées en territoire neutre.","Elles ne peuvent pas finir un mouvement en territoire neutre, sauf si elles l'ont commencé entièrement dedans.","Les figurines et manifestations ne sont pas visibles à plus de 3\", sauf si une ligne droite entre leurs socles ne traverse pas le territoire neutre."]}],
      sc:[P.c1, P.c2, P.more]},
    {id:"2-1", n:"Warped Ruins",
      out:"Si vous êtes l'outsider, vous devez utiliser The Maleflames Spread. Précision : chaque élément de terrain (hors terrain de faction) doit être placé à 12\" d'au moins 1 autre.",
      ab:[
        {c:"passive", t:"Une fois par round de bataille, début du round", n:"The Maleflames Spread", x:["Déclaration : s'il n'y a aucun élément de terrain en feu, choisissez un élément de terrain (hors terrain de faction). Sinon, choisissez-en un qui n'est pas en feu et qui est à 12\" d'un élément en feu.","Effet : la cible est en feu pour le reste de la bataille. Puis infligez D3 dégâts mortels à chaque unité (amie et ennemie) à 6\" d'un ou plusieurs éléments en feu."]}],
      sc:[P.c1, {n:"Contrôler une paire", v:3, t:"Si vous contrôlez une ou plusieurs paires d'objectifs."}, P.more]},
    {id:"2-2", n:"Curse of the Gnaw",
      out:"Au début de la bataille, le niveau d'instabilité est 1. Chaque utilisation de l'aptitude Activer le Site de Pouvoir l'augmente de 1 (6 maximum). Après avoir déterminé qui joue en premier, l'outsider peut utiliser Echoes of the Vile-City.",
      ab:[
        {c:"passive", t:"Une fois par round de bataille, début du round", n:"Echoes of the Vile-City", x:["Déclaration : choisissez un objectif.","Effet : infligez à chaque unité (amie et ennemie) qui le conteste autant de dégâts mortels que le niveau d'instabilité, puis remettez le niveau à 1."]}],
      sc:[{n:"Lions Dorés", v:3, t:"Si vous contrôlez l'objectif Lions Dorés."}, {n:"Soliphiles", v:3, t:"Si vous contrôlez l'objectif Soliphiles."}, P.more]},
    {id:"2-3", n:"Seize the Embers",
      out:"Les deux joueurs peuvent utiliser Search the Rubble et Return to Base Camp.",
      ab:[
        {c:"end", t:"Fin de votre tour", n:"Search the Rubble", x:["Déclaration : choisissez une unité amie sans pépite de braisepierre qui conteste un objectif Soliphiles.","Effet : donnez-lui une pépite. Si vous êtes l'outsider, elle peut aussitôt se déplacer de 6\" maximum sans finir au combat. Elle ne peut pas utiliser Return to Base Camp ni Redeploy pour le reste du tour."]},
        {c:"end", t:"Une fois par tour (armée), fin de votre tour", n:"Return to Base Camp", x:["Déclaration : choisissez une unité amie qui a une pépite, n'a pas été placée à ce tour et conteste un objectif Lions Dorés.","Effet : retirez-lui sa pépite."]}],
      sc:[P.c1, {n:"Contrôle 2+ (R1)", v:3, only:1, t:"Au 1er round seulement : si vous contrôlez au moins 2 objectifs."},
          {n:"Retour au camp", v:3, from:2, t:"À partir du 2e round : si vous avez utilisé Return to Base Camp à ce tour."}, P.more]},
    {id:"2-4", n:"Treacherous Ground",
      out:"Au début de la bataille, tous les objectifs sont stables. Les deux joueurs doivent utiliser Advance Carefully. À partir du 2e round, l'outsider peut utiliser Violent Tremor.",
      ab:[
        {c:"passive", t:"Une fois par bataille (armée), début du 1er round", n:"Advance Carefully", x:["Déclaration : choisissez un objectif dans votre territoire.","Effet : il n'est plus stable."]},
        {c:"passive", t:"Une fois par round de bataille, début du round", n:"Violent Tremor", x:["Déclaration : choisissez une paire d'objectifs.","Effet : l'objectif stable de la paire ne l'est plus. À la place, l'autre devient stable."]}],
      sc:[{n:"1+ stable", v:3, t:"Si vous contrôlez au moins 1 objectif stable."}, {n:"2+ stables", v:3, t:"Si vous contrôlez au moins 2 objectifs stables."},
          {n:"Plus d'objectifs stables", v:4, t:"Si vous contrôlez plus d'objectifs stables que votre adversaire."}]},
    {id:"2-5", n:"Escape from the Coast",
      out:"Si vous êtes l'outsider, vous pouvez utiliser To the Ships!",
      ab:[
        {c:"passive", t:"Une fois par round de bataille, début du round", n:"To the Ships!", x:["Déclaration : choisissez l'objectif Heldenhain ou un objectif Soliphiles.","Effet : retirez-le du champ de bataille."]}],
      sc:[P.c1, P.c2, P.more]},
    {id:"2-6", n:"Power of the Realms",
      out:"Au début de la bataille, l'objectif Soliphiles est l'objectif primaire et les autres sont secondaires. Si vous êtes l'outsider, vous pouvez utiliser Mystic Charge.",
      ab:[
        {c:"passive", t:"Une fois par round de bataille, début du round", n:"Mystic Charge", x:["Déclaration : choisissez un Site de Pouvoir que vous contrôlez.","Effet : tracez une ligne droite du centre de l'objectif primaire jusqu'à la cible. Si elle traverse des objectifs secondaires, le premier traversé devient l'objectif primaire et tous les autres deviennent secondaires."]}],
      sc:[{n:"Objectif primaire", v:3, t:"Si vous contrôlez l'objectif primaire."}, {n:"2+ secondaires", v:3, t:"Si vous contrôlez au moins 2 objectifs secondaires."}, P.more]}
  ];

  const TIERS = ["Échauffourée", "Frappe", "Domination"];
  const TACTICS = [
    {n:"Blazing Onslaught", card:1, gen:"Au début de la bataille, après les aptitudes de la phase de déploiement mais avant de déterminer qui joue en premier, votre adversaire doit choisir 1 élément de terrain (hors TERRAIN DE FACTION) dans son territoire comme repaire. Le repaire ne peut jamais être retiré du champ de bataille.",
      t:[["Master of Arms","Si une même unité ennemie a subi au moins 1 dégât lors de 3 phases différentes à ce tour."],
         ["Break Their Defences","Si vous contrôlez le repaire ennemi."],
         ["No Survivors","Si 2 unités ennemies ou plus ont été détruites à ce tour et que vous contrôlez le repaire ennemi."]]},
    {n:"Siege of Ashes", card:2,
      t:[["Form a Wall","Si 2 unités amies ou plus sont entièrement hors de votre territoire, entièrement à 6\" de votre territoire et à 3\" les unes des autres."],
         ["Outpost Territory","Si vous contrôlez un objectif en territoire ennemi contesté par au moins 1 unité amie qui n'a pas utilisé d'aptitude de MOUVEMENT à ce tour, et par au moins 1 autre unité amie qui a chargé à ce tour."],
         ["Repel the Attackers","S'il y a 3 unités amies ou plus à 3\" du centre du champ de bataille qui ne sont pas au combat."]]},
    {n:"Flanking Firestorm", card:3,
      t:[["Ambuscade","Si 2 objectifs ou éléments de terrain (hors TERRAIN DE FACTION) ou plus que vous contrôlez sont chacun contestés par une unité amie différente, à plus de 6\" de votre territoire et non placée à ce tour."],
         ["Surround the Enemy","Si 2 unités amies ou plus non placées à ce tour sont chacune à 9\" d'un coin différent du champ de bataille et entièrement hors de votre territoire."],
         ["Claim What's Yours","S'il y a plus d'unités amies que d'unités ennemies en territoire ennemi, et au moins 1 HÉROS ami entièrement en territoire ennemi."]]},
    {n:"Smokescreen", card:4,
      t:[["Keep the Enemy Close","Si vous contrôlez un objectif contesté par au moins 1 unité ennemie."],
         ["Feign Weakness","Si plus d'unités amies que d'unités ennemies ont été détruites à ce tour."],
         ["Execute the Plan","Si vous contrôlez chaque objectif situé en territoire ennemi."]]},
    {n:"Burning for Vengeance", card:5, gen:"Au début de la bataille, après les aptitudes de la phase de déploiement mais avant de déterminer qui joue en premier, choisissez un HÉROS ennemi sur le champ de bataille ou en réserve : c'est le fugitif pour le reste de la bataille.",
      t:[["Search Every Inch","S'il y a une unité amie différente entièrement dans chaque grand quart du champ de bataille, à plus de 9\" du centre, et qu'au plus 1 de ces unités a été placée à ce tour."],
         ["Quick Pursuit","Si 3 unités amies ou plus hors combat sont à 12\" du fugitif ennemi, ou s'il n'y a plus de fugitif ennemi sur le champ de bataille."],
         ["Bring Them In","Si 3 unités amies ou plus sont au combat avec le fugitif ennemi, ou s'il n'y a plus de fugitif ennemi et que 3 unités amies ou plus contestent un même objectif entièrement hors de votre territoire."]]},
    {n:"Legend of the Parch", card:6,
      t:[["Daring Rescue","Si une unité ennemie qui était au combat au début du tour a été détruite par une attaque de mêlée d'une unité amie qui a chargé à ce tour."],
         ["Command from the Front","S'il y a au moins 2 HÉROS amis sur le champ de bataille, tous à 9\" d'une unité ennemie visible, et qu'aucun HÉROS ami n'a été tué à ce tour."],
         ["Hero of Legend","Si vous contrôlez un objectif entièrement hors de votre territoire que vous ne contrôliez pas au début du tour, et qu'un HÉROS ami le conteste."]]}
  ];
