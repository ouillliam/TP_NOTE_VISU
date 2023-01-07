# DATA 732 - TP 1

Pour lancer le serveur

```shell
npm install
npm start
```

# Visualisations

## Favorite Genre

Visualisation de la répartitions des gens favoris

## Age group Repartition

Visualisation de la répartition des tranches d'âge. Avec un pie chart on voit bien que les 0-19 et 20-29 sont sur-représentés comparé aux autres classes .

## Favorite Genre vs Age

Utilisation d'un stacked bar chart pour visualiser la répartition des genres favoris par tranche d'âge. Le but était de voir quelle tranche d'âge préféraient tel ou tel genre. On peut se rendre compte que ainsi que le gospel par exemple est le genre favori en majorité des +60. On observe encore que les jeunes sont sur-représentés.

## Hours per day vs Mental health effects

Le but ici était, avec un stacked bar chart, d'observer si le nombre d'heures d'écoute avait un impact sur les effets de la musique sur la santé  mentale, par exemple + d'heure = meilleur impact.

## Music effects vs Is instrumentalist

Ici le but était de voir avec un stacked bar chart si jouer d'un instrument améliorait les effets de la musique.

## Mental Health distributions

Visualisation de la distributions des notes pour chaque problème mental.

## BPM by Mental Health

Le but ici était de savoir si le BPM du genre favori avait un lien avec la santé mentale de la personne, par exemple si une personne plus anxieuse écoutait de la musique plus calme. J'ai choisi un boxplot pour bien visualiser les variations du BPM pour une note. Ainsi on peut voir que le BPM médian reste constant par exemple.

## Instrumentalist and Composer Sunburst

Le but de ce diagramme est de voir si le fait d'être compositeur dépend du fait de jouer un instrument. J'ai voulu essayer una utre type de diagramme.

## Conclusion

Malheuresement a cause de la ssous représentation des autres tranches d'âge et des distributions de problèmes mentaux inégales, c'est dur de tirer des conclusions des graphiques.

Je n'ai pas beaucoup apprécié dc.js pour la visualisation, ça donne vraiment l'impression que c'est se tirer une balle dans le pied d'utiliser autre chose que Tableau ou python pour faire ce genre de visu, en plus pas très pratique de manipuler des données en JS.