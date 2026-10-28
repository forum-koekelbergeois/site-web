# Site web du Forum Koekelbergeois ASBL

Ce dépôt contient le site web du Forum Koekelbergeois (www.forumkoekelbergeois.be). C'est un site statique généré avec [Eleventy](https://www.11ty.dev/) et destiné à être hébergé sur Netlify. Pour l'instant, il ne contient qu'une page d'attente.

## Lancer le site en local

Il faut Node.js 24 (voir `.nvmrc`).

```sh
npm ci
npx @11ty/eleventy --serve
```

Ouvrez ensuite l'adresse affichée dans le terminal (en général http://localhost:8080).

## Organisation

- `src/` : les sources du site (pages, styles, images). Le site généré est écrit dans `_site/`, qui n'est pas versionné.
- `src/assets-source/` : le logo d'origine. Ce dossier n'est pas publié.
- `scripts/process_logo.py` : un script Python (Pillow, NumPy, SciPy) qui produit le logo détouré et les icônes à partir du logo d'origine. Il n'est pas nécessaire pour construire le site.

## À faire

- Récupérer le logo en version vectorielle (SVG ou PDF) pour améliorer le favicon et l'image de partage, qui sont aujourd'hui produits à partir d'une image de faible résolution.

## Règle de travail

On développe sur une branche. Seul le contenu validé est fusionné dans `main`.
