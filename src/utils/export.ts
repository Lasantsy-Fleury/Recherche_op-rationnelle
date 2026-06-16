import { SavedMatrix } from '../types';

/**
 * Downloads a text file in the browser.
 */
function downloadFile(content: string, fileName: string, contentType: string) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Exports matrix configuration to CSV.
 */
export function exportToCSV(grid: number[][], rows: string[], cols: string[], fileName = 'matrice.csv') {
  let csvContent = "";
  // Header row
  csvContent += ";" + cols.join(";") + "\n";
  
  for (let r = 0; r < grid.length; r++) {
    csvContent += rows[r] + ";" + grid[r].join(";") + "\n";
  }
  
  downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
}

/**
 * Exports matrix configuration to JSON.
 */
export function exportToJSON(grid: number[][], rows: string[], cols: string[], mode: 'min' | 'max', fileName = 'matrice.json') {
  const payload = {
    generator: "Hungarian Algorithm Solver",
    mode,
    dimension: grid.length,
    rows,
    cols,
    grid
  };
  
  downloadFile(JSON.stringify(payload, null, 2), fileName, 'application/json');
}

/**
 * Draws the current matrix grid to a transparent HTML Canvas and downloads it as PNG.
 */
export function exportToPNG(grid: number[][], rows: string[], cols: string[], fileName = 'matrice.png') {
  const N = grid.length;
  const cellSize = 60;
  const padding = 60;
  const canvasWidth = cellSize * N + padding * 2;
  const canvasHeight = cellSize * N + padding * 2;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#0f172a'; // dark theme matching applet
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Grid background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(padding - 10, padding - 10, cellSize * N + 20, cellSize * N + 20);

  // Fonts
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw headers
  ctx.fillStyle = '#94a3b8';
  for (let c = 0; c < N; c++) {
    ctx.fillText(cols[c], padding + c * cellSize + cellSize / 2, padding / 2);
  }
  for (let r = 0; r < N; r++) {
    ctx.fillText(rows[r], padding / 2, padding + r * cellSize + cellSize / 2);
  }

  // Draw Cells
  ctx.font = 'bold 14px monospace';
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = padding + c * cellSize;
      const y = padding + r * cellSize;
      
      // Cell background
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
      ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

      // Text value
      ctx.fillStyle = grid[r][c] === 0 ? '#10b981' : '#f8fafc';
      ctx.fillText(String(grid[r][c]), x + cellSize / 2, y + cellSize / 2);
    }
  }

  // Convert to image download
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
}
