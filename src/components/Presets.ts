import { SavedMatrix } from '../types';

export const STATIC_PRESETS: SavedMatrix[] = [
  {
    name: "Exemple Réf : Minimisation (Slide Deck 6x6)",
    mode: "min",
    rows: ["A", "B", "C", "D", "E", "F"],
    cols: ["a", "b", "c", "d", "e", "f"],
    grid: [
      [14, 6, 18, 16, 63, 15],
      [41, 78, 44, 73, 70, 25],
      [44, 81, 36, 80, 80, 78],
      [46, 74, 5, 25, 83, 3],
      [72, 32, 55, 51, 3, 81],
      [69, 76, 12, 99, 83, 80]
    ]
  },
  {
    name: "Exemple Réf : Maximisation (Slide 207)",
    mode: "max",
    rows: ["A", "B", "C", "D", "E", "F"],
    cols: ["a", "b", "c", "d", "e", "f"],
    grid: [
      [86, 94, 82, 84, 37, 85],
      [59, 22, 56, 27, 30, 75],
      [56, 19, 64, 20, 20, 22],
      [54, 26, 95, 75, 17, 97],
      [28, 68, 45, 49, 97, 19],
      [31, 24, 88, 1, 17, 20]
    ]
  },
  {
    name: "Petit Problème d'Assignation (3x3)",
    mode: "min",
    rows: ["Manoeuvre 1", "Manoeuvre 2", "Manoeuvre 3"],
    cols: ["Poste A", "Poste B", "Poste C"],
    grid: [
      [10, 8, 15],
      [9, 12, 11],
      [5, 13, 10]
    ]
  },
  {
    name: "Problème d'Assignation 4x4",
    mode: "min",
    rows: ["Chef de projet", "Architecte", "Développeur", "Testeur"],
    cols: ["Tâche 1-Conception", "Tâche 2-Code", "Tâche 3-Tests", "Tâche 4-Déploiement"],
    grid: [
      [20, 15, 18, 22],
      [12, 10, 14, 15],
      [15, 18, 12, 16],
      [18, 12, 15, 14]
    ]
  },
  {
    name: "Grand Problème de Rendement (8x8)",
    mode: "max",
    rows: ["Opérateur A", "Opérateur B", "Opérateur C", "Opérateur D", "Opérateur E", "Opérateur F", "Opérateur G", "Opérateur H"],
    cols: ["Machine 1", "Machine 2", "Machine 3", "Machine 4", "Machine 5", "Machine 6", "Machine 7", "Machine 8"],
    grid: [
      [51, 64, 75, 62, 53, 55, 60, 48],
      [42, 70, 68, 81, 75, 60, 62, 65],
      [63, 62, 72, 59, 68, 70, 75, 51],
      [55, 61, 60, 72, 80, 85, 78, 62],
      [72, 55, 51, 62, 65, 75, 83, 70],
      [48, 75, 80, 62, 74, 71, 68, 81],
      [60, 62, 71, 75, 83, 80, 78, 62],
      [65, 81, 75, 60, 72, 55, 51, 62]
    ]
  }
];
