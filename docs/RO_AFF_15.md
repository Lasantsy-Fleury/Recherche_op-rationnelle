# RO_AFF_15.pdf

## Exposé du problème

Soient n ouvriers x₁, x₂, . . ., xₙ et n postes de travail y₁, y₂, ..., yₙ. A toute affectation (xᵢ, yⱼ) est attaché une valeur Cᵢⱼ ≥ 0 i, j = 1, 2, ... , n.

Le problème d'affectation consiste à affecter les n ouvriers aux n postes de travail de manière que tous les ouvriers aient chacun un poste et un seul, ceci de telle sorte que la valeur totale des affectations soit optimale (minimale s'il s'agit de coûts, de dépenses …, maximale s'il s'agit de gains, de notations, de profits …).

## L'algorithme hongrois

L'algorithme de résolution du problème d'affectation est découvert par deux Hongrois (EVERVARY et KONIG). L'algorithme est composé de quatre étapes :

### ETAPE 1 : Obtention des zéros par rangée

On retranche de chacun des éléments de chaque rangée son plus petit élément.

---

## Algorithme et application

### Tableau initial

|   | a | b | c | d | e | f |
|---|---|---|---|---|---|---|
| A | 14 | 6 | 18 | 16 | 63 | 15 |
| B | 41 | 78 | 44 | 73 | 70 | 25 |
| C | 44 | 81 | 36 | 80 | 80 | 78 |
| D | 46 | 74 | 5 | 25 | 83 | 3 |
| E | 72 | 32 | 55 | 51 | 3 | 81 |
| F | 69 | 76 | 12 | 99 | 83 | 80 |

Minima par ligne : 14, 6, 5, 16, 3, 3

### Après étape 1 (soustraction du minimum par ligne)

|   | a | b | c | d | e | f |
|---|---|---|---|---|---|---|
| A | 0 | 0 | 13 | 0 | 60 | 12 |
| B | 27 | 72 | 39 | 57 | 67 | 22 |
| C | 30 | 75 | 31 | 64 | 77 | 75 |
| D | 32 | 68 | 0 | 9 | 80 | 0 |
| E | 58 | 26 | 50 | 35 | 0 | 78 |
| F | 55 | 70 | 7 | 83 | 80 | 77 |

### Après étape 1 suite (soustraction du minimum par colonne)

Minima par colonne : 0, 0, 0, 0, 0, 0

|   | a | b | c | d | e | f |
|---|---|---|---|---|---|---|
| A | 0 | 0 | 13 | 0 | 60 | 12 |
| B | 27 | 72 | 39 | 57 | 67 | 22 |
| C | 30 | 75 | 31 | 64 | 77 | 75 |
| D | 32 | 68 | 0 | 9 | 80 | 0 |
| E | 58 | 26 | 50 | 35 | 0 | 78 |
| F | 55 | 70 | 7 | 83 | 80 | 77 |

### Après transformation complémentaire

|   | a | b | c | d | e | f |
|---|---|---|---|---|---|---|
| A | 0 | 0 | 13 | 0 | 60 | 12 |
| B | 5 | 50 | 17 | 35 | 45 | 0 |
| C | 0 | 45 | 1 | 34 | 47 | 45 |
| D | 32 | 68 | 0 | 9 | 80 | 0 |
| E | 58 | 26 | 50 | 35 | 0 | 78 |
| F | 48 | 63 | 0 | 76 | 73 | 70 |

Si l'on pouvait, dans ce tableau, choisir un zéro par ligne et par colonne, tel qu'à chacun de l'ensemble {A,B,C,D,E,F} correspond un élément de l'ensemble {a,b,c,d,e,f}, le problème serait résolu par un couplage saturant et l'on aurait atteint le coût minimal.

Avant de passer à l'étape suivante, nous pouvons constater que le coût ne sera plus inférieur à 106 (B = 14 + 6 + 5 + 16 + 3 + 3 + 22 + 30 + 7)

---

### ETAPE 2 : Détermination d'un couplage optimal

On cherche à former une solution de valeur zéro. Il suffit de chercher à affecter le maximum d'arcs du coût nul du dernier tableau par les étapes suivantes :

a - A chaque étape, choisir la ligne qui contient le moins de zéros libres ;

b - Encadrer le premier zéro de la ligne retenue et barrer ceux qui ne peuvent plus représenter une affectation

c - Revenir à a - jusqu'à ce que tous les zéros soient encadrés ou barrés.

### Tableau pour l'étape 2

|   | a | b | c | d | e | f |
|---|---|---|---|---|---|---|
| A | 0 | 0 | 13 | 0 | 60 | 12 |
| B | 5 | 50 | 17 | 35 | 45 | 0 |
| C | 0 | 45 | 1 | 34 | 47 | 45 |
| D | 32 | 68 | 0 | 9 | 80 | 0 |
| E | 58 | 26 | 50 | 35 | 0 | 78 |
| F | 48 | 63 | 0 | 76 | 73 | 70 |

---

### ETAPE 3 : Recherche d'un support minimal

(ensemble de lignes et colonnes contenant tous les zéro)

Le support minimal peut être obtenu à partir de ce tableau ci-dessus, en utilisant la procédure suivante :

a. Marquer toute ligne n'ayant pas de zéro encadré ;
b. Marquer toute colonne ayant un zéro barré sur une ligne marquée ;
c. Marquer toute ligne ayant un zéro encadré dans une colonne marquée ;
Revenir à b - et s'arrêter lorsqu'aucun autre marquage n'est possible ;

### Résultat du marquage

