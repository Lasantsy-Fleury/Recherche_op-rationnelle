/**
 * Detailed step-by-step solver for the Hungarian (Kuhn-Munkres) Algorithm.
 * Matches presentation step logic exactly.
 */

import { SolverStep, SolverMode } from '../types';

// Generate default labels
export function getDefaultLabels(size: number) {
  const rows: string[] = [];
  const cols: string[] = [];
  for (let i = 0; i < size; i++) {
    rows.push(String.fromCharCode(65 + i)); // A, B, C...
    cols.push(String.fromCharCode(97 + i)); // a, b, c...
  }
  return { rows, cols };
}

/**
 * Solve assignment using Hungarian algorithm and capture detailed step-by-step history.
 */
export function solveHungarian(
  costMatrix: number[][],
  mode: SolverMode = 'min',
  customLabels?: { rows: string[]; cols: string[] },
  customComplement?: number
): SolverStep[] {
  const steps: SolverStep[] = [];
  const N = costMatrix.length;
  if (N === 0) return [];

  const labels = customLabels || getDefaultLabels(N);
  
  // Clone original grid
  let currentGrid = costMatrix.map(row => [...row]);
  let stepCounter = 1;

  steps.push({
    id: stepCounter++,
    title: "Matrice d'Origine",
    description: `Saisie de la matrice de coûts initiale (${N}x${N}). Mode: ${mode === 'min' ? 'Minimisation (Coûts)' : 'Maximisation (Gains)'}.`,
    matrix: currentGrid.map(row => [...row]),
    matrixLabels: { ...labels },
    totalCostBound: 0
  });

  // If Maximization, perform Complement
  if (mode === 'max') {
    let maxVal = customComplement ?? -Infinity;
    if (maxVal === -Infinity) {
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (currentGrid[r][c] > maxVal) {
            maxVal = currentGrid[r][c];
          }
        }
      }
      // Round maxVal to next multiple of 10 or 100 for clean slides
      maxVal = Math.max(10, Math.ceil(maxVal / 10) * 10);
    }

    const complementedGrid = currentGrid.map(row => row.map(val => maxVal - val));
    steps.push({
      id: stepCounter++,
      title: `Complément à ${maxVal} (Maximisation)`,
      description: `Pour maximiser les gains, on construit la matrice de coût d'opportunité en soustrayant chaque élément de ${maxVal}.`,
      matrix: complementedGrid.map(row => [...row]),
      matrixLabels: { ...labels }
    });
    currentGrid = complementedGrid;
  }

  // --- ÉTAPE 1 : Réduction des Colonnes (Obtention des zéros par colonne) ---
  // Note: Slide deck does column reduction first!
  const colMins = Array(N).fill(Infinity);
  for (let c = 0; c < N; c++) {
    for (let r = 0; r < N; r++) {
      if (currentGrid[r][c] < colMins[c]) {
        colMins[c] = currentGrid[r][c];
      }
    }
  }

  steps.push({
    id: stepCounter++,
    title: "Étape 1 : Recherche des minimums de colonnes",
    description: "On repère la plus petite valeur de chaque colonne pour préparer la première réduction.",
    matrix: currentGrid.map(row => [...row]),
    matrixLabels: { ...labels },
    columnMinimums: [...colMins]
  });

  const columnReducedGrid = currentGrid.map((row, r) => 
    row.map((val, c) => val - colMins[c])
  );

  let runCost = colMins.reduce((a, b) => a + b, 0);

  steps.push({
    id: stepCounter++,
    title: "Étape 1 : Réduction des colonnes",
    description: "On retranche de chaque élément de chaque colonne son minimum. Des zéros apparaissent dans toutes les colonnes.",
    matrix: columnReducedGrid.map(row => [...row]),
    matrixLabels: { ...labels },
    columnMinimums: [...colMins],
    totalCostBound: runCost
  });
  currentGrid = columnReducedGrid;

  // --- ÉTAPE 1 BIS : Réduction des Lignes (Obtention des zéros par ligne) ---
  const rowMins = Array(N).fill(Infinity);
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (currentGrid[r][c] < rowMins[r]) {
        rowMins[r] = currentGrid[r][c];
      }
    }
  }

  steps.push({
    id: stepCounter++,
    title: "Étape 1 bis : Recherche des minimums de lignes",
    description: "On repère la plus petite valeur de chaque ligne sur la matrice déjà réduite par colonnes.",
    matrix: currentGrid.map(row => [...row]),
    matrixLabels: { ...labels },
    rowMinimums: [...rowMins],
    columnMinimums: [...colMins],
    totalCostBound: runCost
  });

  const rowReducedGrid = currentGrid.map((row, r) => 
    row.map((val, c) => val - rowMins[r])
  );
  runCost += rowMins.reduce((a, b) => a + b, 0);

  steps.push({
    id: stepCounter++,
    title: "Étape 1 bis : Réduction des lignes",
    description: "On retranche de chaque élément de chaque ligne son minimum. Le coût d'affectation minorant de départ est maintenant visible.",
    matrix: rowReducedGrid.map(row => [...row]),
    matrixLabels: { ...labels },
    rowMinimums: [...rowMins],
    columnMinimums: [...colMins],
    totalCostBound: runCost
  });
  currentGrid = rowReducedGrid;

  // Outer loop for steps 2 to 4
  let isOptimal = false;
  let optimalAssignment: { [row: string]: string } = {};
  let optimalValue = 0;
  let iterations = 0;
  const jarLimit = 100; // avoid infinite loops

  while (!isOptimal && iterations < jarLimit) {
    iterations++;

    // --- ÉTAPE 2 : Détermination d'un couplage optimal ---
    // Greedy matching of zeros according to slide rules:
    // a - Choose row with least free zeros
    // b - Star (encadrer) first free zero on that row and prime (barrer) all other zeros in same row/col
    // c - Repeat until all zeros are starred or primed.
    const starred: boolean[][] = Array(N).fill(null).map(() => Array(N).fill(false));
    const primed: boolean[][] = Array(N).fill(null).map(() => Array(N).fill(false));
    
    let stateChanged = true;
    while (stateChanged) {
      stateChanged = false;
      
      // Count free zeros (neither starred nor primed) in each row
      let minZerosCount = Infinity;
      let minRowIdx = -1;

      for (let r = 0; r < N; r++) {
        let count = 0;
        for (let c = 0; c < N; c++) {
          if (currentGrid[r][c] === 0 && !starred[r][c] && !primed[r][c]) {
            count++;
          }
        }
        if (count > 0 && count < minZerosCount) {
          minZerosCount = count;
          minRowIdx = r;
        }
      }

      if (minRowIdx !== -1) {
        // Find the first free zero in this row
        let minColIdx = -1;
        for (let c = 0; c < N; c++) {
          if (currentGrid[minRowIdx][c] === 0 && !starred[minRowIdx][c] && !primed[minRowIdx][c]) {
            minColIdx = c;
            break;
          }
        }

        if (minColIdx !== -1) {
          starred[minRowIdx][minColIdx] = true;
          stateChanged = true;

          // Prime (barrer) all other free zeros in same row and column
          for (let c = 0; c < N; c++) {
            if (c !== minColIdx && currentGrid[minRowIdx][c] === 0 && !starred[minRowIdx][c]) {
              primed[minRowIdx][c] = true;
            }
          }
          for (let r = 0; r < N; r++) {
            if (r !== minRowIdx && currentGrid[r][minColIdx] === 0 && !starred[r][minColIdx]) {
              primed[r][minColIdx] = true;
            }
          }
        }
      }
    }

    const starredList: [number, number][] = [];
    const crossedList: [number, number][] = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (starred[r][c]) starredList.push([r, c]);
        if (primed[r][c]) crossedList.push([r, c]);
      }
    }

    steps.push({
      id: stepCounter++,
      title: `Étape 2 : Couplage des zéros (Iteration ${iterations})`,
      description: "On tente de former une solution optimale en encadrant un zéro par ligne et par colonne. Les zéros incompatibles sont barrés.",
      matrix: currentGrid.map(row => [...row]),
      matrixLabels: { ...labels },
      starredZeros: [...starredList],
      crossedZeros: [...crossedList],
      totalCostBound: runCost
    });

    if (starredList.length === N) {
      // Optimal assignment found!
      isOptimal = true;
      optimalAssignment = {};
      optimalValue = 0;
      for (const [r, c] of starredList) {
        const rowLabel = labels.rows[r];
        const colLabel = labels.cols[c];
        optimalAssignment[rowLabel] = colLabel;
        optimalValue += costMatrix[r][c];
      }

      steps.push({
        id: stepCounter++,
        title: "Couplage optimal atteint !",
        description: `Nous avons trouvé ${N} zéros indépendants. Tous les postes sont affectés de manière optimale.`,
        matrix: currentGrid.map(row => [...row]),
        matrixLabels: { ...labels },
        starredZeros: [...starredList],
        crossedZeros: [...crossedList],
        totalCostBound: runCost,
        isOptimal: true,
        optimalAssignment,
        optimalValue
      });
      break;
    }

    // --- ÉTAPE 3 : Recherche du support minimal (Marquage de König-Egerváry) ---
    const markedRows = Array(N).fill(false);
    const markedCols = Array(N).fill(false);

    // a. Marquer toute ligne n’ayant pas de zéro encadré
    for (let r = 0; r < N; r++) {
      const hasStarred = starredList.some(([starredRow]) => starredRow === r);
      if (!hasStarred) {
        markedRows[r] = true;
      }
    }

    steps.push({
      id: stepCounter++,
      title: "Étape 3 : Marquage des lignes incomplètes",
      description: "On marque (+) d'abord les lignes n'ayant aucun zéro encadré.",
      matrix: currentGrid.map(row => [...row]),
      matrixLabels: { ...labels },
      starredZeros: [...starredList],
      crossedZeros: [...crossedList],
      markedRows: [...markedRows],
      markedCols: [...markedCols],
      totalCostBound: runCost
    });

    // Loop to mark columns and rows as long as we make changes
    let markingChanged = true;
    while (markingChanged) {
      markingChanged = false;

      // b. Marquer toute colonne ayant un zéro barré (ou n'importe quel zéro non encadré) sur une ligne marquée
      for (let r = 0; r < N; r++) {
        if (markedRows[r]) {
          for (let c = 0; c < N; c++) {
            // Check if there is any zero at (r, c) that is NOT starred
            if (currentGrid[r][c] === 0 && !starred[r][c] && !markedCols[c]) {
              markedCols[c] = true;
              markingChanged = true;
            }
          }
        }
      }

      // c. Marquer toute ligne ayant un zéro encadré dans une colonne marquée
      for (let c = 0; c < N; c++) {
        if (markedCols[c]) {
          for (let r = 0; r < N; r++) {
            if (starred[r][c] && !markedRows[r]) {
              markedRows[r] = true;
              markingChanged = true;
            }
          }
        }
      }
    }

    steps.push({
      id: stepCounter++,
      title: "Étape 3 : propagation du marquage",
      description: "On propage le marquage (+) aux colonnes comportant des zéros sur des lignes marquées, puis aux lignes comportant des zéros encadrés sur des colonnes marquées.",
      matrix: currentGrid.map(row => [...row]),
      matrixLabels: { ...labels },
      starredZeros: [...starredList],
      crossedZeros: [...crossedList],
      markedRows: [...markedRows],
      markedCols: [...markedCols],
      totalCostBound: runCost
    });

    // Support lines are non-marked rows and marked columns
    // Count uncovered element min
    let uncoveredMin = Infinity;
    const highlightUncovered: [number, number][] = [];
    
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const isCovered = !markedRows[r] || markedCols[c];
        if (!isCovered) {
          highlightUncovered.push([r, c]);
          if (currentGrid[r][c] < uncoveredMin) {
            uncoveredMin = currentGrid[r][c];
          }
        }
      }
    }

    steps.push({
      id: stepCounter++,
      title: "Étape 3 : Recherche du support minimal et de la plus petite valeur",
      description: `Le support minimal est formé en barrant les lignes non-marquées (${labels.rows.filter((_, i) => !markedRows[i]).join(', ')}) et les colonnes marquées (${labels.cols.filter((_, i) => markedCols[i]).join(', ')}). La plus petite valeur non couverte est ${uncoveredMin}.`,
      matrix: currentGrid.map(row => [...row]),
      matrixLabels: { ...labels },
      starredZeros: [...starredList],
      crossedZeros: [...crossedList],
      markedRows: [...markedRows],
      markedCols: [...markedCols],
      uncoveredMin,
      highlightedCells: [...highlightUncovered],
      totalCostBound: runCost
    });

    // --- ÉTAPE 4 : Ajustement de la matrice ---
    // Subtract from uncovered, add to double covered (row is NOT marked, col IS marked)
    const adjustedGrid = currentGrid.map((row, r) => 
      row.map((val, c) => {
        const rowCovered = !markedRows[r];
        const colCovered = markedCols[c];
        
        if (!rowCovered && !colCovered) {
          // uncovered
          return val - uncoveredMin;
        } else if (rowCovered && colCovered) {
          // double covered
          return val + uncoveredMin;
        }
        return val;
      })
    );

    runCost += uncoveredMin;

    steps.push({
      id: stepCounter++,
      title: `Étape 4 : Ajustement de la matrice (+${uncoveredMin})`,
      description: `On soustrait ${uncoveredMin} à toutes les cases non couvertes, et on l'ajoute aux intersections des lignes et colonnes de couverture. Le minorant du coût d'affectation devient B = ${runCost}.`,
      matrix: adjustedGrid.map(row => [...row]),
      matrixLabels: { ...labels },
      totalCostBound: runCost
    });

    currentGrid = adjustedGrid;
  }

  // If optimal assignment was never reached (e.g. limit hit)
  if (!isOptimal) {
    // Force some final step representation
    steps.push({
      id: stepCounter++,
      title: "Limite d'itérations atteinte",
      description: "Le solveur a arrêté la recherche pour éviter une boucle infinie. Veuillez vérifier la matrice d'origine.",
      matrix: currentGrid,
      matrixLabels: { ...labels },
      totalCostBound: runCost
    });
  }

  return steps;
}
