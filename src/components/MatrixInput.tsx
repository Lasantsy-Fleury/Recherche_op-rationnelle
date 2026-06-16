import React, { useState, useEffect } from 'react';
import { SavedMatrix, SolverMode } from '../types';
import { STATIC_PRESETS } from './Presets';
import { getSavedMatrices, saveMatrix, deleteMatrix } from '../utils/api';
import { Plus, Minus, Shuffle, Upload, Save, ChevronDown, Trash2, FileJson, FileSpreadsheet, ArrowRight } from 'lucide-react';

interface MatrixInputProps {
  onMatrixSubmit: (matrix: { grid: number[][]; mode: SolverMode; rows: string[]; cols: string[] }) => void;
  initialMatrix?: { grid: number[][]; mode: SolverMode; rows: string[]; cols: string[] };
}

export const MatrixInput: React.FC<MatrixInputProps> = ({ onMatrixSubmit, initialMatrix }) => {
  const [size, setSize] = useState<number>(6);
  const [grid, setGrid] = useState<number[][]>([]);
  const [rows, setRows] = useState<string[]>([]);
  const [cols, setCols] = useState<string[]>([]);
  const [mode, setMode] = useState<SolverMode>('min');
  const [customComplement, setCustomComplement] = useState<string>('100');
  const [presetName, setPresetName] = useState<string>('');
  
  // Storage for custom history list from DB
  const [savedList, setSavedList] = useState<SavedMatrix[]>([]);
  const [showPresetsDropdown, setShowPresetsDropdown] = useState<boolean>(false);

  // Initialize Matrix with Ref dataset or default
  useEffect(() => {
    if (initialMatrix) {
      setGrid(initialMatrix.grid.map(row => [...row]));
      setRows([...initialMatrix.rows]);
      setCols([...initialMatrix.cols]);
      setSize(initialMatrix.grid.length);
      setMode(initialMatrix.mode);
    } else {
      loadPreset(STATIC_PRESETS[0]);
    }
    loadDatabaseMatrices();
  }, []);

  const loadDatabaseMatrices = async () => {
    const list = await getSavedMatrices();
    setSavedList(list);
  };

  const loadPreset = (preset: SavedMatrix) => {
    setGrid(preset.grid.map(row => [...row]));
    setRows([...preset.rows]);
    setCols([...preset.cols]);
    setSize(preset.grid.length);
    setMode(preset.mode);
    setShowPresetsDropdown(false);
  };

  // Adjust Matrix Dimension
  const handleSizeChange = (newSize: number) => {
    if (newSize < 2 || newSize > 100) return; // Cap at 100x100 for safety

    // Adjust grid
    const newGrid: number[][] = [];
    const newRows: string[] = [];
    const newCols: string[] = [];

    for (let r = 0; r < newSize; r++) {
      const rowArr: number[] = [];
      newRows.push(rows[r] || String.fromCharCode(65 + r));

      for (let c = 0; c < newSize; c++) {
        if (grid[r] && grid[r][c] !== undefined) {
          rowArr.push(grid[r][c]);
        } else {
          rowArr.push(Math.floor(Math.random() * 90) + 10); // Default random
        }
      }
      newGrid.push(rowArr);
    }

    for (let c = 0; c < newSize; c++) {
      newCols.push(cols[c] || String.fromCharCode(97 + c));
    }

    setGrid(newGrid);
    setRows(newRows);
    setCols(newCols);
    setSize(newSize);
  };

  const updateCell = (r: number, c: number, value: string) => {
    const parsed = parseInt(value) || 0;
    const newGrid = grid.map((row, rIdx) => 
      row.map((val, cIdx) => (rIdx === r && cIdx === c ? parsed : val))
    );
    setGrid(newGrid);
  };

  const handleLabelChange = (type: 'row' | 'col', idx: number, value: string) => {
    if (type === 'row') {
      const updated = [...rows];
      updated[idx] = value;
      setRows(updated);
    } else {
      const updated = [...cols];
      updated[idx] = value;
      setCols(updated);
    }
  };

  const randomizeMatrix = () => {
    const newGrid = grid.map(row => 
      row.map(() => Math.floor(Math.random() * 95) + 5) // random between 5 and 99
    );
    setGrid(newGrid);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.grid)) {
          const importedSize = parsed.grid.length;
          const finalRows = parsed.rows || Array.from({ length: importedSize }, (_, i) => String.fromCharCode(65 + i));
          const finalCols = parsed.cols || Array.from({ length: importedSize }, (_, i) => String.fromCharCode(97 + i));
          
          setGrid(parsed.grid);
          setRows(finalRows);
          setCols(finalCols);
          setSize(importedSize);
          if (parsed.mode) setMode(parsed.mode);
        } else {
          alert("Format JSON invalide. Doit comporter un attribut 'grid' 2D.");
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        // Parse simple matrix list
        const parsedGrid: number[][] = lines.map(line => 
          line.split(/[;,]/).map(item => parseInt(item.trim()) || 0)
        );

        const loadedSize = parsedGrid.length;
        // Verify square grid
        const isSquare = parsedGrid.every(row => row.length === loadedSize);
        if (!isSquare) {
          alert("La matrice CSV importée doit être carrée (dimensions identiques).");
          return;
        }

        const finalRows = Array.from({ length: loadedSize }, (_, i) => String.fromCharCode(65 + i));
        const finalCols = Array.from({ length: loadedSize }, (_, i) => String.fromCharCode(97 + i));

        setGrid(parsedGrid);
        setRows(finalRows);
        setCols(finalCols);
        setSize(loadedSize);
      } catch (err) {
        alert("Erreur lors de la lecture du fichier CSV.");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveToHistory = async () => {
    if (!presetName.trim()) {
      alert("Saisissez un nom pour enregistrer cette configuration.");
      return;
    }
    const payload = {
      name: presetName.trim(),
      mode,
      rows,
      cols,
      grid
    };
    await saveMatrix(payload);
    setPresetName('');
    loadDatabaseMatrices();
    alert("Configuration sauvegardée !");
  };

  const handleDeleteSaved = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer cette configuration sauvegardée ?")) {
      await deleteMatrix(id);
      loadDatabaseMatrices();
    }
  };

  const handleSubmit = () => {
    onMatrixSubmit({
      grid,
      mode,
      rows,
      cols
    });
  };

  return (
    <div className="bg-white rounded border border-zinc-200 p-6 md:p-8 flex flex-col gap-6 shadow-xs" id="matrix-input-panel">
      {/* Configuration Header controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h2 className="font-sans text-base font-bold uppercase tracking-tight text-zinc-900">Solveur Algorithme Hongrois</h2>
          <p className="text-zinc-500 text-xs mt-1">Configurez une matrice carrée ou chargez un exemple pour démarrer l'analyse.</p>
        </div>

        {/* Presets and Presets storage dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
            className="flex items-center gap-2 bg-white hover:bg-zinc-50 transition-colors border border-zinc-900 px-4 py-2 rounded text-zinc-900 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Choisir une Matrice Type
            <ChevronDown size={14} />
          </button>

          {showPresetsDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded shadow-lg z-50 overflow-hidden py-1 max-h-96 overflow-y-auto">
              <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 border-b border-zinc-100 uppercase tracking-widest">
                Exemples du support théorique
              </div>
              {STATIC_PRESETS.map((p, i) => (
                <button
                  key={`p-static-${i}`}
                  onClick={() => loadPreset(p)}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-50 text-zinc-700 text-xs flex justify-between items-center transition-colors border-b border-zinc-50"
                >
                  <span className="font-semibold text-zinc-800 truncate mr-2">{p.name}</span>
                  <span className="text-[9px] bg-zinc-900 text-white px-1.5 py-0.5 rounded uppercase font-bold">
                    {p.mode === 'min' ? 'Min' : 'Max'}
                  </span>
                </button>
              ))}

              {savedList.length > 0 && (
                <>
                  <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 border-b border-zinc-100 uppercase tracking-widest bg-zinc-50/50">
                    Vos configurations sauvegardées
                  </div>
                  {savedList.map((p) => (
                    <button
                      key={`p-saved-${p.id}`}
                      onClick={() => loadPreset(p)}
                      className="w-full text-left px-4 py-2 hover:bg-zinc-50 text-zinc-700 text-xs flex justify-between items-center transition-colors border-b border-zinc-50"
                    >
                      <span className="font-semibold text-zinc-800 truncate mr-2">{p.name} ({p.grid.length}x{p.grid.length})</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-zinc-100 text-zinc-800 border border-zinc-200 px-1.5 py-0.5 rounded uppercase font-bold">
                          {p.mode === 'min' ? 'Min' : 'Max'}
                        </span>
                        <div
                          onClick={(e) => handleDeleteSaved(p.id!, e)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={13} />
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main dimension settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end bg-zinc-50 p-4 rounded border border-zinc-200">
        {/* Dimension Count */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dimension de la matrice (NxN)</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSizeChange(size - 1)}
              disabled={size <= 2}
              className="w-9 h-9 flex items-center justify-center bg-white border border-zinc-200 rounded hover:bg-zinc-100 disabled:opacity-30 text-zinc-900 font-bold transition-all shadow-xs cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <div className="w-14 text-center font-mono font-bold text-sm text-zinc-900 bg-white border border-zinc-200 rounded py-1.5">
              {size}
            </div>
            <button
              onClick={() => handleSizeChange(size + 1)}
              disabled={size >= 50} // Restrict UI inputs at 50 for layout comfort, support 100 on import
              className="w-9 h-9 flex items-center justify-center bg-white border border-zinc-200 rounded hover:bg-zinc-100 disabled:opacity-30 text-zinc-900 font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Optimisation Mode Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Objectif du problème</label>
          <div className="flex bg-zinc-100 rounded border border-zinc-200 p-1 shadow-xs">
            <button
              onClick={() => setMode('min')}
              className={`flex-1 py-1.5 px-3 text-[10px] font-bold uppercase rounded transition-all cursor-pointer ${
                mode === 'min'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Minimisation (Coût)
            </button>
            <button
              onClick={() => setMode('max')}
              className={`flex-1 py-1.5 px-3 text-[10px] font-bold uppercase rounded transition-all cursor-pointer ${
                mode === 'max'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Maximisation (Profit)
            </button>
          </div>
        </div>

        {/* Matrix Generator controls */}
        <div className="flex flex-wrap gap-2 justify-start sm:justify-end lg:justify-start">
          <button
            onClick={randomizeMatrix}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded text-[10px] font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
          >
            <Shuffle size={12} />
            Aléatoire
          </button>

          <label className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded text-[10px] font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer">
            <Upload size={12} />
            Import CSV
            <input type="file" onChange={handleImportCSV} accept=".csv" className="hidden" />
          </label>

          <label className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded text-[10px] font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer">
            <Upload size={12} />
            Import JSON
            <input type="file" onChange={handleImportJSON} accept=".json" className="hidden" />
          </label>
        </div>
      </div>

      {/* Grid editor container */}
      <div className="border border-zinc-200 rounded p-4 overflow-auto bg-white max-h-[480px]">
        {size > 20 && (
          <div className="p-3 mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded flex items-center gap-2">
            <strong>Conseil :</strong> Pour les matrices d'ordre élevé ({size}x{size}), l'affichage peut être compact. Utilisez l'import ou le remplissage automatique.
          </div>
        )}

        <div className="min-w-fit flex flex-col gap-1.5">
          {/* Header row (Columns) */}
          <div className="flex gap-1.5 items-center">
            {/* Corner Cell spacer */}
            <div className="w-16 h-10 flex items-center justify-center bg-zinc-100 text-zinc-500 font-bold rounded text-[10px] font-mono uppercase">
              Origine
            </div>
            {cols.map((col, idx) => (
              <input
                key={`col-lbl-${idx}`}
                type="text"
                value={col}
                onChange={(e) => handleLabelChange('col', idx, e.target.value.substring(0, 8))}
                className="w-16 h-10 text-center bg-zinc-50 border border-zinc-200 rounded text-zinc-800 font-mono font-bold text-xs focus:ring-1 focus:ring-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                placeholder={String.fromCharCode(97 + idx)}
                title="Double cliquer pour renommer"
              />
            ))}
          </div>

          {/* Grid rows */}
          {grid.map((rowArr, r) => (
            <div key={`row-wrap-${r}`} className="flex gap-1.5 items-center">
              {/* Row Label header */}
              <input
                type="text"
                value={rows[r]}
                onChange={(e) => handleLabelChange('row', r, e.target.value.substring(0, 12))}
                className="w-16 h-10 text-center bg-zinc-50 border border-zinc-200 rounded text-zinc-800 font-sans font-bold text-xs focus:ring-1 focus:ring-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                placeholder={String.fromCharCode(65 + r)}
                title="Double cliquer pour renommer"
              />
              {rowArr.map((val, c) => (
                <input
                  key={`cell-${r}-${c}`}
                  type="number"
                  value={val === 0 ? '0' : val}
                  onChange={(e) => updateCell(r, c, e.target.value)}
                  className="w-16 h-10 text-center border border-zinc-200 rounded font-mono text-sm text-zinc-900 font-semibold focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Row/Col naming tip */}
      <p className="text-zinc-400 text-[10px] tracking-wider uppercase font-semibold italic">* Cliquez sur les entêtes (A, B, C... / a, b, c...) pour personnaliser les noms des postes et des candidats.</p>

      {/* Footer Submission and Save history controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-zinc-50 p-4 rounded border border-zinc-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Nom de la matrice..."
            className="px-3 py-2 bg-white border border-zinc-200 rounded text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
          />
          <button
            onClick={handleSaveToHistory}
            className="flex items-center gap-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-xs text-[11px] font-bold uppercase px-4 py-2 rounded transition-all cursor-pointer"
          >
            <Save size={12} />
            Sauvegarder
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider px-8 py-3 rounded transition-all shadow-xs cursor-pointer active:scale-95"
        >
          Résoudre
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