|   | a | b | c | d | e | f |   |
|---|---|---|---|---|---|---|---|
| A | 0 | 0 | 13 | 0 | 60 | 12 |   |
| B | 5 | 50 | 17 | 35 | 45 | 0 | + |
| C | 0 | 45 | 1 | 34 | 47 | 45 |   |
| D | 32 | 68 | 0 | 9 | 80 | 0 | + |
| E | 58 | 26 | 50 | 35 | 0 | 78 |   |
| F | 48 | 63 | 0 | 76 | 73 | 70 | + |
|   | + |   | + |   |   | + |   |

On obtient le support minimal en rayant les lignes non marquées et les colonnes marquées.

Ces rangées rayées contenant tous les zéros du tableau forment le support minimal. C'est l'ensemble {A, C, E} ∪ {c, f}.

---

### ETAPE 4 : Déplacement éventuel de certains zéro

Repérons le plus petit nombre du tableau restant (cases non rayées) ; retranchons-le de tous les éléments non rayés et ajoutons-le aux éléments rayés deux fois.

Le plus petit nombre est 5.

Et le minorant du coût d'affectation devient B = 106 + 5 = 111.

### Après déplacement

|   | a | b | c | d | e | f |
|---|---|---|---|---|---|---|
| A | 0 | 0 | 18 | 0 | 60 | 17 |
| B | 0 | 45 | 17 | 30 | 40 | 0 |
| C | 0 | 45 | 6 | 34 | 47 | 50 |
| D | 27 | 63 | 0 | 4 | 75 | 0 |
| E | 58 | 26 | 55 | 35 | 0 | 83 |
| F | 43 | 58 | 0 | 71 | 68 | 70 |

### Marquage pour itération suivante

|   | a | b | c | d | e | f |   |
|---|---|---|---|---|---|---|---|
| A | 0 | 0 | 18 | 0 | 60 | 17 |   |
| B | 0 | 45 | 17 | 30 | 40 | 0 | + |
| C | 0 | 45 | 6 | 34 | 47 | 50 | + |
| D | 27 | 63 | 0 | 4 | 75 | 0 | + |
| E | 58 | 26 | 55 | 35 | 0 | 83 |   |
| F | 43 | 58 | 0 | 71 | 68 | 70 | + |
|   | + | + | + | + |   | + |   |

### Après nouvelle transformation

|   | a | b | c | d | e | f |
|---|---|---|---|---|---|---|
| A | 4 | 0 | 22 | 0 | 60 | 21 |
| B | 0 | 41 | 17 | 26 | 36 | 0 |
| C | 0 | 41 | 6 | 30 | 43 | 50 |
| D | 27 | 59 | 0 | 0 | 71 | 0 |
| E | 62 | 26 | 59 | 35 | 0 | 87 |
| F | 43 | 54 | 0 | 67 | 64 | 70 |

---

### Résultat

Sur ce tableau, il est possible d'affecter un zéro par ligne et par colonne à un coût minimal B, dont B = 111 + 4 = 115.

### Affectation optimale

|   | a | b | c | d | e | f |
|---|---|---|---|---|---|---|
| A | 4 | 0 | 22 | 0 | 60 | 21 |
| B | 0 | 41 | 17 | 26 | 36 | 0 |
| C | 0 | 41 | 6 | 30 | 43 | 50 |
| D | 27 | 59 | 0 | 0 | 71 | 0 |
| E | 62 | 26 | 59 | 35 | 0 | 87 |
| F | 43 | 54 | 0 | 67 | 64 | 70 |

Solution trouvée :
- A → b
- B → f
- C → a
- D → d
- E → e
- F → c

Vérification :
La somme des valeurs des arêtes dans ce graphe d'affectation doit correspondre au coût minimal B trouvé précédemment.

---

## Affectation de valeur maximale

### Exemple

Soient A, B, C, D, E, F jeunes techniciens qui ont différentes aptitudes à entreprendre aux a, b, c, d, e, f différents travaux. Ces aptitudes sont notées sur 100 et regroupées dans le tableau suivant :

|   | a | b | c | d | e | f |
|---|---|---|---|---|---|---|
| A | 86 | 94 | 82 | 84 | 37 | 85 |
| B | 59 | 22 | 56 | 27 | 30 | 75 |
| C | 56 | 19 | 64 | 20 | 20 | 22 |
| D | 54 | 26 | 95 | 75 | 17 | 97 |
| E | 28 | 68 | 45 | 49 | 97 | 19 |
| F | 31 | 24 | 88 | 1 | 17 | 20 |

### Complément à 100

|   | a | b | c | d | e | f |
|---|---|---|---|---|---|---|
| A | 14 | 6 | 18 | 16 | 63 | 15 |
| B | 41 | 78 | 44 | 73 | 70 | 25 |
| C | 44 | 81 | 36 | 80 | 80 | 78 |
| D | 46 | 74 | 5 | 25 | 83 | 3 |
| E | 72 | 32 | 55 | 51 | 3 | 81 |
| F | 69 | 76 | 12 | 99 | 83 | 80 |

### Après résolution (tableau final)

|   | a | b | c | d | e | f |
|---|---|---|---|---|---|---|
| A | 4 | 0 | 22 | 0 | 60 | 21 |
| B | 0 | 41 | 17 | 26 | 36 | 0 |
| C | 0 | 41 | 6 | 30 | 43 | 50 |
| D | 27 | 59 | 0 | 0 | 71 | 0 |
| E | 62 | 26 | 59 | 35 | 0 | 87 |
| F | 43 | 54 | 0 | 67 | 64 | 70 |

### Affectation optimale pour la maximisation

- A → b = 94
- B → f = 75
- C → a = 56
- D → d = 75
- E → e = 97
- F → c = 88
- **Total = 485**

(Complément à 600 de 115)