# Fiche activité : correspondance avec l'annexe A

Une activité = un fichier Markdown dans `src/activites/`. Les champs sont dans l'en-tête du fichier (le « front matter », entre les deux lignes `---`), avec des clés en anglais. La description complète est le texte sous l'en-tête.

Ce document sert de référence pour configurer l'interface d'édition `/admin` (tâche 7.3). Le contrat lui-même (l'annexe A) ne change pas sans l'accord d'Aymeric. La définition technique se trouve dans `lib/activity-schema.js`.

## Correspondance des champs

| N° | Champ (annexe A) | Clé | Obligatoire | Saisie |
|---|---|---|---|---|
| 1 | Titre | `title` | Oui | Texte, 60 caractères au plus |
| 2 | Type | `type` | Oui | Liste : `Atelier`, `Sortie`, `Rencontre`, `Cours` |
| 3 | Pour qui | `audience` | Oui | Texte court |
| 4 | Date de début | `startDate` | Oui | Date `AAAA-MM-JJ` |
| 5 | Date de fin | `endDate` | Non (une seule date si vide) | Date `AAAA-MM-JJ`, pas avant la date de début |
| 6 | Dates et horaires en détail | `schedule` | Oui | Texte |
| 7 | Lieu | `venue` | Oui | Liste : `Forum Koekelbergeois (rue Herkoliers 17)`, `Jourdan Village (rue François Delcoigne 39)`, `Autre` |
| 8 | Adresse, si « Autre » | `venueAddress` | Oui si `venue` vaut `Autre` | Texte |
| 9 | Prix | `free` **ou** `price` | Oui : l'un des deux, pas les deux | `free: true` (case « Gratuit ») ou `price` (montant en texte) |
| 10 | Nombre de places | `places` | Non | Nombre entier |
| 11 | Statut | `status` | Oui, `Ouvert` par défaut | Liste : `Ouvert`, `Complet avec liste d'attente`, `Clôturé`. Ignoré si l'inscription est `Entrée libre` |
| 12 | Inscription | `registration` | Oui, `Téléphone ou message` par défaut | Liste : `Téléphone ou message`, `Chez un partenaire`, `Entrée libre` |
| 13a | Nom du partenaire d'inscription | `registrationPartnerName` | Oui si `registration` vaut `Chez un partenaire` | Texte, par exemple `Le Troisième Œil` |
| 13b | Coordonnées du partenaire | `registrationPartnerContact` | Oui si `registration` vaut `Chez un partenaire` | Texte, par exemple `02 427 75 42 ou info@3oeil.be` (téléphones et e-mails deviennent cliquables) |
| 14 | Date limite d'inscription | `registrationDeadline` | Non | Date `AAAA-MM-JJ` |
| 15 | Description courte | `summary` | Oui | Texte, 155 caractères au plus |
| 16 | Description complète | *(texte sous l'en-tête)* | Non | Texte simple (gras et listes permis) |
| 17 | Organisé avec | `organizedWith` | Non | Texte, affiché « Organisé avec [partenaire] » |
| 18 | Photo | `photo` | Non (si vide : image par défaut du type, voir plus bas) | Chemin de l'image WebP, par exemple `/assets/images/ia4.webp` |
| 19 | Texte alternatif de la photo | `photoAlt` | Oui si `photo` est rempli | Texte |
| 20 | Avec le soutien de | `funders` | Non | Choix multiple : `COCOF`, `Fédération Wallonie-Bruxelles`, `urban.brussels (CQD)`, `perspective.brussels`, `Commune de Koekelberg` |
| — | *(technique)* Brouillon | `draft` | Non | `true` : visible en local, exclue en production |

Les valeurs par défaut (`status`, `registration`) sont appliquées par `src/activites/activites.11tydata.js` quand la clé est absente.

## Exemple

```markdown
---
title: "L'IA et les devoirs de mes enfants"
type: Atelier
audience: Parents
startDate: 2026-11-06
schedule: "Le vendredi 6 novembre 2026, de 9h à 12h"
venue: "Forum Koekelbergeois (rue Herkoliers 17)"
free: true
places: 12
summary: "Découvrez comment l'intelligence artificielle peut vous aider à accompagner les devoirs de vos enfants. Un atelier pratique d'une matinée."
funders:
  - "urban.brussels (CQD)"
  - "Commune de Koekelberg"
---
À apporter : votre smartphone.
```

Pour une inscription chez un partenaire :

```yaml
registration: "Chez un partenaire"
registrationPartnerName: "Le Troisième Œil"
registrationPartnerContact: "02 427 75 42 ou info@3oeil.be"
```

Dans ce cas, la page n'affiche ni le numéro du Forum ni le bouton « Laissez-nous un message » : seules les coordonnées du partenaire.

## Adresse de la page

L'adresse d'une fiche est formée de sa date de début (champ 4) et du nom du fichier sans date : `/activites/AAAA-MM-JJ-nom/`. Une activité qui revient chaque mois sous le même titre (la marche « Sport avec les mamans ») a ainsi une page par date, par exemple `/activites/2026-12-01-sport-avec-les-mamans/`. Tant que la date n'est pas remplie, l'adresse locale commence par `date-a-completer-`.

## Images par défaut des types

Sans photo (champ 18), la page affiche l'image par défaut du type, qui sert aussi d'image de partage : Atelier IA5, Sortie IA6, Rencontre IA7, Cours IA8 (voir `src/_data/images.js`).

## Contrôle à la construction

À chaque construction du site, chaque fiche est vérifiée. Si une fiche ne respecte pas le contrat, la construction s'arrête et affiche un message qui nomme le fichier et chaque champ en cause, par exemple :

```
La fiche activité « src/activites/2026-11-06-ia-devoirs.md » n'est pas valide :
  - Champ 1 « Titre » : 61 caractères, alors que 60 au maximum sont permis. Retirez 1 caractère.
  - Champ 3 « Pour qui » : ce champ est obligatoire et il est vide.
```

Les marqueurs `[DONNÉE À COMPLÉTER]` et `[À VÉRIFIER]` sont acceptés en local, et refusés en production (variable `CONTEXT=production`) dans toute fiche qui n'est pas un brouillon.

## Statut affiché

Calculé par `lib/activity-status.js` pour la date du jour à Bruxelles :

- l'activité est **passée** le lendemain de sa date de fin (ou de sa date de début si la fin est vide) ;
- le **statut effectif** est « Entrée libre » si l'inscription l'est, « Clôturé » le lendemain de la date limite d'inscription, sinon le statut de la fiche ;
- l'étiquette de carte et le texte de l'annexe A2 en découlent ;
- le numéro du Forum et le bouton « Laissez-nous un message » s'affichent seulement pour une inscription « Téléphone ou message » au statut effectif « Ouvert » ou « Complet avec liste d'attente ».
