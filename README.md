# WarCounter

Compagnon francophone pour Warhammer Age of Sigmar (4e édition) : création de listes, mémo d'armée, aptitudes par phase, règles et feuille de bataille.
Application web installable (PWA), hébergée sur GitHub Pages : https://elcounter.github.io/warcounter/

© 2026 elcounter

## Version

Version actuelle : **2.5.1** (MAJ 04-11-2026).
Numérotation X.Y.Z :
- X : très gros changement (décidé par elcounter uniquement)
- Y : changement moyen (nouveau paquet de factions, nouvelle fonction) ; Z repasse à 0
- Z : changement mineur (correctif, texte, réglage)

À chaque version : mettre à jour `VERSION` et `MAJ` (format JJ-MM-AAAA) en haut de `sources/wc/build.py`, lancer `publish.py`, fournir à elcounter le fichier `WarCounter-X.Y.Z.html` et **mettre à jour ce README** (version actuelle, historique, et toute section concernée par la modification).

## Historique

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

- Listes : création pour les 25 factions, vérification des règles de construction, copie au format texte, export/import JSON (`warcounter-listes-JJ-MM-AAAA.json`).
- Mémo et Phases : aptitudes de la liste active (ou catalogue d'une faction), recherche instantanée dans le Mémo.
- Règles : règles de base et avancées, Manuel du Général, 25 factions, recherche globale.
- Parties : feuille de bataille locale (scores, battleplans).
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
    convert.py           Construit factions.json (liste des factions dans __main__)
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
