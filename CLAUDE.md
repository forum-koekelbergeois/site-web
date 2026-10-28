# Règles du projet site-web (Forum Koekelbergeois ASBL)

## Branches et déploiement
- On travaille sur une branche. Jamais de commit, merge ou push sur main sans l'accord explicite d'Aymeric.
- Ne crée pas de pull request et n'utilise ni la CLI ni l'API Netlify : une mise en production coûte 15 crédits sur 300 par mois.
- Prévisualisation uniquement en local (`npx @11ty/eleventy --serve`).

## Sources
- Le contenu du site vient de ~/Projets/contenu-site.md (hors du dépôt). Ce fichier ne doit JAMAIS être copié, cité en bloc ni commité dans le dépôt : il contient des annexes internes (D, G).
- Les textes sont repris mot pour mot. Seules exceptions : les règles typographiques ci-dessous. Si un texte pose problème (trop long, ambigu, incohérent), ne le réécris pas : ajoute-le à NOTES-CONTENU.md (non commité, voir .gitignore) et signale-le.
- L'annexe A (fiche activité, 20 champs) est un contrat : ne la modifie jamais sans l'accord d'Aymeric.

## Dépôt public
- Aucun secret, jeton ou mot de passe. Aucune donnée personnelle de famille, aucun nom d'enfant, aucun numéro personnel (aucun numéro en 04xx), aucun montant de budget, aucune note interne.
- Photos : aucun visage d'enfant, WebP sans métadonnées.

## Contraintes techniques
- Eleventy (version épinglée), Node 24, aucune dépendance inutile ; toute nouvelle dépendance est justifiée dans le compte rendu.
- Aucun cookie, aucune statistique, aucune ressource externe (pas de CDN, pas de police web) : polices système uniquement.
- Politique de sécurité : script-src 'self' seulement, aucun script ni style en ligne, aucun attribut d'événement (onclick…).
- Thème clair uniquement (color-scheme: light).
- Accessibilité : un seul h1 par page, hiérarchie de titres correcte, contraste d'au moins 4,5:1 pour le texte, focus visible, lien d'évitement, zones cliquables d'au moins 44 × 44 px, textes alternatifs, lang="nl" sur tout texte néerlandais.
- Mobile d'abord (360 px sans défilement horizontal), pages légères, images en WebP.
- Référencement : titre, description, URL canonique et balises Open Graph sur chaque page ; sitemap.xml et robots.txt ; pages Merci et 404 en noindex et hors du sitemap.
- Couleur de marque #3FB580 : réservée aux éléments décoratifs (contraste 2,6:1 sur blanc). Texte et liens dans les teintes déjà validées pour la page d'attente.

## Typographie française (appliquée automatiquement à la construction)
- Apostrophe typographique ’ à la place de '.
- Espace fine insécable (U+202F) avant ; ? ! ; espace insécable (U+00A0) avant : et à l'intérieur des guillemets « ».
- Ne jamais toucher : les attributs HTML, les URL, les adresses e-mail, les heures (8h30), le code, et tout texte en lang="nl".
- Ne jamais écrire « EDD » : toujours « école de devoirs ».

## Marqueurs
- [DONNÉE À COMPLÉTER] et [À VÉRIFIER] : visibles en prévisualisation, signalés par un bandeau ; la construction en production (variable CONTEXT=production, fournie par Netlify) échoue s'il en reste un.
- [À VENIR] : emplacement avec une image provisoire neutre, autorisé en production.
- [PROPOSITION À VALIDER] : intégré, et listé dans le compte rendu.

## Méthode
- Une étape à la fois ; si un choix n'est pas couvert, arrête-toi et pose la question.
- Code, noms de fichiers et commentaires en anglais ; contenu en français.
- Chaque mission se termine par un compte rendu : ce qui est fait, les écarts, les points à transmettre.
