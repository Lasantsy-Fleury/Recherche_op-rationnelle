import { SolverStep, SavedMatrix, SolverMode } from '../types';
import { solveHungarian } from './solver';

/**
 * Checks if the backend server is running and database is ready.
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Solve Hungarian assignment. Falls back to in-browser solver if backend is down.
 */
export async function solveAssignment(
  grid: number[][],
  mode: SolverMode = 'min',
  customLabels?: { rows: string[]; cols: string[] },
  customComplement?: number
): Promise<SolverStep[]> {
  try {
    const res = await fetch('/api/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grid, mode, customLabels, customComplement }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.steps) return data.steps;
    }
  } catch (err) {
    console.warn('Backend solve failed, falling back to client-side solver:', err);
  }

  // Pure client-side fallback
  return solveHungarian(grid, mode, customLabels, customComplement);
}

/**
 * Fetch saved matrices from history.
 */
export async function getSavedMatrices(): Promise<SavedMatrix[]> {
  try {
    const res = await fetch('/api/matrices');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch saved matrices:', err);
  }
  return getLocalStorageMatrices();
}

/**
 * Save a custom matrix layout.
 */
export async function saveMatrix(matrix: Omit<SavedMatrix, 'id' | 'createdAt'>): Promise<SavedMatrix> {
  try {
    const res = await fetch('/api/matrices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matrix),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to save matrix on backend:', err);
  }
  return saveLocalStorageMatrix(matrix);
}

/**
 * Delete a custom matrix layout.
 */
export async function deleteMatrix(id: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/matrices/${id}`, { method: 'DELETE' });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.error('Failed to delete matrix on backend:', err);
  }
  return deleteLocalStorageMatrix(id);
}

// --- CLIENT-SIDE LOCAL STORAGE FALLBACKS ---

const LOCAL_STORAGE_KEY = 'hungarian_solver_matrices';

function getLocalStorageMatrices(): SavedMatrix[] {
  try {
    const serialized = localStorage.getItem(LOCAL_STORAGE_KEY);
    return serialized ? JSON.parse(serialized) : [];
  } catch {
    return [];
  }
}

function saveLocalStorageMatrix(matrix: Omit<SavedMatrix, 'id' | 'createdAt'>): SavedMatrix {
  const current = getLocalStorageMatrices();
  const newMatrix: SavedMatrix = {
    ...matrix,
    id: Date.now(),
    createdAt: new Date().toISOString()
  };
  current.unshift(newMatrix);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  return newMatrix;
}

function deleteLocalStorageMatrix(id: number): boolean {
  const current = getLocalStorageMatrices();
  const filtered = current.filter(m => m.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
