import React, { useRef, useState } from 'react';
import { SolverStep } from '../types';
import { CheckCircle, Award, HelpCircle, Download, FileText, ArrowRight, Table } from 'lucide-react';

interface ResultPanelProps {
  finalStep: SolverStep;
  originalGrid: number[][];
  onDownloadPNG?: () => void;
  onDownloadPDF?: () => void;
  onDownloadJSON?: () => void;
  onDownloadCSV?: () => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  finalStep,
  originalGrid,
  onDownloadPNG,
  onDownloadPDF,
  onDownloadJSON,
  onDownloadCSV
}) => {
  const { optimalAssignment, optimalValue, matrixLabels } = finalStep;
  if (!optimalAssignment || optimalValue === undefined) return null;

  // Render bipartite graph coordinates
  const leftNodes = matrixLabels.rows;
  const rightNodes = matrixLabels.cols;
  const N = leftNodes.length;

  const nodeRadius = 22;
  const graphWidth = 580;
  const graphHeight = Math.max(340, N * 54);

  // Left column X: 110, Right column X: 470
  const leftX = 100;
  const rightX = graphWidth - 100;

  const getLeftY = (idx: number) => {
    const spacing = (graphHeight - 60) / (N - 1 || 1);
    return 30 + idx * spacing;
  };

  const getRightY = (idx: number) => {
    const spacing = (graphHeight - 60) / (N - 1 || 1);
    return 30 + idx * spacing;
  };

  // Find column index from label
  const getColIndexFromLabel = (label: string): number => {
    return rightNodes.indexOf(label);
  };

  // Generate SVG link lines for bipartite graph
  const renderBipartiteConnections = () => {
    const connections: React.ReactNode[] = [];

    // Render non-optimal connections first (subtle)
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const rowLabel = leftNodes[r];
        const assignedColLabel = optimalAssignment[rowLabel];
        const assignedColIdx = getColIndexFromLabel(assignedColLabel);
        
        if (c !== assignedColIdx) {
          const lY = getLeftY(r);
          const rY = getRightY(c);
          connections.push(
            <line
              key={`link-subtle-${r}-${c}`}
              x1={leftX}
              y1={lY}
              x2={rightX}
              y2={rY}
              stroke="#e4e4e7"
              strokeWidth="0.8"
              strokeDasharray="4,4"
              opacity="0.5"
            />
          );
        }
      }
    }

    // Render optimal connections (strong green arrow with values)
    Object.entries(optimalAssignment).forEach(([rowLabel, colLabel], rIdx) => {
      const cIdx = getColIndexFromLabel(colLabel as string);
      if (cIdx === -1) return;

      const lY = getLeftY(rIdx);
      const rY = getRightY(cIdx);
      const costValue = originalGrid[rIdx][cIdx];

      connections.push(
        <g key={`link-opt-${rIdx}`}>
          <line
            x1={leftX}
            y1={lY}
            x2={rightX}
            y2={rY}
            stroke="#18181b"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Label Background circle */}
          <circle
            cx={(leftX + rightX) / 2}
            cy={(lY + rY) / 2}
            r="12"
            fill="#ffffff"
            stroke="#18181b"
            strokeWidth="1.5"
          />
          {/* Cost text value along line */}
          <text
            x={(leftX + rightX) / 2}
            y={(lY + rY) / 2 + 4}
            textAnchor="middle"
            fill="#18181b"
            className="font-mono text-[9px] font-bold"
          >
            {costValue}
          </text>
        </g>
      );
    });

    return connections;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-stretch pt-2" id="optimal-results-panel">
      
      {/* Left Assignment summary Details */}
      <div className="flex-1 bg-white rounded border border-zinc-200 p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden shadow-xs">
        
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 bg-zinc-900 text-white px-4 py-1.5 rounded-bl text-[9px] font-bold uppercase tracking-widest no-print shadow-xs">
          Optimal
        </div>

        <div>
          <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 mb-1.5 no-print">
            <CheckCircle size={12} /> Solution d'Affectation
          </span>
          <h3 className="font-sans text-xl font-bold uppercase tracking-tight text-zinc-900Secondary animate-fade-in text-zinc-900">Analyse Solutionnelle</h3>
          <p className="text-zinc-500 text-xs mt-1">Le coût de couplage optimal de la matrice est trouvé. Voici le tableau des correspondances optimales.</p>
        </div>

        {/* Big visual optimal value metric */}
        <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-200 rounded p-5 shadow-xs">
          <div className="h-14 w-14 rounded bg-zinc-900 flex items-center justify-center text-white font-extrabold shadow text-xl font-mono">
            {optimalValue}
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Valeur Totale Optimale (Z)</span>
            <div className="text-zinc-700 text-xs font-semibold mt-1 font-mono flex items-center gap-1">
              Somme des arêtes: <span className="font-bold text-zinc-900">
                {Object.entries(optimalAssignment).map(([rowLabel, colLabel], rIdx) => {
                  const cIdx = getColIndexFromLabel(colLabel as string);
                  return originalGrid[rIdx][cIdx];
                }).join(' + ')}
              </span>
              <span className="font-bold text-zinc-900"> = {optimalValue}</span>
            </div>
          </div>
        </div>

        {/* Grid assignment table list */}
        <div className="flex flex-col gap-2">
          <span className="text-zinc-450 text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Table size={12} /> Couples d'Assignation Recommandés
          </span>
          <div className="border border-zinc-200 rounded overflow-hidden shadow-xs bg-white divide-y divide-zinc-200">
            {Object.entries(optimalAssignment).map(([rowLabel, colLabel], idx) => {
              const colIdx = getColIndexFromLabel(colLabel as string);
              const originalCost = originalGrid[idx][colIdx];
              return (
                <div key={`res-row-${idx}`} className="flex justify-between items-center px-4 py-3 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="h-5 w-5 bg-zinc-100 flex items-center justify-center font-mono font-bold text-[10px] rounded text-zinc-500">{idx + 1}</span>
                    <span className="font-bold text-zinc-805 font-sans text-xs">{rowLabel}</span>
                    <ArrowRight size={12} className="text-zinc-300" />
                    <span className="font-mono font-bold text-zinc-900 text-xs bg-zinc-100 px-2 py-0.5 rounded">{colLabel as string}</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-900 text-xs flex items-center gap-1 bg-zinc-50 px-3 py-1 rounded border border-zinc-200 shadow-xs">
                    <span className="text-[9px] text-zinc-450 font-normal">val:</span> {originalCost}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification matching formula — explicit like the PDF */}
        <div className="text-xs bg-zinc-50 p-4 rounded border border-zinc-200 flex flex-col gap-2">
          <div className="font-bold text-[10px] text-zinc-800 uppercase tracking-widest flex items-center gap-1.5">
            <HelpCircle size={13} className="text-zinc-400" />
            Vérification :
          </div>
          <p className="text-zinc-500">
            La somme des valeurs des arêtes dans ce graphe d'affectation doit correspondre au coût minimal B trouvé précédemment.
          </p>
          <div className="font-mono text-sm font-bold text-zinc-900 flex flex-wrap items-center gap-1">
            {Object.entries(optimalAssignment).map(([rowLabel, colLabel], idx) => {
              const colIdx = getColIndexFromLabel(colLabel as string);
              const cost = originalGrid[idx][colIdx];
              return (
                <span key={`verify-${idx}`}>
                  {idx > 0 && <span className="text-zinc-400"> + </span>}
                  <span>{rowLabel}{colLabel} = {cost}</span>
                </span>
              );
            })}
            <span className="text-zinc-400"> = </span>
            <span className="text-red-600 font-extrabold text-base">{optimalValue}</span>
          </div>
        </div>

        {/* Export / Actions panel */}
        <div className="flex flex-wrap gap-2.5 mt-auto pt-4 no-print border-t border-zinc-200">
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 transition-colors text-white text-[11px] font-bold uppercase tracking-wider rounded shadow-xs cursor-pointer"
            >
              <FileText size={12} />
              Imprimer Rapport (PDF)
            </button>
          )}
          {onDownloadPNG && (
            <button
              onClick={onDownloadPNG}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-100 transition-colors border border-zinc-200 text-zinc-700 text-[11px] font-semibold rounded shadow-xs cursor-pointer"
            >
              <Download size={12} strokeWidth={2.5} />
              PNG
            </button>
          )}
          {onDownloadJSON && (
            <button
              onClick={onDownloadJSON}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-100 transition-colors border border-zinc-200 text-zinc-700 text-[11px] font-semibold rounded shadow-xs cursor-pointer"
              title="Exporter JSON"
            >
              <Download size={12} />
              JSON
            </button>
          )}
          {onDownloadCSV && (
            <button
              onClick={onDownloadCSV}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-100 transition-colors border border-zinc-200 text-zinc-700 text-[11px] font-semibold rounded shadow-xs cursor-pointer"
              title="Exporter CSV"
            >
              <Download size={12} />
              CSV
            </button>
          )}
        </div>
      </div>

      {/* Right Graph Visualizer side */}
      <div className="flex-1 bg-white border border-zinc-200 rounded p-6 md:p-8 flex flex-col gap-6 relative shadow-xs overflow-hidden min-h-[460px]">
        <div>
          <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mb-1.5 no-print">
            <CheckCircle size={12} /> Visualisation de Biparti
          </span>
          <h3 className="font-sans text-xl font-bold uppercase tracking-tight text-zinc-900">Représentation Graphe Biparti</h3>
          <p className="text-zinc-500 text-xs mt-1">Graphe biparti complet connectant l'ensemble de gauche (candidats) à l'ensemble de droite (postes). Les flèches de couplage optimales sont mises en relief.</p>
        </div>

        {/* Interactive SVG Bipartite Graph */}
        <div className="flex-1 flex justify-center items-center bg-zinc-50 border border-zinc-200 rounded relative overflow-hidden max-h-[500px]">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="select-none"
          >
            {/* Connection Arcs */}
            {renderBipartiteConnections()}

            {/* Left nodes (Candidats rows) */}
            {leftNodes.map((rowName, idx) => {
              const lY = getLeftY(idx);
              return (
                <g key={`left-node-${idx}`}>
                  {/* Outer glowing border circle if matched */}
                  <circle
                    cx={leftX}
                    cy={lY}
                    r={nodeRadius + 4}
                    fill="none"
                    stroke="#18181b"
                    strokeWidth="1.2"
                    opacity="0.4"
                  />
                  <circle
                    cx={leftX}
                    cy={lY}
                    r={nodeRadius}
                    fill="#ffffff"
                    stroke="#18181b"
                    strokeWidth="2"
                  />
                  <text
                    x={leftX}
                    y={lY + 4}
                    textAnchor="middle"
                    fill="#18181b"
                    className="font-sans text-[10px] font-bold uppercase"
                  >
                    {rowName.substring(0, 3)}
                  </text>
                  <text
                    x={leftX - 32}
                    y={lY + 4}
                    textAnchor="end"
                    fill="#71717a"
                    className="font-sans text-[10px] font-bold font-mono uppercase tracking-wider"
                  >
                    {rowName}
                  </text>
                </g>
              );
            })}

            {/* Right nodes (Postes columns) */}
            {rightNodes.map((colName, idx) => {
              const rY = getRightY(idx);
              return (
                <g key={`right-node-${idx}`}>
                  {/* Outer glowing border if matched */}
                  <circle
                    cx={rightX}
                    cy={rY}
                    r={nodeRadius + 4}
                    fill="none"
                    stroke="#18181b"
                    strokeWidth="1.2"
                    opacity="0.4"
                  />
                  <circle
                    cx={rightX}
                    cy={rY}
                    r={nodeRadius}
                    fill="#ffffff"
                    stroke="#18181b"
                    strokeWidth="2"
                  />
                  <text
                    x={rightX}
                    y={rY + 4}
                    textAnchor="middle"
                    fill="#18181b"
                    className="font-sans text-[10px] font-bold uppercase"
                  >
                    {colName.substring(0, 3)}
                  </text>
                  <text
                    x={rightX + 32}
                    y={rY + 4}
                    textAnchor="start"
                    fill="#71717a"
                    className="font-sans text-[10px] font-bold font-mono uppercase tracking-wider"
                  >
                    {colName}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
