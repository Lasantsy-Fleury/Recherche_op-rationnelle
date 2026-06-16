import React, { useEffect, useState, useRef } from 'react';
import { SolverStep } from '../types';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, FastForward, Info, HelpCircle } from 'lucide-react';

interface StepNavigatorProps {
  steps: SolverStep[];
  currentIdx: number;
  onIdxChange: (idx: number) => void;
}

export const StepNavigator: React.FC<StepNavigatorProps> = ({ steps, currentIdx, onIdxChange }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playDelay, setPlayDelay] = useState<number>(1800); // 1.8s
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentIdx < steps.length - 1) {
          onIdxChange(currentIdx + 1);
        } else {
          setIsPlaying(false); // Stop when reached end
        }
      }, playDelay);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIdx, steps.length, playDelay]);

  const handleNext = () => {
    setIsPlaying(false);
    if (currentIdx < steps.length - 1) {
      onIdxChange(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentIdx > 0) {
      onIdxChange(currentIdx - 1);
    }
  };

  const handleFirst = () => {
    setIsPlaying(false);
    onIdxChange(0);
  };

  const handleLast = () => {
    setIsPlaying(false);
    onIdxChange(steps.length - 1);
  };

  const togglePlay = () => {
    if (currentIdx === steps.length - 1) {
      // If at end, loop back to first on play click
      onIdxChange(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-white rounded border border-zinc-200 p-5 shadow-xs flex flex-col justify-between items-stretch gap-4 no-print" id="step-navigator">
      
      {/* Index Progress Bar metric */}
      <div className="flex flex-col gap-1 items-start w-full">
        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Progression du calcul</span>
        <div className="flex items-center gap-2 w-full">
          <span className="font-mono text-xs font-bold text-zinc-800 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
            {currentIdx + 1} / {steps.length}
          </span>
          <div className="h-1 w-full bg-zinc-250 rounded overflow-hidden">
            <div
              className="h-full bg-zinc-900 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main navigation Button cluster */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          onClick={handleFirst}
          disabled={currentIdx === 0}
          className="p-2 rounded border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-20 text-zinc-700 transition-all cursor-pointer shadow-xs"
          title="Première étape"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="p-2 rounded border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-20 text-zinc-700 transition-all cursor-pointer shadow-xs"
          title="Étape précédente"
        >
          <ChevronLeft size={14} />
        </button>
        
        {/* Play/Pause state button */}
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 px-5 py-2.5 rounded bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer shadow-xs"
        >
          {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          {isPlaying ? 'Pause' : 'Lecture Auto'}
        </button>

        <button
          onClick={handleNext}
          disabled={currentIdx === steps.length - 1}
          className="p-2 rounded border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-20 text-zinc-700 transition-all cursor-pointer shadow-xs"
          title="Étape suivante"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={handleLast}
          disabled={currentIdx === steps.length - 1}
          className="p-2 rounded border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-20 text-zinc-700 transition-all cursor-pointer shadow-xs"
          title="Dernière étape (Solution)"
        >
          <FastForward size={14} />
        </button>
      </div>

      {/* Speed play slider settings */}
      <div className="flex flex-col gap-1 items-end w-full">
        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Vitesse de lecture</span>
        <div className="flex items-center gap-2.5 w-full">
          <span className="text-[10px] font-mono font-bold text-zinc-500">{(playDelay / 1000).toFixed(1)}s / pas</span>
          <input
            type="range"
            min="600"
            max="4000"
            step="200"
            value={playDelay}
            onChange={(e) => setPlayDelay(parseInt(e.target.value))}
            className="w-full accent-zinc-900 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
