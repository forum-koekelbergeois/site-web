# Mise en production du site

Procédure du jour où le site complet remplace la page d'attente sur www.forumkoekelbergeois.be. Elle n'est exécutée qu'une seule fois, **avec l'accord explicite d'Aymeric**.

## Ce qu'il faut savoir avant

- `main` est la branche publiée en production. Aujourd'hui, elle contient la page d'attente.
- `site-v1` contient le site complet. Chaque envoi (push) sur `site-v1` publie une version de test gratuite : https://site-v1--forum-koekelbergeois.netlify.app. Cette version n'est pas indexée par les moteurs de recherche.
- **Chaque envoi sur `main` déclenche une mise en production, qui coûte 15 crédits Netlify sur 300 par mois.** Le jour J, il ne faut donc envoyer qu'une seule fois sur `main`.
- La construction de production refuse de publier tant qu'il reste un marqueur [DONNÉE À COMPLÉTER] ou [À VÉRIFIER], un bloc provisoire ou une image manquante. Le jour J, le seul blocage restant est la date de la page Vie privée.
- Pas de pull request, ni de CLI ou d'API Netlify.

## Avant le jour J, sur la version de test

1. Le formulaire a été testé de bout en bout sur la version de test : envoi réel, arrivée dans Netlify (Forms), e-mail de notification reçu, et « Répondre » adressé à la famille.
2. Dans Netlify, la détection des formulaires est activée (réglages du site, rubrique Forms), et la notification par e-mail vers l'adresse du Forum est configurée.
3. Les points [PROPOSITION À VALIDER] de NOTES-CONTENU.md ont été tranchés.
4. Dernière relecture de la version de test sur téléphone.

## Le jour J

Toutes les commandes se lancent dans le dossier du projet (`~/Projets/site-web`).

### 1. Renseigner la date de la page Vie privée (sur `site-v1`)

Dans `src/_data/site.js`, remplacer :

```js
privacyUpdated: "",
```

par la date du jour, en toutes lettres, par exemple :

```js
privacyUpdated: "15 novembre 2026",
```

### 2. Vérifier en local que la production passe

```sh
git switch site-v1
npm ci
npm test
CONTEXT=production npx @11ty/eleventy
```

La dernière commande doit se terminer **sans** le message « Mise en ligne impossible ». S'il apparaît, corriger ce qu'il liste avant d'aller plus loin.

### 3. Enregistrer la date sur `site-v1`

```sh
git add src/_data/site.js
git commit -m "Set the privacy page update date"
git push origin site-v1
```

Cet envoi publie une dernière version de test gratuite : la regarder une fois, en particulier la page Mentions légales et vie privée.

### 4. Fusionner `site-v1` dans `main` (avec l'accord d'Aymeric)

`main` est un ancêtre de `site-v1` : la fusion est une simple avance rapide, sans conflit.

```sh
git switch main
git pull origin main
git merge --ff-only site-v1
git push origin main
git switch site-v1
```

Si `git merge --ff-only` refuse, **s'arrêter** : `main` a changé entre-temps, et il faut regarder pourquoi avant de continuer.

## Ce que Netlify fait alors

1. Il détecte l'envoi sur `main` et lance **une** construction de production (`CONTEXT=production`), ce qui coûte 15 crédits.
2. La construction exécute `npx @11ty/eleventy` avec Node 24. Elle échoue (et la page d'attente reste en ligne) s'il reste un marqueur, un bloc provisoire ou une image manquante.
3. Si elle réussit, le site remplace la page d'attente sur www.forumkoekelbergeois.be. Il est indexable : robots.txt autorise l'indexation et pointe vers le sitemap.
4. Netlify repère le formulaire « contact » dans le HTML publié.

En cas d'échec, rien n'est cassé : la page d'attente reste en ligne. Corriger sur `site-v1`, vérifier sur la version de test, puis refaire l'étape 4. Chaque nouvel envoi sur `main` coûte de nouveau 15 crédits.

## Vérifications juste après, sur www.forumkoekelbergeois.be

Sur un téléphone et sur un ordinateur, en navigation privée :

1. L'accueil s'affiche, avec le bandeau, les trois écoles, les activités et les logos.
2. Le menu mène aux quatre pages : Accueil, Écoles de devoirs, Activités, Contact.
3. La page Activités liste les ateliers à venir, et une page d'atelier affiche le numéro à appeler et le bouton « Laissez-nous un message ».
4. « Laissez-nous un message » depuis un atelier ouvre le formulaire, avec « Une activité » et le nom de l'atelier déjà remplis.
5. Le formulaire : envoyer un vrai message de test. Vérifier que la page Merci s'affiche, que le message apparaît dans Netlify (Forms) et que l'e-mail de notification arrive.
6. Le numéro 02 435 68 45 se compose quand on le touche sur téléphone, et l'adresse e-mail ouvre la messagerie.
7. La page Mentions légales et vie privée affiche la date de mise à jour, et le lien « Vie privée → » du formulaire y mène.
8. https://www.forumkoekelbergeois.be/robots.txt contient `Allow: /` et la ligne `Sitemap:`.
9. https://www.forumkoekelbergeois.be/sitemap.xml liste les pages publiques (pas Merci, pas 404, pas les brouillons).
10. Une adresse inexistante (par exemple /essai-404) affiche la page 404 du site.
11. Le code source d'une page (hors Merci et 404) ne contient pas `noindex`.
12. Le partage d'une page (par exemple dans WhatsApp) montre le titre, la description et l'image.

Si un point ne va pas, le noter. Ne rien corriger directement sur `main` : on corrige sur `site-v1`, on vérifie sur la version de test, puis on décide ensemble d'une nouvelle mise en production.
