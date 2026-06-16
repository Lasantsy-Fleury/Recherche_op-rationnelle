import React, { useState, useRef, useEffect } from 'react';
import { SolverStep } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, HelpCircle, AlertCircle } from 'lucide-react';

interface MatrixVisualizerProps {
  step: SolverStep;
}

export const MatrixVisualizer: React.FC<MatrixVisualizerProps> = ({ step }) => {
  const {
    matrix,
    matrixLabels,
    starredZeros = [],
    crossedZeros = [],
    markedRows = [],
    markedCols = [],
    highlightedCells = [],
    columnMinimums,
    rowMinimums,
    uncoveredMin
  } = step;
  const N = matrix.length;

  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [N]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handleMouseUp = () => setIsDragging(false);
  const zoomIn = () => setScale(s => Math.min(2.5, s + 0.15));
  const zoomOut = () => setScale(s => Math.max(0.5, s - 0.15));
  const resetTransform = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  const isRowCovered = (rIdx: number) => markedRows && markedRows.length > 0 && !markedRows[rIdx];
  const isColCovered = (cIdx: number) => markedCols && markedCols.length > 0 && markedCols[cIdx];
  const isStarred = (r: number, c: number) => starredZeros.some(([sr, sc]) => sr === r && sc === c);
  const isCrossed = (r: number, c: number) => crossedZeros.some(([cr, cc]) => cr === r && cc === c);
  const isHighlighted = (r: number, c: number) => highlightedCells.some(([hr, hc]) => hr === r && hc === c);

  const showRowMinimums = rowMinimums && rowMinimums.length > 0;
  const showColMinimums = columnMinimums && columnMinimums.length > 0;
  const isMarkingStep = markedRows.length > 0 || markedCols.length > 0;

  const getCellClasses = (r: number, c: number, val: number) => {
    const rowCov = isRowCovered(r);
    const colCov = isColCovered(c);
    const starred = isStarred(r, c);
    const crossed = isCrossed(r, c);
    const high = isHighlighted(r, c);

    let bgClass = "bg-white border-zinc-200 text-zinc-800";
    let textClass = "font-semibold";

    if (val === 0 && !starred && !crossed) {
      bgClass = "bg-zinc-50 border-zinc-300 text-zinc-900 font-bold";
    }
    if (starred) {
      bgClass = "bg-zinc-900 border-zinc-900 text-white shadow-xs rounded-xs";
      textClass = "font-black scale-105";
    } else if (crossed) {
      bgClass = "bg-red-50 border-red-200 text-red-500 font-bold";
      textClass = "font-medium opacity-70 line-through decoration-red-500 decoration-2";
    } else if (high) {
      bgClass = "bg-amber-100 border-amber-400 text-amber-950 ring-1 ring-amber-300 animate-pulse";
    } else {
      if (rowCov && colCov) {
        bgClass = "bg-red-100/80 border-red-300 text-red-900";
      } else if (rowCov) {
        bgClass = "bg-red-50/60 border-red-200/60 text-red-800";
      } else if (colCov) {
        bgClass = "bg-red-50/60 border-red-200/60 text-red-800";
      }
    }
    return { bgClass, textClass, rowCov, colCov };
  };

  return (
    <div className="relative border border-zinc-200 rounded bg-white shadow-xs overflow-hidden select-none flex-1 flex flex-col min-h-[460px]" id="matrix-visualizer-panel">
      {/* Header */}
      <div className="flex justify-between items-center bg-zinc-900 px-6 py-3 border-b border-zinc-800 shrink-0 z-10 no-print">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-zinc-300 font-sans text-[10px] font-bold uppercase tracking-widest">Matrice d'Analyse</span>
          {step.totalCostBound !== undefined && step.totalCostBound > 0 && (
            <span className="ml-3 text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
              Estimation actuelle = {step.totalCostBound}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={zoomOut} className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors shadow-xs cursor-pointer" title="Zoom arrière"><ZoomOut size={13} /></button>
          <span className="text-zinc-400 text-[10px] font-mono w-10 text-center font-bold">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors shadow-xs cursor-pointer" title="Zoom avant"><ZoomIn size={13} /></button>
          <button onClick={resetTransform} className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors shadow-xs ml-1 cursor-pointer" title="Réinitialiser"><RotateCcw size={13} /></button>
        </div>
      </div>

      {/* Grid stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-8 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ background: 'radial-gradient(circle at center, #fdfdfd 0%, #f4f4f5 100%)' }}
      >
        <div className="transition-transform duration-75 select-none" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: 'center center' }}>
          <div className="flex flex-col gap-2 p-6 bg-white border border-zinc-200 rounded shadow-2xl relative">

            {/* ROW 1: Column marking indicators (+) for König */}
            <div className="flex gap-2 items-center">
              <div className="w-14 shrink-0"></div>
              {matrixLabels.cols.map((_, cIdx) => (
                <div key={`mark-col-${cIdx}`} className={`w-14 text-center font-mono font-bold text-xs py-0.5 rounded transition-all ${(markedCols && markedCols[cIdx]) ? 'text-red-600 bg-red-50 border border-red-200 scale-105' : 'text-transparent'}`}>+</div>
              ))}
              {showRowMinimums && <div className="w-16 shrink-0"></div>}
            </div>

            {/* ROW 2: Column headers */}
            <div className="flex gap-2 items-center">
              <div className="w-14 h-14 flex items-center justify-center font-bold text-[10px] text-zinc-400 font-mono border border-transparent uppercase">REF</div>
              {matrixLabels.cols.map((col, cIdx) => (
                <div key={`v-col-${cIdx}`} className={`w-14 h-14 flex items-center justify-center font-mono font-bold text-sm rounded transition-all border ${isColCovered(cIdx) ? 'bg-red-500 text-white border-red-500 scale-105 shadow-md shadow-red-500/10' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}>{col}</div>
              ))}
              {showRowMinimums && <div className="w-16 h-14 flex items-center justify-center font-bold text-[9px] text-red-600 font-mono uppercase tracking-wider">min L</div>}
            </div>

            {/* MATRIX DATA ROWS */}
            {matrix.map((rowArr, rIdx) => (
              <div key={`v-row-wrapper-${rIdx}`} className="flex gap-2 items-center relative">
                {/* Row Header */}
                <div className={`w-14 h-14 shrink-0 flex items-center justify-center font-sans font-bold text-sm rounded transition-all border ${isRowCovered(rIdx) ? 'bg-red-500 text-white border-red-500 scale-105 shadow-md shadow-red-500/10' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}>
                  {matrixLabels.rows[rIdx]}
                </div>
                {/* Cells */}
                {rowArr.map((val, cIdx) => {
                  const { bgClass, textClass, rowCov: rc, colCov: cc } = getCellClasses(rIdx, cIdx, val);
                  const starred = isStarred(rIdx, cIdx);
                  const high = isHighlighted(rIdx, cIdx);
                  return (
                    <div
                      key={`val-cell-${rIdx}-${cIdx}`}
                      className={`w-14 h-14 flex flex-col justify-center items-center rounded border text-sm transition-all duration-150 font-mono relative overflow-hidden ${bgClass} ${textClass}`}
                      style={{
                        backgroundImage: isMarkingStep && !starred && !isCrossed(rIdx, cIdx) && !high
                          ? (rc && cc
                              ? 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(220,38,38,0.08) 3px, rgba(220,38,38,0.08) 4px), repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(220,38,38,0.08) 3px, rgba(220,38,38,0.08) 4px)'
                              : rc
                                ? 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(220,38,38,0.1) 4px, rgba(220,38,38,0.1) 5px)'
                                : cc
                                  ? 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(220,38,38,0.1) 4px, rgba(220,38,38,0.1) 5px)'
                                  : 'none')
                          : 'none',
                      }}
                    >
                      {starred && <div className="absolute inset-0.5 border-2 border-white/30 rounded pointer-events-none"></div>}
                      {high && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-bl-sm z-10"></div>}
                      <span>{val}</span>
                    </div>
                  );
                })}
                {/* Row minimum (RED, right side) */}
                {showRowMinimums && rowMinimums![rIdx] !== undefined && (
                  <div className="w-16 shrink-0 text-center font-mono font-bold text-xs text-red-600 pl-1">{rowMinimums![rIdx]}</div>
                )}
                {/* Row marking (+) */}
                {markedRows && markedRows[rIdx] && (
                  <div className="w-8 shrink-0 pl-2 text-red-600 font-mono font-bold text-sm">+</div>
                )}
              </div>
            ))}

            {/* BOTTOM ROW 1: Column minimums values (RED, below the matrix) */}
            {showColMinimums && (
              <div className="flex gap-2 items-center">
                <div className="w-14 shrink-0"></div>
                {columnMinimums!.map((minVal, cIdx) => (
                  <div key={`col-min-${cIdx}`} className="w-14 text-center font-mono font-bold text-xs py-0.5 text-red-600">{minVal}</div>
                ))}
                {showRowMinimums && <div className="w-16 shrink-0"></div>}
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-zinc-50 px-6 py-4 flex flex-wrap gap-x-6 gap-y-3 text-[11px] text-zinc-500 border-t border-zinc-200 no-print">
        <span className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-white border border-zinc-200 rounded"></span>Valeur ajustée (Cij)</span>
        <span className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-zinc-900 text-white rounded text-[9px] font-mono font-bold text-center leading-4">0</span>Zéro optimal (Encadré)</span>
        <span className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-red-50 border border-red-200 text-red-500 line-through rounded text-center leading-4 font-mono font-bold">0</span>Zéro incompatible (Barré)</span>
        {isMarkingStep && (
          <>
            <span className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-red-50/60 border border-red-200/60 rounded relative overflow-hidden"><span className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(220,38,38,0.15) 3px, rgba(220,38,38,0.15) 4px)' }}></span></span>Ligne couverte</span>
            <span className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-red-50/60 border border-red-200/60 rounded relative overflow-hidden"><span className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(220,38,38,0.15) 3px, rgba(220,38,38,0.15) 4px)' }}></span></span>Colonne couverte</span>
            <span className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-red-100/80 border border-red-300 rounded relative overflow-hidden"><span className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(220,38,38,0.12) 2px, rgba(220,38,38,0.12) 3px), repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(220,38,38,0.12) 2px, rgba(220,38,38,0.12) 3px)' }}></span></span>Intersection</span>
          </>
        )}
        {showRowMinimums && <span className="flex items-center gap-2"><span className="inline-block font-mono font-bold text-red-600 text-xs">min L</span>Minimum de ligne</span>}
        {showColMinimums && <span className="flex items-center gap-2"><span className="inline-block font-mono font-bold text-red-600 text-xs">min C</span>Minimum de colonne</span>}
        {uncoveredMin !== undefined && <span className="flex items-center gap-1.5 text-red-600 ml-auto font-bold uppercase tracking-wider text-[10px]"><AlertCircle size={13} />Min non couvert = {uncoveredMin}</span>}
      </div>
    </div>
  );
};
