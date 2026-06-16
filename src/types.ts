/**
 * Types and interfaces for the Hungarian Algorithm Solver.
 */

export interface CellState {
  value: number;
  originalValue: number;
  isCoveredRow: boolean;
  isCoveredCol: boolean;
  isDoubleCovered: boolean;
  zeroState: 'none' | 'free' | 'encadré' | 'barré'; // none, free zero, matched zero, crossed-out zero
}

export type SolverMode = 'min' | 'max';

export interface SolverStep {
  id: number;
  title: string;
  description: string;
  matrix: number[][];
  matrixLabels: {
    rows: string[];
    cols: string[];
  };
  columnMinimums?: number[];
  rowMinimums?: number[];
  // Marking state for Hungarian Step 3 (Konig's Theorem)
  markedRows?: boolean[]; // index map
  markedCols?: boolean[]; // index map
  starredZeros?: [number, number][]; // [row, j]
  crossedZeros?: [number, number][]; // [row, j]
  uncoveredMin?: number;
  highlightedCells?: [number, number][]; // cells to emphasize
  totalCostBound?: number;
  isOptimal?: boolean;
  optimalAssignment?: { [row: string]: string };
  optimalValue?: number;
}

export interface SavedMatrix {
  id?: number;
  name: string;
  mode: SolverMode;
  rows: string[];
  cols: string[];
  grid: number[][];
  createdAt?: string;
}
