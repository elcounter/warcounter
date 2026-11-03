  // ---------- Données ----------
  // Capacités partagées
  const RESILIENCE = {c:"defense", t:"Passif", n:"Daemonic Resilience", x:["Effet : selon les points de pouvoir démoniaque (PPD) de cette unité. 1 PPD : PROTECTION (6+). 2 PPD : PROTECTION (5+). 3 PPD : PROTECTION (4+) contre les dégâts infligés par les SORTS, PRIÈRES et aptitudes utilisés par les MANIFESTATIONS, PROTECTION (5+) sinon."]};
  const STRENGTH = {c:"passive", t:"Passif", n:"Daemonic Strength", x:["Effet : pour chaque point de pouvoir démoniaque de cette unité, +1\" au Mouvement et +1 aux Attaques de ses armes."]};
  const GONGS = {c:"hero", t:"Passif", n:"Sacred Gongs", x:["Effet : un porteur de gong (pion) par MUSICIEN. Quand l'unité utilise l'ordre Ralliement, en réaction, retirez un porteur de gong pour faire un jet de ralliement supplémentaire d'un D6."]};
  const MANGLERS = {c:"shoot", t:"Passif", n:"Manglers of Metal", x:["Effet : ajoutez 1 à la Perforation des armes de tir de cette unité pour chaque point de pouvoir démoniaque qu'elle possède."]};
  const CRUSH = {c:"charge", t:"Passif", n:"Crush the Unworthy", x:["Effet : ajoutez 1 aux jets de charge de cette unité pour chaque point de pouvoir démoniaque qu'elle possède."]};
  const DAMAGED = w => ({c:"passive", t:"Passif", n:"Battle Damaged", x:["Effet : tant que cette unité a 10 dégâts ou plus, " + w + " a 4 Attaques."]});
  const ARTILLERIST = {n:"Artillerist Weapons", range:"Mêlée", a:3, h:4, w:4, r:0, d:"1", crit:"none"};
  const BUTT = {n:"Weapon Butt", range:"Mêlée", a:1, h:4, w:4, r:0, d:"1", crit:"none"};
  const KW = "CHAOS, HELSMITHS OF HASHUT";

  const TAURUS_BASE = {
    stats:{M:'10"', S:15, C:5, Sv:"3+"},
    weapons:[
      {n:"Projection de Feu Démoniaque", range:'18"', a:3, h:4, w:4, r:1, d:"D3", crit:"2hits", extra:["Tir en mêlée"]},
      {n:"Sceptre Infernal", range:"Mêlée", a:3, h:4, w:3, r:1, d:"D3", crit:"none"},
      {n:"Cornes et Sabots", range:"Mêlée", a:6, h:4, w:2, r:2, d:"3", crit:"none", companion:true, extra:["Charge (+1 dégât)","Compagnon"]}
    ],
    kw:"HÉROS, MONSTRE, MACHINE DE GUERRE, SORCIER (1), VOL, " + KW + ", DUARDIN"
  };

  // pts = points, size = taille d'unité, lead = options de régiment, cmd = peut rejoindre comme Commandant Hashutite
  const UNITS = [
    {id:"urak-taar", en:"Urak Taar, the First Daemonsmith", hero:true, unique:true, pts:340, size:1, lead:"cmd-any",
      stats:{M:'10"', S:16, C:5, Sv:"3+"},
      weapons:[
        {n:"Ruinous Torrents", range:'18"', a:6, h:4, w:4, r:1, d:"D3", crit:"2hits", extra:["Tir en mêlée"]},
        {n:"Dumakaz", range:"Mêlée", a:4, h:4, w:3, r:1, d:"D3", crit:"none"},
        {n:"Ghorrakos's Horns and Hooves", range:"Mêlée", a:6, h:4, w:2, r:2, d:"3", crit:"none", companion:true, extra:["Charge (+1 dégât)","Compagnon"]}
      ],
      abilities:[
        DAMAGED("Ghorrakos's Horns and Hooves"),
        {c:"hero", t:"Phase des héros adverse", n:"Master of Daemonic Power", x:["Effet : retirez jusqu'à 3 points de pouvoir démoniaque au total à des unités amies entièrement à 18\" de cette unité, puis attribuez-les à une autre unité HELSMITHS OF HASHUT non HOBGROT amie entièrement à 18\"."]},
        {c:"defense", t:"Passif", n:"Peerless Among Daemonsmiths", x:["Effet : selon les points de pouvoir démoniaque. 1 PPD : PROTECTION (6+). 2 PPD : +1 aux jets de lancement et PROTECTION (5+). 3 PPD : +2 aux jets de lancement et PROTECTION (4+) contre les SORTS, PRIÈRES et aptitudes des MANIFESTATIONS, PROTECTION (5+) sinon."]},
        {c:"charge", t:"Une fois par tour (armée), n'importe quelle phase de charge", n:"Pitiless Trampling", x:["Annonce : si cette unité a chargé à cette phase, choisissez comme cible une unité ennemie à 1\" d'elle.","Effet : infligez D3 dégâts mortels à la cible. Puis jetez 2D6 : cette unité peut se déplacer d'une distance inférieure ou égale au résultat, en traversant les figurines de la cible, mais doit finir ce mouvement en mêlée.","Mot-clé : SACCAGE"]},
        {c:"hero", t:"Votre phase des héros", n:"The Curse of Stone", cast:7, x:["Annonce : choisissez un point à 9\" de cette unité, puis un second point à 9\" du premier. Chaque unité ennemie traversée par les lignes lanceur-premier point et premier-second point est une cible. Jet de lancement 2D6.","Effet : jetez un D3 par cible. Sur 2+, infligez-lui autant de dégâts mortels.","Mot-clé : SORT"]}
      ],
      kw:"SEIGNEUR DE GUERRE, UNIQUE, HÉROS, MONSTRE, MACHINE DE GUERRE, SORCIER (2), VOL, " + KW + ", DUARDIN"},

    {id:"taurus", en:"Daemonsmith on Infernal Taurus", hero:true, pts:270, size:1, lead:"cmd-01", ...TAURUS_BASE,
      abilities:[
        DAMAGED("Cornes et Sabots"),
        RESILIENCE,
        {c:"move", t:"Passif", n:"Piétinement Impie", x:["Effet : tant qu'une unité de CAVALERIE HELSMITHS OF HASHUT amie est entièrement à 12\" de cette unité :","L'unité peut utiliser une aptitude de REPLI et quand même utiliser des aptitudes de CHARGE pendant le même tour.","Aucun dégât mortel n'est infligé à l'unité amie par les aptitudes de REPLI."]},
        {c:"end", t:"Une fois par tour (armée), fin de n'importe quel tour", n:"Présence Immolante", x:["Annonce : choisissez une unité ennemie en mêlée avec cette unité.","Effet : jetez un dé. Si le résultat est supérieur à la caractéristique de Santé de la cible, 1 figurine de l'unité cible est tuée.","Mot-clé : SACCAGE"]}
      ]},

    {id:"taurus-aqshy", en:"Daemonsmith on Infernal Taurus, Fléau d'Aqshy", aqshy:true, hero:true, pts:350, size:1, lead:"cmd-01", ...TAURUS_BASE,
      abilities:[
        DAMAGED("Cornes et Sabots"),
        RESILIENCE,
        {c:"hero", t:"Une fois par tour (armée), votre phase des héros", n:"Aspiration de Magie", x:["Effet : ajoutez 1 aux jets de lancement et de dissipation pour cette unité jusqu'au début de votre prochain tour.","Vous pouvez aussi choisir un objectif ou un élément de terrain ayant un pion de désolation ami et que cette unité conteste. Si vous le faites, ajoutez 1 au niveau de puissance de cette unité pour le restant de la bataille, puis retirez ce pion de désolation du champ de bataille. Les effets se cumulent."]},
        {c:"fight", t:"Une fois par tour (armée), n'importe quelle phase de mêlée", n:"Onde de Choc Calamiteuse", x:["Annonce : choisissez comme cibles jusqu'à 3 unités ennemies en mêlée avec cette unité.","Effet : jetez un dé pour chaque cible. Si le jet est inférieur à votre niveau de fureur, pour le restant du tour : la cible ne peut pas utiliser l'aptitude « Éruption de Fureur » ; votre adversaire ne peut pas dépenser de dés de rage pour « Braver la Douleur » pour elle ; ajoutez 1 à la Perforation des armes utilisées pour les attaques qui la ciblent.","Mot-clé : SACCAGE"]}
      ]},

    {id:"war-despot", en:"War Despot", hero:true, pts:80, size:1, lead:"units", cmd:true,
      stats:{M:'4"', S:6, C:2, Sv:"3+"},
      weapons:[{n:"Daemonflame Glaive", range:"Mêlée", a:5, h:3, w:3, r:1, d:"2", crit:"mortal"}],
      abilities:[
        {c:"fight", t:"Réaction : vous avez annoncé une aptitude de CORPS À CORPS pour cette unité", n:"Fight, You Scum!", x:["Effet : choisissez une unité d'INFANTERIE HELSMITHS OF HASHUT non HÉROS amie, à portée de mêlée de cette unité et qui n'a utilisé aucune aptitude de CORPS À CORPS à ce tour. Elle peut combattre juste après cette unité ; si elle le fait, +1 aux Attaques de ses armes de mêlée pour le restant du tour."]},
        {c:"end", t:"Passif", n:"Black-hearted Conqueror", x:["Effet : ajoutez 3 au score de contrôle des unités d'INFANTERIE HELSMITHS OF HASHUT amies entièrement à 6\" de cette unité. Portée +6\" par point de pouvoir démoniaque."]}
      ],
      kw:"HÉROS, INFANTERIE, " + KW + ", DUARDIN"},

    {id:"daemonsmith", en:"Daemonsmith", hero:true, pts:80, size:1, lead:"cmd-01", cmd:true,
      stats:{M:'4"', S:6, C:2, Sv:"4+"},
      weapons:[
        {n:"Feu-Démon Lancé", range:'18"', a:3, h:4, w:4, r:1, d:"D3", crit:"2hits", extra:["Tir en mêlée"]},
        {n:"Serre de Fer-Noir", range:"Mêlée", a:3, h:3, w:4, r:1, d:"D3", crit:"none"}
      ],
      abilities:[
        {c:"hero", t:"Une fois par tour (armée), votre phase des héros", n:"Réparation Fondue", x:["Effet : choisissez une MACHINE DE GUERRE HELSMITHS OF HASHUT amie entièrement à 12\" de cette unité (portée +6\" par point de pouvoir démoniaque). Soignez (D3+X) la cible, X étant le nombre de points de pouvoir démoniaque de cette unité."]}
      ],
      kw:"HÉROS, SORCIER (1), INFANTERIE, " + KW + ", DUARDIN"},

    {id:"ashen-elder", en:"Ashen Elder", hero:true, pts:120, size:1, lead:"cmd-01", cmd:true,
      stats:{M:'4"', S:6, C:2, Sv:"4+"},
      weapons:[{n:"Marteau Noir de Hashut", range:"Mêlée", a:3, h:3, w:4, r:1, d:"D3", crit:"none"}],
      abilities:[
        {c:"end", t:"Fin de votre tour", n:"Extraire le Pouvoir", x:["Effet : si cette unité conteste un objectif, un Site de Pouvoir ou un élément de terrain ayant un pion de désolation ami, elle gagne 1 point de rituel."]},
        {c:"defense", t:"Passif", n:"Fanatisme Attisé", x:["Effet : ignorez le premier dégât alloué à chaque phase à chaque unité HELSMITHS OF HASHUT non HOBGROT amie entièrement à 6\" de cette unité. Portée +6\" par point de pouvoir démoniaque."]}
      ],
      kw:"HÉROS, PRÊTRE (1), INFANTERIE, " + KW + ", DUARDIN"},

    {id:"dominator-cannons", en:"Dominator Engine with Immolation Cannons", pts:150, size:1,
      stats:{M:'6"', S:10, C:2, Sv:"2+"},
      weapons:[
        {n:"Immolation Cannons", range:'8"', a:5, h:2, w:4, r:1, d:"D3", crit:"none", extra:["Anti-CAVALERIE (+1 Perf.)","Tir en mêlée"]},
        {n:"Horns and Pummelling Strikes", range:"Mêlée", a:3, h:4, w:3, r:1, d:"D3", crit:"none", extra:["Charge (+1 dégât)"]}
      ],
      abilities:[
        {c:"shoot", t:"Une fois par tour (armée), votre phase de tir", n:"All Must Burn!", x:["Annonce : choisissez au moins 2 unités ennemies visibles à 8\" de cette unité.","Effet : pour le restant du tour, ajoutez 2 aux Attaques des Immolation Cannons par unité choisie, mais à chaque aptitude de TIR, cette unité doit cibler chacune de ces unités avec au moins 3 de ses attaques."]},
        STRENGTH
      ],
      kw:"MACHINE DE GUERRE, " + KW + ", AUTOMATE"},

    {id:"dominator-maces", en:"Dominator Engine with Bane Maces", pts:140, size:1,
      stats:{M:'6"', S:10, C:2, Sv:"2+"},
      weapons:[{n:"Bane Maces", range:"Mêlée", a:4, h:4, w:2, r:1, d:"3", crit:"none", extra:["Charge (+1 dégât)"]}],
      abilities:[
        STRENGTH,
        {c:"fight", t:"Une fois par tour (armée), n'importe quelle phase de mêlée", n:"Machine de Domination", x:["Effet : si cette unité est en mêlée avec un ou plusieurs HÉROS ennemis, elle peut utiliser 2 aptitudes de CORPS À CORPS à cette phase. Après la première, elle a FRAPPE EN DERNIER pour le restant de la phase, et ne peut être choisie pour la seconde que si elle est encore en mêlée avec un ou plusieurs HÉROS ennemis."]}
      ],
      kw:"MACHINE DE GUERRE, " + KW + ", AUTOMATE"},

    {id:"razers-blunder", en:"Infernal Razers with Blunderbusses", pts:110, size:5,
      stats:{M:'4"', S:1, C:1, Sv:"4+"},
      weapons:[
        {n:"Grizmalok Blunderbusses", range:'18"', a:1, h:3, w:2, r:0, d:"2", crit:"none"},
        BUTT
      ],
      abilities:[
        {c:"shoot", t:"Une fois par tour (armée), votre phase de tir", n:"Hateful Hail", x:["Annonce : si cette unité a utilisé une aptitude de TIR à ce tour et que toutes ses attaques ont ciblé la même unité ennemie, celle-ci est la cible.","Effet : jetez un dé et ajoutez le nombre de figurines de la cible tuées par cette unité à ce tour. Sur 6+, la cible a FRAPPE EN DERNIER pour le restant du tour."]},
        MANGLERS
      ],
      kw:"INFANTERIE, CHAMPION, " + KW + ", DUARDIN"},

    {id:"razers-flame", en:"Infernal Razers with Flamehurlers", pts:90, size:5,
      stats:{M:'4"', S:1, C:1, Sv:"4+"},
      weapons:[
        {n:"Karagthrun Flamehurlers", range:'12"', a:3, h:2, w:4, r:0, d:"1", crit:"none", extra:["Tir en mêlée"]},
        BUTT
      ],
      abilities:[
        MANGLERS,
        {c:"shoot", t:"Une fois par tour (armée), votre phase de tir", n:"Dépouilles Calcinées", x:["Annonce : si cette unité a utilisé une aptitude de TIR à ce tour et que toutes ses attaques ont ciblé la même unité d'INFANTERIE ennemie, celle-ci est la cible.","Effet : jetez un dé. Sur 3+, diminuez le score de contrôle de la cible du résultat du dé jusqu'au début de votre prochain tour."]}
      ],
      kw:"INFANTERIE, CHAMPION, " + KW + ", DUARDIN"},

    {id:"cohort-spears", en:"Infernal Cohort with Hashutite Spears", pts:90, size:10,
      stats:{M:'4"', S:1, C:1, Sv:"3+"},
      weapons:[{n:"Hashutite Spear", range:"Mêlée", a:2, h:3, w:4, r:0, d:"1", crit:"none", extra:["Anti-CAVALERIE (+1 Perf.)","Anti-charge (+1 Perf.)"]}],
      abilities:[
        {c:"hero", t:"Votre phase des héros", n:"Conquered Lands", x:["Annonce : si cette unité conteste un objectif que vous contrôlez, choisissez une unité HELSMITHS OF HASHUT non HOBGROT amie entièrement à 12\" de cette unité.","Effet : jetez un dé. Sur 3+, donnez 1 point de pouvoir démoniaque à la cible. Un seul jet par objectif et par tour."]},
        RESILIENCE, GONGS
      ],
      kw:"INFANTERIE, CHAMPION, MUSICIEN (1/10), PORTE-ÉTENDARD (1/10), " + KW + ", DUARDIN"},

    {id:"cohort-blades", en:"Infernal Cohort with Hashutite Blades", pts:90, size:10,
      stats:{M:'4"', S:1, C:1, Sv:"3+"},
      weapons:[{n:"Hashutite Blade", range:"Mêlée", a:2, h:3, w:4, r:0, d:"1", crit:"none", extra:["Anti-INFANTERIE (+1 Perf.)"]}],
      abilities:[
        {c:"move", t:"Passif", n:"Marche Disciplinée", x:["Effet : lorsque vous faites un jet de course pour cette unité, si le résultat est 1-3, vous pouvez utiliser une valeur de 4 à la place."]},
        RESILIENCE, GONGS
      ],
      kw:"INFANTERIE, CHAMPION, MUSICIEN (1/10), " + KW + ", DUARDIN"},

    {id:"bull-centaurs", en:"Bull Centaurs", pts:190, size:3,
      stats:{M:'10"', S:4, C:1, Sv:"4+"},
      weapons:[{n:"Massues d'Airain", range:"Mêlée", a:4, h:3, w:3, r:1, d:"2", crit:"mortal", extra:["Charge (+1 dégât)"]}],
      abilities:[
        {c:"charge", t:"N'importe quelle phase de charge", n:"Charge Taurine", x:["Annonce : si cette unité a chargé à ce tour, choisissez une unité ennemie visible à 1\" d'elle.","Effet : jetez un dé par figurine de cette unité, en ajoutant ses points de pouvoir démoniaque à chaque jet. Chaque 6+ inflige 1 dégât mortel à la cible."]},
        CRUSH
      ],
      kw:"CAVALERIE, CHAMPION, " + KW + ", DUARDIN"},

    {id:"sentinels", en:"Anointed Sentinels", pts:130, size:3,
      stats:{M:'10"', S:4, C:1, Sv:"4+"},
      weapons:[{n:"Thrice-cursed Glaive", range:"Mêlée", a:3, h:3, w:3, r:1, d:"2", crit:"none", extra:["Anti-CAVALERIE (+1 Perf.)","Charge (+1 dégât)"]}],
      abilities:[
        CRUSH,
        {c:"charge", t:"Réaction : vous avez annoncé l'ordre Contre-charge pour cette unité", n:"Zealous Counter-Attack", x:["Effet : cette unité a FRAPPE EN PREMIER pour le restant du tour."]}
      ],
      kw:"CAVALERIE, CHAMPION, " + KW + ", DUARDIN"},

    {id:"sentinels-aqshy", en:"Anointed Sentinels, Fléau d'Aqshy", aqshy:true, pts:170, size:3,
      stats:{M:'10"', S:4, C:1, Sv:"4+"},
      weapons:[{n:"Thrice-cursed Glaive", range:"Mêlée", a:3, h:3, w:3, r:1, d:"2", crit:"none", extra:["Anti-CAVALERIE (+1 Perf.)","Charge (+1 dégât)"]}],
      abilities:[
        {c:"passive", t:"Passif", n:"Acolytes Zélés", x:["Effet : ajoutez 1 aux Attaques des armes de mêlée de cette unité tant qu'elle conteste un objectif que vous ne contrôlez pas.","Ajoutez 10 au score de contrôle de cette unité tant qu'elle conteste un objectif que vous contrôlez."]},
        RESILIENCE
      ],
      kw:"CAVALERIE, CHAMPION, " + KW + ", DUARDIN"},

    {id:"bombard", en:"Tormentor Bombard", pts:130, size:1,
      stats:{M:'4"', S:8, C:2, Sv:"3+"},
      weapons:[
        {n:"Torrent of Ruinous Energy", range:'30"', a:4, h:3, w:3, r:1, d:"D3", crit:"none", extra:["Anti-CAVALERIE (+1 Perf.)","Anti-INFANTERIE (+1 Perf.)"]},
        ARTILLERIST
      ],
      abilities:[
        {c:"shoot", t:"Passif", n:"Calculated Trajectory", x:["Effet : ajoutez 1 aux jets de touche des attaques de tir de cette unité qui ciblent une unité ennemie d'au moins 5 figurines située à plus de 12\"."]},
        {c:"shoot", t:"Une fois par tour (armée), votre phase de tir", n:"Ruinous Bombardment", x:["Annonce : si cette unité a utilisé une aptitude de TIR à ce tour et que toutes ses attaques ont ciblé la même unité ennemie, celle-ci est la cible. Choisissez aussi autant d'unités ennemies à 6\" d'elle que cette unité a de points de pouvoir démoniaque.","Effet : jetez un dé par cible. Sur 3+, elle ne peut plus utiliser d'ordres jusqu'au début de votre prochain tour."]}
      ],
      kw:"MACHINE DE GUERRE, " + KW},

    {id:"deathshrieker", en:"Deathshrieker Rocket Battery", pts:140, size:1,
      stats:{M:'4"', S:8, C:2, Sv:"3+"},
      weapons:[
        {n:"Hashu-Zharr Rockets", range:'24"', a:3, h:4, w:2, r:2, d:"D3+2", crit:"none", extra:["Anti-MONSTRE (+1 Perf.)","Anti-MACHINE DE GUERRE (+1 Perf.)"]},
        ARTILLERIST
      ],
      abilities:[
        {c:"shoot", t:"Une fois par tour (armée), votre phase de tir", n:"Hungering Flames", x:["Effet : pour le restant du tour, les Hashu-Zharr Rockets de cette unité ont 5 en Dégâts si la cible est un MONSTRE ou une MACHINE DE GUERRE."]},
        {c:"shoot", t:"Réaction : vous avez annoncé une aptitude de TIR pour cette unité et toutes ses attaques ont ciblé la même unité ennemie", n:"Watch Them Burn", x:["Effet : pour chaque autre unité ennemie à portée de mêlée de la cible, jetez autant de dés que cette unité a de points de pouvoir démoniaque. Chaque 3+ inflige 1 dégât mortel à l'unité concernée."]}
      ],
      kw:"MACHINE DE GUERRE, " + KW},

    {id:"hobgrotz", en:"Hobgrotz Vandalz", pts:70, size:10,
      stats:{M:'5"', S:1, C:1, Sv:"5+"},
      weapons:[{n:"Scavenged Weapons", range:"Mêlée", a:2, h:4, w:5, r:0, d:"1", crit:"none"}],
      abilities:[
        {c:"move", t:"Phase de déploiement", n:"Disposable Lackeys", x:["Effet : cette unité peut aussitôt utiliser l'aptitude Mouvement Normal comme si c'était votre phase de mouvement."]}
      ],
      kw:"INFANTERIE, CHAMPION, MUSICIEN (1/10), PORTE-ÉTENDARD (1/10), CHAOS, HELSMITHS OF HASHUT, HOBGROT"}
  ];
  UNITS.forEach(u => {
    u.war = /MACHINE DE GUERRE/.test(u.kw);
    u.wizard = /SORCIER/.test(u.kw);
    u.priest = /PRÊTRE/.test(u.kw);
    if (/PROTECTION \((\d)\+\)/.test(u.kw)) u.stats.W = RegExp.$1 + "+";
  });

  // ---------- Règles de faction ----------
  const BATTLE_TRAITS = [
    {c:"passive", t:"Une fois par tour (armée), début de votre tour", n:"Harness Daemonic Power", x:[
      "Effet : à utiliser obligatoirement au début de chacun de vos tours. Retirez tous les points de pouvoir démoniaque de chaque unité amie. Gagnez ensuite 1 point de pouvoir démoniaque par pion de désolation ami sur le champ de bataille.",
      "Puis répartissez vos points de pouvoir démoniaque entre les unités HELSMITHS OF HASHUT non HOBGROT amies, 3 points maximum par unité. Les points non attribués sont perdus.",
      "Note : les unités non HOBGROT ont des aptitudes qui se renforcent selon leurs points de pouvoir démoniaque. Utilisez des dés de couleur pour les suivre."]},
    {c:"hero", t:"Une fois par tour (armée), n'importe quelle phase des héros", cost:"1 PC", n:"Reserves of Daemonic Power", x:[
      "Annonce : choisissez une unité HELSMITHS OF HASHUT non HOBGROT amie qui n'a aucun point de pouvoir démoniaque.",
      "Effet : donnez-lui 2 points de pouvoir démoniaque."]},
    {c:"passive", t:"Une fois par tour (armée), début de n'importe quel tour", n:"Leave the Land in Ruin", x:[
      "Annonce : choisissez un élément de terrain ou un objectif sans pion de désolation ami, contesté par une unité HELSMITHS OF HASHUT amie qui n'est pas en mêlée.",
      "Effet : donnez-lui un pion de désolation."]}
  ];

  // Formations (versions octobre 2026)
  const FORMATIONS = [
    {id:"ost", en:"Ost Hashutite", ab:{c:"hero", t:"Passif", n:"Rassemblement des Légions", x:[
      "Effet : chaque fois qu'une unité HELSMITHS OF HASHUT amie qui est à portée de mêlée d'une unité d'INFANTERIE HELSMITHS OF HASHUT amie ayant au moins 1 point de pouvoir démoniaque utilise l'ordre Ralliement, vous pouvez faire 3 jets de ralliement supplémentaires d'un D6."]}},
    {id:"castigation", en:"Castigation Battery", ab:{c:"shoot", t:"Passif", n:"Experimental Munitions", x:[
      "Effet : les armes de tir des unités HELSMITHS OF HASHUT amies ont Crit (2 touches) tant qu'elles ont au moins 2 points de pouvoir démoniaque."]}},
    {id:"cornes", en:"Les Cornes du Père-Taureau", ab:{c:"move", t:"Passif", n:"Les Taureaux de la Ziggourat", x:[
      "Effet : ajoutez 1\" au Mouvement des unités HELSMITHS OF HASHUT amies pour chaque point de pouvoir démoniaque qu'elles ont."]}},
    {id:"cabale", en:"Cabale de Forgedémons", ab:{c:"hero", t:"Passif", n:"Domination Magique", x:[
      "Effet : ajoutez 1 aux jets de lancement, de récitation, de dissipation et de bannissement pour les SORCIERS et PRÊTRES HELSMITHS OF HASHUT amis tant qu'ils sont entièrement à 12\" d'un autre SORCIER ou PRÊTRE HELSMITHS OF HASHUT ami ayant au moins 1 point de pouvoir démoniaque."]}}
  ];

  const TRAITS = [
    {id:"automate", en:"Automate Servile", ab:{c:"passive", t:"Phase de déploiement", n:"Automate Servile", x:[
      "Annonce : choisissez comme cible une unité d'AUTOMATE HELSMITHS OF HASHUT amie à portée de mêlée de cette unité.",
      "Effet : pour le restant de la bataille, la cible devient le garde du corps de cette unité :",
      "Tant que cette unité est en mêlée et que son garde du corps est à sa portée de mêlée, elle a FRAPPE EN PREMIER.",
      "Si cette unité est de l'INFANTERIE, elle a une PROTECTION (5+) tant que son garde du corps est à sa portée de mêlée."]}},
    {id:"worms", en:"Fire, You Worms!", ab:{c:"charge", t:"Phase de charge adverse", n:"Fire, You Worms!", x:[
      "Annonce : choisissez une unité d'INFANTERIE HELSMITHS OF HASHUT amie qui n'est pas en mêlée et qui est entièrement à 12\" de cette unité.",
      "Effet : la cible peut immédiatement utiliser l'aptitude Tirer comme si c'était votre phase de tir. Toutes les attaques doivent cibler la même unité ennemie, qui doit avoir chargé à cette phase. Si le jet de touche non modifié d'une de ces attaques est de 1-5, l'attaque rate et la séquence d'attaque s'arrête."]}},
    {id:"eye", en:"An Eye for Weakness", ab:{c:"hero", t:"Votre phase des héros", n:"An Eye for Weakness", x:[
      "Annonce : choisissez une unité ennemie visible à 18\" de cette unité.",
      "Effet : jusqu'au début de votre prochain tour, ajoutez 1 aux jets de blessure des attaques de mêlée des unités HELSMITHS OF HASHUT amies qui ciblent cette unité ennemie."]}}
  ];

  const ARTEFACTS = [
    {id:"parchemin", en:"Parchemin de Pétrification", ab:{c:"defense", t:"Une fois par bataille, n'importe quelle phase des héros", n:"Parchemin de Pétrification", x:[
      "Annonce : choisissez une unité HELSMITHS OF HASHUT amie entièrement à 12\" de cette unité.",
      "Effet : pour le restant du tour, la cible a une PROTECTION (2+), ne peut pas utiliser d'aptitude non passive ni être choisie comme cible d'aptitude amie, et les unités ennemies peuvent l'ignorer pour les mouvements, les charges ou le placement sur le champ de bataille."]}},
    {id:"gauntlets", en:"Gauntlets of Punishment", ab:{c:"shoot", t:"Votre phase de tir", n:"Gauntlets of Punishment", x:[
      "Annonce : choisissez une unité ennemie visible à 12\" de cette unité.",
      "Effet : jetez un D3. Sur 2+, infligez autant de dégâts mortels à la cible."]}},
    {id:"creuset", en:"Creuset de Haine", ab:{c:"hero", t:"Une fois par bataille, votre phase des héros", n:"Creuset de Haine", x:[
      "Effet : donnez jusqu'à 3 points de pouvoir démoniaque à cette unité. Toutefois, vous ne pouvez plus allouer ou donner d'autre point de pouvoir démoniaque à cette unité pour le restant de la bataille."]}},
    {id:"gemme", en:"Gemme d'Utorak", aqshy:true, ab:{c:"hero", t:"Une fois par bataille, votre phase des héros", n:"Gemme d'Utorak", x:[
      "Effet : si cette unité n'est pas un SORCIER, elle a SORCIER (2) jusqu'au début de votre prochain tour.",
      "Si cette unité est un SORCIER, jusqu'au début de votre prochain tour : ajoutez 1 à son niveau de puissance, et ajoutez D3 à ses jets de lancement."]}},
    {id:"casque", en:"Casque de Dénigrement", aqshy:true, ab:{c:"fight", t:"N'importe quelle phase de mêlée", n:"Casque de Dénigrement", x:[
      "Annonce : choisissez une unité ennemie en mêlée avec cette unité.",
      "Effet : jetez autant de dés que votre niveau de fureur. Si cette unité a chargé à ce tour, ajoutez 1 à chaque jet. Pour chaque 3+, infligez 1 dégât mortel à la cible."]}},
    {id:"corne", en:"Corne du Père-Taureau", aqshy:true, ab:{c:"move", t:"Phase de déploiement", n:"Corne du Père-Taureau", x:[
      "Annonce : choisissez une unité HELSMITHS OF HASHUT amie visible. Puis vous pouvez choisir une unité de Hobgrotz Vandalz amie visible comme seconde cible.",
      "Effet : retirez les cibles du champ de bataille et replacez-les entièrement à 7\" du bord du champ de bataille et à plus de 9\" des unités ennemies."]}}
  ];

  // Procédés Maudits (Fléau d'Aqshy) : Machines de Guerre, 1 par unité, chacun une seule fois
  const PROCEDES = [
    {id:"motricite", en:"Motricité Infernale", pts:20, ab:{c:"move", t:"Passif", n:"Motricité Infernale", x:[
      "Effet : ajoutez 2\" au Mouvement de cette unité."]}},
    {id:"stabilisateurs", en:"Stabilisateurs Ruineterre", pts:10, ab:{c:"fight", t:"Passif", n:"Stabilisateurs Ruineterre", x:[
      "Effet : ajoutez 1 à la Perforation des armes de mêlée de cette unité si elle n'a pas chargé au même tour."]}},
    {id:"mepris", en:"Mépris du Père-Taureau", pts:10, ab:{c:"shoot", t:"Votre phase de tir", n:"Mépris du Père-Taureau", x:[
      "Effet : vous pouvez dépenser 1 dé de rage. Si vous le faites, appliquez l'effet ci-dessous, et si le niveau de fureur de votre adversaire est inférieur au vôtre, il doit l'augmenter de 1 (maximum 7). Sinon, jetez un dé : sur 3+, appliquez l'effet ci-dessous.",
      "Les armes de tir de cette unité ont Crit (2 touches) jusqu'au début de votre prochain tour. Si elles l'ont toutes déjà, ses attaques de tir causent des touches critiques sur des jets non modifiés de 5+ jusqu'au début de votre prochain tour à la place."]}}
  ];

  const SPELLS = [
    {c:"hero", t:"Votre phase des héros", cast:7, n:"Ashen Smog", x:[
      "Annonce : choisissez un SORCIER HELSMITHS OF HASHUT ami pour lancer ce sort, puis un élément de terrain à 18\" de lui ayant un pion de désolation. Jet de lancement 2D6.",
      "Effet : l'élément de terrain a l'aptitude Occultant (Terrain, 1.2) jusqu'au début de votre prochain tour. Puis jetez un D3 par unité ennemie qui le conteste : sur 2+, infligez-lui autant de dégâts mortels.",
      "Mot-clé : SORT"]},
    {c:"hero", t:"Votre phase des héros", cast:6, n:"Hateful Fractures", x:[
      "Annonce : choisissez un SORCIER HELSMITHS OF HASHUT ami pour lancer ce sort, puis une unité ennemie visible à 18\" de lui. Jet de lancement 2D6.",
      "Effet : divisez par deux le Mouvement de la cible jusqu'au début de votre prochain tour.",
      "Mots-clés : SORT, ILLIMITÉ"]},
    {c:"hero", t:"Votre phase des héros", cast:8, n:"Molten Metal", x:[
      "Annonce : choisissez un SORCIER HELSMITHS OF HASHUT ami pour lancer ce sort, puis une unité ennemie visible à 18\" de lui. Jet de lancement 2D6.",
      "Effet : jetez autant de dés que le jet de lancement non modifié. Chaque dé supérieur ou égal à la Sauvegarde de la cible lui inflige 1 dégât mortel.",
      "Mot-clé : SORT"]}
  ];
  const PRAYERS = [
    {c:"hero", t:"Votre phase des héros", chant:4, n:"Black Flames of Hashut", x:[
      "Annonce : choisissez un PRÊTRE HELSMITHS OF HASHUT ami pour réciter cette prière, puis une unité ennemie visible à 12\" de lui. Jet de récitation d'un D6.",
      "Effet : jetez autant de dés que la cible a de figurines. Chaque 5+ inflige 1 dégât mortel à la cible. Si le jet de récitation était de 8+, chaque 4+ inflige 1 dégât mortel à la place.",
      "Mots-clés : PRIÈRE, ILLIMITÉ"]},
    {c:"hero", t:"Votre phase des héros", chant:4, n:"Furnace Blessing", x:[
      "Annonce : choisissez un PRÊTRE HELSMITHS OF HASHUT ami pour réciter cette prière, puis une unité HELSMITHS OF HASHUT amie visible entièrement à 12\" de lui. Jet de récitation d'un D6.",
      "Effet : +1 à la Perforation des armes de mêlée de la cible pour le restant du tour. Si le jet de récitation était de 8+, ses armes de mêlée ont aussi Crit (mortel) pour le restant du tour.",
      "Mot-clé : PRIÈRE"]},
    {c:"hero", t:"Votre phase des héros", chant:5, n:"Storm of Obsidian Shards", x:[
      "Annonce : choisissez un PRÊTRE HELSMITHS OF HASHUT ami pour réciter cette prière, puis une unité ennemie visible à 18\" de lui. Jet de récitation d'un D6.",
      "Effet : infligez D3 dégâts mortels à la cible et soustrayez 3 à son score de contrôle pour le restant du tour. Si le jet de récitation était de 10+, vous pouvez choisir une seconde cible éligible.",
      "Mot-clé : PRIÈRE"]}
  ];

  // Moment d'utilisation (clé de phase) ; [] = masqué dans Phases
  const WHEN = {
    "Battle Damaged":[], "Peerless Among Daemonsmiths":[], "Daemonic Resilience":[], "Daemonic Strength":[], "Fanatisme Attisé":[],
    "Master of Daemonic Power":["hero-opp"],
    "Pitiless Trampling":["charge","charge-opp"],
    "The Curse of Stone":["hero"],
    "Piétinement Impie":["move","charge"],
    "Présence Immolante":["end","end-opp"],
    "Aspiration de Magie":["hero"],
    "Onde de Choc Calamiteuse":["fight","fight-opp"],
    "Fight, You Scum!":["fight","fight-opp"],
    "Black-hearted Conqueror":["end","end-opp"],
    "Réparation Fondue":["hero"],
    "Extraire le Pouvoir":["end"],
    "All Must Burn!":["shoot"],
    "Machine de Domination":["fight","fight-opp"],
    "Hateful Hail":["shoot"], "Manglers of Metal":["shoot"], "Dépouilles Calcinées":["shoot"],
    "Conquered Lands":["hero"], "Sacred Gongs":["hero","hero-opp"], "Marche Disciplinée":["move"],
    "Charge Taurine":["charge","charge-opp"], "Crush the Unworthy":["charge"],
    "Zealous Counter-Attack":["charge-opp"],
    "Acolytes Zélés":["fight","fight-opp","end","end-opp"],
    "Calculated Trajectory":["shoot"], "Ruinous Bombardment":["shoot"],
    "Hungering Flames":["shoot"], "Watch Them Burn":["shoot"],
    "Disposable Lackeys":["deploy"],
    "Harness Daemonic Power":["start"],
    "Reserves of Daemonic Power":["hero","hero-opp"],
    "Leave the Land in Ruin":["start","start-opp"],
    "Rassemblement des Légions":["hero","hero-opp"],
    "Experimental Munitions":["shoot"],
    "Les Taureaux de la Ziggourat":["move"],
    "Domination Magique":["hero","hero-opp"],
    "Automate Servile":["deploy","fight","fight-opp"],
    "Fire, You Worms!":["charge-opp"],
    "An Eye for Weakness":["hero"],
    "Parchemin de Pétrification":["hero","hero-opp"],
    "Gauntlets of Punishment":["shoot"],
    "Creuset de Haine":["hero"],
    "Gemme d'Utorak":["hero"],
    "Casque de Dénigrement":["fight","fight-opp"],
    "Corne du Père-Taureau":["deploy"],
    "Motricité Infernale":["move"],
    "Stabilisateurs Ruineterre":["fight","fight-opp"],
    "Mépris du Père-Taureau":["shoot"],
    "Ashen Smog":["hero"], "Hateful Fractures":["hero"], "Molten Metal":["hero"],
    "Black Flames of Hashut":["hero"], "Furnace Blessing":["hero"], "Storm of Obsidian Shards":["hero"]
  };

  // Battle Tactics 2026-27
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

  // Liste d'exemple (ta liste actuelle)
  const SEED = {id:"l1", name:"Castigation Battery", limit:2000, formation:"castigation",
    regiments:[
      {hero:{u:"urak-taar", k:"a1"}, cmd:[{u:"war-despot", k:"a2"}], units:[{u:"dominator-cannons", k:"a3"},{u:"razers-blunder", k:"a4", reinf:true}]},
      {hero:{u:"daemonsmith", k:"b1"}, cmd:[], units:[{u:"bull-centaurs", k:"b2"},{u:"dominator-cannons", k:"b3"},{u:"cohort-spears", k:"b4", reinf:true}]},
      {hero:{u:"ashen-elder", k:"c1"}, cmd:[], units:[{u:"cohort-spears", k:"c2", reinf:true},{u:"bombard", k:"c3"},{u:"bombard", k:"c4"}]}
    ],
    aux:[], tactics:["Smokescreen","Legend of the Parch"], trait:{id:"worms", on:"a2"}, artefact:{id:"gauntlets", on:"a2"}};
