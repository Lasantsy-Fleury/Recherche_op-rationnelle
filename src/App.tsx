import { useState } from 'react';
import { SolverStep, SolverMode } from './types';
import { MatrixInput } from './components/MatrixInput';
import { MatrixVisualizer } from './components/MatrixVisualizer';
import { StepNavigator } from './components/StepNavigator';
import { StepDescription } from './components/StepDescription';
import { ResultPanel } from './components/ResultPanel';
import { solveAssignment } from './utils/api';
import { exportToCSV, exportToJSON, exportToPNG } from './utils/export';
import { HelpCircle, ChevronLeft, Award, Activity, Percent, ArrowLeft, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'config' | 'solver'>('config');
  const [grid, setGrid] = useState<number[][]>([]);
  const [mode, setMode] = useState<SolverMode>('min');
  const [rows, setRows] = useState<string[]>([]);
  const [cols, setCols] = useState<string[]>([]);
  
  // Solver steps state
  const [steps, setSteps] = useState<SolverStep[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Trigger solver execution
  const handleSolve = async (matrixConfig: { grid: number[][]; mode: SolverMode; rows: string[]; cols: string[] }) => {
    setLoading(true);
    setGrid(matrixConfig.grid);
    setMode(matrixConfig.mode);
    setRows(matrixConfig.rows);
    setCols(matrixConfig.cols);

    try {
      // Calls full-stack solve API, falls back gracefully to in-browser calculate
      const computedSteps = await solveAssignment(matrixConfig.grid, matrixConfig.mode, {
        rows: matrixConfig.rows,
        cols: matrixConfig.cols
      });

      setSteps(computedSteps);
      setCurrentIdx(0);
      setViewMode('solver');
    } catch (err) {
      console.error("Solver error:", err);
      alert("Une erreur s'est produite lors de la résolution de la matrice.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToConfig = () => {
    setViewMode('config');
    setSteps([]);
    setCurrentIdx(0);
  };

  // Export utilities mapping
  const downloadCSV = () => {
    exportToCSV(grid, rows, cols, `matrice-${mode}.csv`);
  };

  const downloadJSON = () => {
    exportToJSON(grid, rows, cols, mode, `matrice-${mode}.json`);
  };

  const downloadPNG = () => {
    exportToPNG(grid, rows, cols, `matrice-${mode}.png`);
  };

  const printReport = () => {
    window.print();
  };

  const activeStep = steps[currentIdx];
  const isOptimalStep = activeStep?.isOptimal;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-900/15 selection:text-zinc-900 pb-12">
      
      {/* Top Navigation / Header compliant with Geometric theme */}
      <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-6 md:px-8 shrink-0 no-print">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 flex items-center justify-center text-white rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
          </div>
          <span className="font-bold tracking-tight uppercase text-xs sm:text-sm text-zinc-900">AFFECTATION OPTIMALE</span>
          <div className="h-4 w-[1px] bg-zinc-200 mx-2 hidden sm:block"></div>
          <span className="text-[10px] text-zinc-400 font-mono hidden sm:block uppercase">Recherche Opérationnelle</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 font-mono">
          <span>UTC: 2026-06-01</span>
        </div>
      </header>

      {/* Main Page Layout Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
        
        {loading && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-xl flex flex-col items-center gap-4">
              <RefreshCw className="text-zinc-900 animate-spin" size={28} />
              <span className="font-semibold text-zinc-800 text-sm">Calcul des étapes optimales en cours...</span>
            </div>
          </div>
        )}

        {viewMode === 'config' ? (
          /* Matrix configuration Mode UI */
          <div className="animate-fade-in flex flex-col gap-6">
            <MatrixInput 
              onMatrixSubmit={handleSolve} 
              initialMatrix={grid.length > 0 ? { grid, mode, rows, cols } : undefined}
            />
          </div>
        ) : (
          /* Solver Steps playback Mode UI */
          <div className="flex flex-col gap-6 animate-fade-in" id="print-area">
            
            {/* Navigation back toolbar index */}
            <div className="flex justify-between items-center no-print">
              <button
                onClick={handleBackToConfig}
                className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 font-bold text-xs bg-white hover:bg-zinc-50 border border-zinc-200 px-4 py-2 rounded uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft size={14} />
                Ajuster la Matrice
              </button>

              <div className="text-zinc-400 text-xs font-mono font-medium flex items-center gap-2">
                <span>Minorant du coût d'affectation :</span>
                <span className="font-extrabold text-zinc-900 text-sm bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
                  B = {activeStep?.totalCostBound ?? 0}
                </span>
              </div>
            </div>

            {/* Core Interactive Layout Step stage */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              
              {/* Left pane: Descriptions + stepping triggers */}
              <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-4 justify-between">
                <StepDescription step={activeStep} />
                <StepNavigator 
                  steps={steps} 
                  currentIdx={currentIdx} 
                  onIdxChange={setCurrentIdx} 
                />
              </div>

              {/* Right pane: Matrix visualizer */}
              <div className="flex-1 flex min-h-[460px]">
                <MatrixVisualizer step={activeStep} />
              </div>

            </div>

            {/* Final Optimal Assignment report card */}
            {isOptimalStep && (
              <ResultPanel
                finalStep={activeStep}
                originalGrid={grid}
                onDownloadCSV={downloadCSV}
                onDownloadJSON={downloadJSON}
                onDownloadPNG={downloadPNG}
                onDownloadPDF={printReport}
              />
            )}
          </div>
        )}

        {/* Informative background description block, no-print */}
        {viewMode === 'config' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-zinc-200 rounded bg-white shadow-xs no-print">
            <div className="flex flex-col gap-3 p-6 md:p-8">
              <div className="h-8 w-8 bg-zinc-900 text-white rounded flex items-center justify-center font-bold text-xs">1</div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-900">1. Saisie des opportunités</h5>
              <p className="text-zinc-500 text-xs leading-relaxed">Remplissez les coûts d'affectation manuellement ou cliquez sur 'Matrice Type' pour charger des presets académiques.</p>
            </div>
            <div className="flex flex-col gap-3 p-6 md:p-8 border-t md:border-t-0 md:border-l border-zinc-200">
              <div className="h-8 w-8 bg-zinc-900 text-white rounded flex items-center justify-center font-bold text-xs">2</div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-900">2. Résolution pas-à-pas</h5>
              <p className="text-zinc-500 text-xs leading-relaxed">Naviguez ou lisez en boucle automatique les réductions par colonnes, par lignes, les couplages de König de la méthode Hongroise.</p>
            </div>
            <div className="flex flex-col gap-3 p-6 md:p-8 border-t md:border-t-0 md:border-l border-zinc-200">
              <div className="h-8 w-8 bg-zinc-900 text-white rounded flex items-center justify-center font-bold text-xs">3</div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-900">3. Couplages de graphes</h5>
              <p className="text-zinc-500 text-xs leading-relaxed">Générez un plan d'affectation optimal automatique, téléchargez les images des matrices et visualisez le couplage biparti résultant.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
