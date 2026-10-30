# Site web du Forum Koekelbergeois ASBL

Ce dépôt contient le site web du Forum Koekelbergeois (www.forumkoekelbergeois.be). C'est un site statique généré avec [Eleventy](https://www.11ty.dev/) et destiné à être hébergé sur Netlify. La page d'attente est en ligne (branche `main`) ; le site complet est en cours de construction sur la branche `site-v1`.

## Lancer le site en local

Il faut Node.js 24 (voir `.nvmrc`).

```sh
npm ci
npm test
npx @11ty/eleventy --serve
```

Ouvrez ensuite l'adresse affichée dans le terminal (en général http://localhost:8080).

Pour simuler la construction de production (brouillons exclus, marqueurs bloquants) :

```sh
CONTEXT=production npx @11ty/eleventy
```

## Organisation

- `src/` : les sources du site (pages, styles, images). Le site généré est écrit dans `_site/`, qui n'est pas versionné.
- `src/_data/site.js` : les données communes (coordonnées, lieux, écoles de devoirs, tarif, financeurs).
- `src/_data/images.js` : les emplacements d'images (codes IA et R de l'annexe E), avec leur texte alternatif et le fichier attendu dans `src/assets/images/`. Tant qu'un fichier manque, une image provisoire s'affiche en local et la construction de production échoue. Les images sont traitées hors du dépôt (redressement, sRGB, floutage validé par Aymeric, WebP sans métadonnées) : aucun original n'entre dans le dépôt.
- `src/pages/` : les pages du site. La partie Vie privée est dans `src/_includes/legal/vie-privee.md`.
- `src/activites/` : une fiche activité par fichier (voir `docs/fiche-activite.md`) ; chaque fiche produit une page `/activites/<nom-du-fichier>/`.
- `lib/` : le contrôle des fiches, le calcul des statuts, la typographie et les marqueurs.
- `test/` : les tests (`npm test`).
- `src/assets-source/` : le logo d'origine. Ce dossier n'est pas publié.
- `scripts/process_logos.py` : convertit les logos des financeurs (sources hors du dépôt, dans `~/Projets/assets-source/logos/`) en WebP pour `src/assets/logos/`.
- `scripts/process_logo.py` : un script Python (Pillow, NumPy, SciPy) qui produit le logo détouré et les icônes à partir du logo d'origine. Il n'est pas nécessaire pour construire le site.

## À faire

- Récupérer le logo en version vectorielle (SVG ou PDF) pour améliorer le favicon et l'image de partage, qui sont aujourd'hui produits à partir d'une image de faible résolution.

## Règle de travail

On développe sur une branche. Seul le contenu validé est fusionné dans `main`.
