# WarCounter : notes de développement

Historique des versions et guide technique (sortis du README public).

Compagnon francophone pour Warhammer Age of Sigmar (4e édition) : création de listes, mémo d'armée, aptitudes par phase, règles et feuille de bataille.
Application web installable (PWA), hébergée sur GitHub Pages : https://elcounter.github.io/warcounter/

© 2026 elcounter

## Version

Version actuelle : **2.13.2** (MAJ 04-11-2026).
Numérotation X.Y.Z :
- X : très gros changement (décidé par elcounter uniquement)
- Y : changement moyen (nouveau paquet de factions, nouvelle fonction) ; Z repasse à 0
- Z : changement mineur (correctif, texte, réglage)

À chaque version : mettre à jour `VERSION` et `MAJ` (format JJ-MM-AAAA) en haut de `sources/wc/build.py`, lancer `publish.py`, fournir à elcounter le fichier `WarCounter-X.Y.Z.html` et **mettre à jour ces notes** (version actuelle, historique, et toute section concernée).

## Historique

- 2.13.2 (04-11-2026) : pied de page « © 2026 elcounter. Tous droits réservés. » (au lieu de « Propriété intellectuelle © 2026 elcounter ») ; fichier `LICENSE` (tous droits réservés) à la racine du dépôt.
- 2.13.1 (04-11-2026) : unités à 0 pt prises avec leur héros désormais extraites (`extract.py` : entrées liées sans coût, hors jetons sans Contrôle) : The Shadow Queen (Daughters of Khaine), Toll's Companions (Cities of Sigmar), The Oathsworn Kin et Singri Brand (Slaves to Darkness), Neave's Companions et Lorai (Stormcast Eternals). Signalé par un utilisateur.
- 2.13.0 (04-11-2026) : import d'une liste en texte (écran Listes, panneau « Importer une liste » : champ à coller + bouton « Importer ma liste »). `parseList` dans `army-app.js` lit le format d'export (WarCounter ou app officielle) : nom et points, faction, formation ou armée de renom, domaines, Battle Tactic Cards, régiments, puces General / Reinforced / améliorations, régiment de renom, auxiliaires, terrain de faction. Les lignes non reconnues sont signalées sous le panneau.
- 2.12.0 (04-11-2026) : export liste par liste en texte à copier-coller (bouton « Exporter la liste (copier le texte) » de l'éditeur), au format des apps d'armée : nom et points, faction, formation ou armée de renom, Manuel du Général, poses (Drops), domaines, Battle Tactic Cards, régiments (General's Regiment, Regiment 1…) avec puces General, Reinforced et améliorations, régiment de renom, auxiliaires, terrain de faction, pied « Créée avec WarCounter ». Suppression de l'export/import JSON de toutes les listes. `window.WC_VERSION` injecté par `build.py`.
- 2.11.0 (04-11-2026) : armées de renom, paquet Chaos (16 : Blades of Khorne, Disciples of Tzeentch, Maggotkin of Nurgle, Hedonites of Slaanesh, Helsmiths of Hashut, Skaven, Slaves to Darkness). Éditeur de liste : menu « Armée de renom » sous la faction (traits de bataille, améliorations et domaines propres, unités autorisées et points de l'AoR, pas de formation ; les unités non autorisées sont retirées) ; régiments de renom limités à ceux autorisés pour l'AoR ; Mémo et Phases suivent l'AoR ; Règles : rubrique « Armées de renom » dans chaque faction, warscrolls propres en `#regle-u-ar~<id>`, recherche. Sources : `fac/aor.py` -> `aor_en.json` (les 60 AoR), `aor_dump.py "Faction1,Faction2"` liste les textes à traduire, traductions `fr_aor_<paquet>.py`, paquets déclarés dans `AOR_PACKS` de `convert.py` (réutilise les traductions de faction quand le texte anglais est identique), sortie `aor.json` -> `window.WC_AOR`. Restent les paquets Destruction, Ordre et Mort.
- 2.10.0 (04-11-2026) : régiments de renom (76, Manuel du Général 2025-26 dans BSData). Éditeur de liste : section « Régiment de renom » (0-1, filtrée par faction, compte comme un régiment et une pose, points ajoutés) ; Mémo et Phases : aptitudes et unités du régiment ; Règles : page « Régiments de renom » (Manuel du Général), rubrique dans chaque faction, 9 warscrolls propres (Gotrek, Mask of the Deceiver, Cogforts…) en `#regle-u-rr~<id>`, recherche. Sources : `fac/ror.py` -> `ror_en.json`, traductions `fr_ror.py` (clés `Régiment::Aptitude` ou `Unité::Aptitude` en cas d'homonymes), `convert.py` écrit `ror.json`, injecté par `build.py` dans `window.WC_ROR`. Les armées de renom viendront dans une prochaine version.
- 2.9.0 (04-11-2026) : Parties, les 2 Battle Tactics du joueur 1 se remplissent automatiquement depuis sa liste WarCounter : au choix de la liste, ou au choix d'une faction qui correspond à une de ses listes (liste active en priorité). Rien n'est rempli en mode « Jouer sans tactiques ».
- 2.8.1 (04-11-2026) : page Soutenir sans adresse e-mail : bouton vers le lien de paiement PayPal (`PAYPAL_URL` dans `home.js`) et QR code (`sources/wc/paypal-qr.png`, injecté par `build.py`).
- 2.8.0 (04-11-2026) : page « Soutenir le projet » (`#soutenir`, sans onglet), accessible par le petit bouton « Si tu veux soutenir notre travail » en pied de page. Don facultatif via PayPal (lien de paiement et QR code, conseil « Entre proches »).
- 2.7.0 (04-11-2026) : manifestations génériques (Aetherwrought Machineries, Forbidden Power, Krondspine Incarnate, Morbid Conjuration, Primal Energy, Twilit Sorceries). Nouvelle section « Manifestations » dans l'éditeur de liste, sous les régiments : domaine de la faction ou domaine générique. Sources : `fac/universal.py` (extraction depuis `Lores.cat`) -> `universal_en.json`, traductions `fr_universal.py`, `convert.py` écrit `universal.json`, injecté par `build.py` dans `window.WC_UMANIF`.
- 2.6.1 (04-11-2026) : le terrain de faction a sa propre section « Terrain de faction » dans l'éditeur de liste, sous les régiments (avant les auxiliaires), avec la mention « gratuit » ou « +X pts ».
- 2.6.0 (04-11-2026) : terrains de faction pour les 23 factions qui en ont un dans BSData (Sons of Behemat et Helsmiths of Hashut n'en ont pas). `extract.py` garde désormais les entrées FACTION TERRAIN sans points (marquées `terrain` dans `factions.json`) ; 49 aptitudes traduites (bloc « # Terrain de faction » en fin des fichiers `fr_*.py`). Liste : menu « Terrain de faction » (0-1, hors régiments, points ajoutés au total), affiché dans le Mémo, les Phases et le texte partagé ; Règles : rubrique « Terrain de faction » dans les warscrolls.
- 2.5.1 (04-11-2026) : un nouvel utilisateur démarre sans aucune liste (la liste d'exemple Hashut n'est plus créée) ; menus « Sélectionner une faction » sans faction présélectionnée (création de liste et catalogue du Mémo), bouton Créer actif seulement une fois la faction choisie.
- 2.5.0 (04-11-2026) : statistiques de visites avec GoatCounter (sans cookies), tableau de bord https://elcount3r.goatcounter.com ; chaque changement d'onglet est compté (identifiants de listes anonymisés en `#liste`).
- 2.4.0 (04-11-2026) : partage d'une liste en texte (bouton « Copier la liste en texte » dans l'éditeur) ; export et import des listes en fichier JSON (écran Listes) ; barre de recherche dans le Mémo (unités, aptitudes, mots-clés) et dans Règles (pages, sections, factions, unités, aptitudes) ; pied de page « Propriété intellectuelle © 2026 elcounter » et mention légale « non officielle, non affiliée à Games Workshop » en très petit (variable `LEGAL` de `build.py`).
- 2.3.1 (04-11-2026) : onglet Règles, les lignes des règles de base, avancées et du Manuel du Général sont en rouge (liseré doré) pour les distinguer des factions, comme dans le Mémo.
- 2.3.0 (04-11-2026) : suppression des images de factions ; l'onglet Règles affiche les factions en lignes cliquables (nom + nombre d'unités). L'app ne contient plus aucune image Games Workshop, hors cartes des battleplans (onglet Parties).
- 2.2.0 (04-11-2026) : plus aucune image dans le Mémo (Règles de l'armée, Sorts, Prières, Battle Tactics, unités) ; les tuiles carrées deviennent des lignes cliquables (cartes compactes). Seules restent les images des factions dans l'onglet Règles (Hashut compris, `fac-img/hashut.jpg`). Objectif : limiter les risques de droits d'auteur en vue d'une diffusion grand public.
- 2.1.1 (04-11-2026) : suppression de toutes les images d'unités (Hashut et Ogor Mawtribes) dans le Mémo et les fiches. On garde les images des factions (onglet Règles, tuile Règles de l'armée) et des tuiles Sorts, Prières et Battle Tactics. Choix définitif : pas d'images d'unités.
- 2.1.0 (04-11-2026) : Images d'unités pour Ogor Mawtribes.
- 2.0.0 (03-11-2026) : Sons of Behemat. Toutes les factions principales sont maintenant disponibles.
- 1.9.0 (03-11-2026) : Kruleboyz.
- 1.8.0 (03-11-2026) : Ironjawz.
- 1.7.0 (03-11-2026) : Gloomspite Gitz.
- 1.6.0 (03-11-2026) : Ossiarch Bonereapers.
- 1.5.0 (03-11-2026) : Nighthaunt.
- 1.4.0 (03-11-2026) : Flesh-eater Courts.
- 1.3.1 (03-11-2026) : Hedonites of Slaanesh + correction placement Maggotkin of Nurgle (Chaos) + suppression catégorie Autres.
- 1.3.0 (03-11-2026) : Maggotkin of Nurgle.
- 1.2.1 (03-11-2026) : sur ordinateur, flèche « APP » et étapes d'installation mobiles masquées ; page Installer l'app réduite à la phrase et au bouton.
- 1.2.0 (03-11-2026) : Blades of Khorne, Disciples of Tzeentch.
- 1.1.0 (03-11-2026) : Kharadron Overlords, Seraphon, Sylvaneth.
- 1.0.0 (03-11-2026) : numéro de version et date de MAJ en pied de page ; 16 factions dont Daughters of Khaine, Fyreslayers, Idoneth Deepkin.

## Fonctionnalités

- Listes : création pour les 25 factions, terrain de faction (0-1), domaine de manifestations (faction ou générique), vérification des règles de construction, export de chaque liste en texte à copier-coller (format des apps d'armée) et import au même format.
- Mémo et Phases : aptitudes de la liste active (ou catalogue d'une faction), recherche instantanée dans le Mémo.
- Règles : règles de base et avancées, Manuel du Général, 25 factions, recherche globale.
- Parties : feuille de bataille locale (scores, battleplans) ; le joueur 1 peut reprendre une de ses listes (faction, poses, auxiliaires et Battle Tactics remplis automatiquement).
- Soutenir : page de don facultatif (PayPal), lien en pied de page.
- Statistiques : GoatCounter, scripts placés dans l'en-tête de `index.html` (avant `<title>`), conservés automatiquement par `publish.py`. Absents du fichier HTML téléchargeable.
- Pas de mode sombre ni de calculateur de dégâts (choix d'elcounter pour l'instant).

## Structure du dépôt

```
index.html               App publiée (générée, ne pas éditer à la main)
manifest.webmanifest     Manifeste PWA
sw.js                    Service worker (réseau d'abord, cache hors ligne)
*-w.png                  Icônes « W »
sources/wc/              Atelier de fabrication
  build.py               Assemble warcounter.html (CSS scopés, 4 scripts, images en base64)
  army-data.js           Données Hashut (Méga Forge) + Battle Tactics
  army-app.js            Listes, Mémo, Phases (toutes factions)
  bs-app.js, bs-data.js  Feuille de bataille (Parties)
  home.js, home.css      Accueil, page Installer l'app (étapes mobiles masquées sur ordinateur), Règles
  core/                  Règles de base FR (core.json)
  fac/                   Factions issues de BSData
    extract.py           python3 extract.py "<Faction>" <slug>  ->  <slug>_en.json
    dump.py              python3 dump.py <slug>  : liste les textes à traduire
    fr_<slug>.py         Traductions : T = {nom: (annonce_fr, effet_fr)}
    convert.py           Construit factions.json (liste des factions dans __main__), universal.json et ror.json
    aor.py, aor_dump.py  Armées de renom -> aor_en.json ; traductions fr_aor_<paquet>.py
    ror.py               Régiments de renom (gst + Regiments of Renown.cat) -> ror_en.json ; traductions fr_ror.py
sources/bsdata/          Copie des catalogues BSData (age-of-sigmar-4th)
```

## Ajouter une faction

1. `cd sources/wc/fac && python3 extract.py "Nom BSData" slug`
2. `python3 dump.py slug` puis écrire `fr_slug.py` (toutes les entrées).
3. Ajouter `('slug','Nom','slug')` dans la liste de `__main__` de `convert.py`, lancer `python3 convert.py` : « Traductions manquantes : [] » attendu. Corriger les timings restés en anglais via `TFIX2` dans `convert.py`.
4. Dans `home.js`, ajouter `slug:"Alliance"` dans la table des alliances (Ordre, Chaos, Mort, Destruction).
5. Publier : voir « Construire et publier ».

## Construire et publier

Tous les chemins sont relatifs au dépôt (Python 3 sans dépendance ; Node seulement pour vérifier).

1. Mettre à jour `VERSION` et `MAJ` en haut de `sources/wc/build.py`.
2. `python3 sources/wc/publish.py` : construit l'app, remplace le contenu de `index.html` (en-tête PWA et enregistrement du service worker conservés), met à jour le cache dans `sw.js` et crée `sources/wc/build-check/WarCounter-X.Y.Z.html` (non versionné, à envoyer à elcounter).
3. Vérifier : `for n in army bs home top; do node --check sources/wc/build-check/wc-$n.js; done`, puis ouvrir `index.html` et contrôler l'accueil, Règles, une faction, Listes, Mémo, Phases et le pied de page.
4. Commit explicite, `git tag vX.Y.Z`, `git push --follow-tags`.

`sources/wc/shells/` contient les feuilles de base des anciennes apps (Méga Forge, Feuille de Bataille), nécessaires au build.

## Conventions de traduction

- Tout en français ; noms d'unités, d'armes, d'aptitudes et de factions en anglais.
- Mots-clés en majuscules françaises (HÉROS, INFANTERIE, SORCIER, PRÊTRE, MONSTRE…).
- Formules : « Choisissez comme cible… », « Jetez un dé. Sur 3+… », « dégâts mortels », « PROTECTION (5+) », « pour le restant du tour », « jusqu'au début de votre prochain tour », « Soignez (D3) », « FRAPPE EN PREMIER / EN DERNIER », « Note : » pour les Designer's Notes.
- Pas d'emoji dans l'app.
- Aucune image d'unité, de faction ni de groupe (choix définitif d'elcounter, pour les droits d'auteur et une diffusion grand public).

## Reste à faire

Toutes les factions principales sont intégrées.
