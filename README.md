# WarCounter

Compagnon francophone pour Warhammer Age of Sigmar (4e édition) : création de listes, mémo d'armée, aptitudes par phase, règles et feuille de bataille.
Application web installable (PWA), hébergée sur GitHub Pages : https://elcounter.github.io/warcounter/

© 2026 elcounter

## Version

Version actuelle : **1.2.0** (MAJ 03-11-2026).
Numérotation X.Y.Z :
- X : très gros changement (décidé par elcounter uniquement)
- Y : changement moyen (nouveau paquet de factions, nouvelle fonction) ; Z repasse à 0
- Z : changement mineur (correctif, texte, réglage)

À chaque version : mettre à jour `VERSION` et `MAJ` (format JJ-MM-AAAA) en haut de `sources/wc/build.py`, changer le nom du cache `VERSION` dans `sw.js`, et fournir aussi un fichier HTML téléchargeable `WarCounter-X.Y.Z.html`.

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
  home.js, home.css      Accueil, page Installer l'app, Règles
  core/                  Règles de base FR (core.json)
  fac/                   Factions issues de BSData
    extract.py           python3 extract.py "<Faction>" <slug>  ->  <slug>_en.json
    dump.py              python3 dump.py <slug>  : liste les textes à traduire
    fr_<slug>.py         Traductions : T = {nom: (annonce_fr, effet_fr)}
    convert.py           Construit factions.json (liste des factions dans __main__)
  fac-img/               Images des factions publiées (600 px, JPEG q80)
  fac-img-next/          Images prêtes pour les factions restantes
sources/bsdata/          Copie des catalogues BSData (age-of-sigmar-4th)
```

## Ajouter une faction

1. `cd sources/wc/fac && python3 extract.py "Nom BSData" slug`
2. `python3 dump.py slug` puis écrire `fr_slug.py` (toutes les entrées).
3. Ajouter `('slug','Nom','slug')` dans la liste de `__main__` de `convert.py`, lancer `python3 convert.py` : « Traductions manquantes : [] » attendu. Corriger les timings restés en anglais via `TFIX2` dans `convert.py`.
4. Copier `fac-img-next/slug.jpg` dans `fac-img/`.
5. Dans `home.js`, ajouter `slug:"Alliance"` dans la table des alliances (Ordre, Chaos, Mort, Destruction).
6. `cd .. && python3 build.py` (génère `warcounter.html`), puis reporter le contenu dans `index.html` à la racine (garder l'en-tête PWA et l'enregistrement du service worker).

## Conventions de traduction

- Tout en français ; noms d'unités, d'armes, d'aptitudes et de factions en anglais.
- Mots-clés en majuscules françaises (HÉROS, INFANTERIE, SORCIER, PRÊTRE, MONSTRE…).
- Formules : « Choisissez comme cible… », « Jetez un dé. Sur 3+… », « dégâts mortels », « PROTECTION (5+) », « pour le restant du tour », « jusqu'au début de votre prochain tour », « Soignez (D3) », « FRAPPE EN PREMIER / EN DERNIER », « Note : » pour les Designer's Notes.
- Pas d'emoji dans l'app.

## Reste à faire

- Chaos : Hedonites of Slaanesh, Maggotkin of Nurgle
- Mort : Flesh-eater Courts, Nighthaunt, Ossiarch Bonereapers
- Destruction : Gloomspite Gitz, Ironjawz, Kruleboyz, Sons of Behemat

Images déjà prêtes dans `sources/wc/fac-img-next/`.
