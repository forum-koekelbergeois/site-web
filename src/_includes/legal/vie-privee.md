{% comment %}
Privacy part of /mentions-legales/ (heading "Vie privée" is in the page).
Subtitles use ### because they sit under that h2. The update date comes
from privacyUpdated in src/_data/site.js.
{% endcomment %}
Cette page explique comment nous utilisons les informations que vous nous confiez sur ce site.

### Qui est responsable de vos données ?

Le {{ site.legalName }}, {{ site.places.forum.address }}. E-mail : [{{ site.email.address }}](mailto:{{ site.email.address }}). Téléphone : {% phoneLink %}.

### Ce que nous recueillons

Uniquement ce que vous écrivez dans le formulaire de contact : votre nom et prénom, votre téléphone, votre e-mail si vous le donnez, l'objet de votre demande, l'activité concernée, le prénom et l'âge ou l'année scolaire de votre enfant si vous les indiquez, et votre message.

Nous ne demandons ni votre adresse ni d'information sur la santé. Merci de ne pas en écrire dans votre message.

### Pourquoi

Pour répondre à votre demande : une inscription, une question ou une proposition d'aide comme volontaire. Nous ne vous envoyons pas de publicité et nous ne vendons jamais vos données.

### Sur quelle base

Votre accord, que vous donnez en cochant la case du formulaire. Vous pouvez le retirer à tout moment.

### Qui reçoit vos informations

- Notre équipe.
- Netlify, Inc. (États-Unis), qui héberge le site et reçoit les messages du formulaire. Le transfert vers les États-Unis est encadré par le EU-US Data Privacy Framework et par des clauses contractuelles types.
- Akismet (Automattic, Inc., États-Unis), le filtre anti-spam utilisé par Netlify, qui analyse chaque message.
- Nos messageries : [{{ site.email.address }}](mailto:{{ site.email.address }}), fournie par la Commune de Koekelberg, et une boîte Gmail de l'ASBL (Google).
- WhatsApp (Meta), si nous vous répondons par ce moyen.
- Notre liste d'attente de l'école de devoirs, tenue dans un fichier sur un ordinateur du Forum.

### Combien de temps nous les gardons

| Où | Durée |
|---|---|
| Messages reçus par le site (Netlify) | Supprimés chaque mois |
| E-mails, SMS et WhatsApp | Supprimés 12 mois après notre dernier échange |
| Liste d'attente de l'école de devoirs | Tant que votre enfant y figure. Retirés quand vous renoncez, ou quand votre enfant n'a plus l'âge d'être accueilli. |
| Enfant inscrit | Les informations rejoignent son dossier d'inscription. |

### Vos droits

Vous pouvez à tout moment consulter vos données, les corriger, les faire effacer, retirer votre accord ou vous opposer à leur utilisation. Écrivez-nous à [{{ site.email.address }}](mailto:{{ site.email.address }}) ou appelez-nous au {% phoneLink %}.

Si vous estimez que vos droits ne sont pas respectés, vous pouvez porter plainte auprès de l'Autorité de protection des données (rue de la Presse 35, 1000 Bruxelles, [www.autoriteprotectiondonnees.be](https://www.autoriteprotectiondonnees.be)).

### Cookies et statistiques

Ce site n'utilise aucun cookie et ne mesure pas sa fréquentation. Comme tout hébergeur, Netlify enregistre l'adresse IP des visiteurs pour faire fonctionner et protéger le site. Les liens « Voir sur la carte » ouvrent le site OpenStreetMap, qui applique sa propre politique.

*Dernière mise à jour : {{ site.privacyUpdated | default: "[DONNÉE À COMPLÉTER]" }}*
