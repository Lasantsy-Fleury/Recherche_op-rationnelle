import React from 'react';
import { SolverStep } from '../types';
import { Info, HelpCircle, Activity, Lightbulb } from 'lucide-react';

interface StepDescriptionProps {
  step: SolverStep;
}

export const StepDescription: React.FC<StepDescriptionProps> = ({ step }) => {
  const { title, description, totalCostBound, columnMinimums, rowMinimums, uncoveredMin } = step;

  // Render contextual tip based on step title
  const getContextualTip = () => {
    if (title.includes("d'Origine")) {
      return "Cette matrice modélise les affinités initiales. Une valeur élevée peut représenter un coût élevé (à minimiser) ou un profit élevé (à maximiser).";
    }
    if (title.includes("Minimums de colonnes")) {
      return "Kuhn et Munkres ont démontré qu'on ne change pas l'affectation optimale en soustrayant une constante d'une colonne de coûts.";
    }
    if (title.includes("Réduction des colonnes") || title.includes("Réduction des lignes")) {
      return "En créant des zéros, on fait apparaître des solutions potentielles à coût additionnel nul. Notre borne inférieure de départ s'établit à la somme des soustractions.";
    }
    if (title.includes("Couplage des zéros")) {
      return "On cherche à associer chaque candidat à un poste unique sur une case d'opportunité nulle (valeur '0'). Si on y parvient pour chaque ligne, la solution est optimale !";
    }
    if (title.includes("support minimal")) {
      return "On cherche à couvrir TOUS les zéros du tableau avec le minimum de lignes et de colonnes possible (Théorème du Couplage de König). S'il faut moins de lignes que la dimension de la matrice, le couplage n'est pas encore saturé.";
    }
    if (title.includes("Ajustement de la matrice")) {
      return "Pour sortir de l'impasse, on décale les coûts: on ajoute la plus petite valeur non couverte aux double-couvertures et on la soustrait aux zones vierges pour créer de nouveaux zéros.";
    }
    if (title.includes("optimal atteint")) {
      return "Félicitations ! Chaque ressource a été affectée à son poste optimal unique avec un coût total minimal garanti.";
    }
    return "Consultez le tableau pour observer l'évolution géométrique des coefficients.";
  };

  return (
    <div className="bg-white border border-zinc-200 rounded p-6 flex flex-col gap-4 shadow-xs" id="step-description-panel">
      {/* Step heading title and cost metrics */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded bg-zinc-900 text-white flex items-center justify-center">
            <Activity size={15} />
          </div>
          <h4 className="font-sans font-bold text-zinc-950 text-xs sm:text-sm uppercase tracking-tight">{title}</h4>
        </div>
        {totalCostBound !== undefined && (
          <span className="text-xs font-mono font-bold bg-zinc-50 text-zinc-600 rounded px-2.5 py-1 border border-zinc-200 shadow-xs">
            Coût : <span className="text-zinc-900 font-extrabold">{totalCostBound}</span>
          </span>
        )}
      </div>

      {/* Main explanation description text */}
      <p className="text-zinc-600 text-xs leading-relaxed font-sans">{description}</p>

      {/* Theoretical math advice tooltip */}
      <div className="flex gap-2.5 items-start bg-zinc-50 p-4 rounded border border-zinc-200 mt-1">
        <Lightbulb size={16} className="text-zinc-700 shrink-0 mt-0.5" />
        <p className="text-zinc-600 text-xs leading-relaxed">
          <span className="font-bold text-zinc-900 uppercase tracking-wide text-[10px] block mb-1">Note Méthodologique :</span> {getContextualTip()}
        </p>
      </div>

      {/* Intermediate values display — shown when minima are present */}
      {(columnMinimums && columnMinimums.length > 0) || (rowMinimums && rowMinimums.length > 0) ? (
        <div className="flex flex-col gap-2 mt-1">
          {columnMinimums && columnMinimums.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-red-600 font-mono uppercase tracking-wider">Min colonnes :</span>
              <span className="font-mono font-bold text-red-600">
                [{columnMinimums.join(', ')}]
              </span>
              <span className="text-zinc-400 font-mono">
                (Σ = {columnMinimums.reduce((a, b) => a + b, 0)})
              </span>
            </div>
          )}
          {rowMinimums && rowMinimums.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-red-600 font-mono uppercase tracking-wider">Min lignes :</span>
              <span className="font-mono font-bold text-red-600">
                [{rowMinimums.join(', ')}]
              </span>
              <span className="text-zinc-400 font-mono">
                (Σ = {rowMinimums.reduce((a, b) => a + b, 0)})
              </span>
            </div>
          )}
        </div>
      ) : null}

      {/* Uncovered minimum display */}
      {uncoveredMin !== undefined ? (
        <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded px-3 py-2">
          <span className="font-bold text-red-600 font-mono uppercase tracking-wider text-xs">Min non couvert :</span>
          <span className="font-mono font-extrabold text-red-600 text-sm">{uncoveredMin}</span>
        </div>
      ) : null}
    </div>
  );
};
