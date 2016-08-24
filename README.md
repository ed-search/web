# web

## Introduction

Le site internet avec le moteur de recherche en full Javascript.

Le dépôt est organisé avec les dossiers suivants :

* `src` : les sources (JS, CSS, HTML, fichiers statiques)
* `tools` : les tâches gulp
* `dist` (non commité) : le dossier dans lequel le site est construit et servi en mode développement.

La branche `gh-pages` permet d'utiliser github comme web serveur pour le site.

Le site propose un moteur de recherche style Google qui intéragit avec un webworker intégrant un index [lunr](http://lunrjs.com/). Le site transmet les mots recherchés au webworker qui renvoit les résultats pour affichage. La base de données est disponible dans le dépôt [ed-database](http://lunrjs.com/).

*Note : à chaque chargement de la page, la base de données est téléchargée et chargée.*

*Note 2 : le site est déployé automatiquement sur github pages à chaque commit dans la branche master*


## Utilisation

Installez les dépendances :

```
npm install
```

Et exécuter une des commandes suivantes :

* `gulp build` : construit le site et le web worker dans le dossier `dist`
* `gulp serve` : `build` et démarre un serveur web depuis le dossier `dist`
* `gulp serve.watch` : `build`, `serve` et initie le livereload

Toutes les commandes supportent l'argument :

* `database` (optionnel, par défaut sert la branche `data` de [ed-database](https://github.com/ed-search/database/tree/data)): pour indiquer la source de la base de données des articles (couverture de magazine et textes)

Exemples :

```
gulp serve.watch --database='http://localhost:8000'
```
