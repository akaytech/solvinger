import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Trophy, Scale } from 'lucide-react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import type { DecisionMatrixProject } from '../store/useRoadmapStore';

interface DecisionMatrixCanvasProps {
  project: DecisionMatrixProject;
}

export const DecisionMatrixCanvas: React.FC<DecisionMatrixCanvasProps> = ({ project }) => {
  const { t } = useTranslation();
  const { 
    updateDecisionProjectName,
    addDecisionCriteria,
    updateDecisionCriteria,
    deleteDecisionCriteria,
    addDecisionOption,
    updateDecisionOptionName,
    deleteDecisionOption,
    updateDecisionScore
   } = useRoadmapStore(useShallow((state) => ({
      updateDecisionProjectName: state.updateDecisionProjectName,
      addDecisionCriteria: state.addDecisionCriteria,
      updateDecisionCriteria: state.updateDecisionCriteria,
      deleteDecisionCriteria: state.deleteDecisionCriteria,
      addDecisionOption: state.addDecisionOption,
      updateDecisionOptionName: state.updateDecisionOptionName,
      deleteDecisionOption: state.deleteDecisionOption,
      updateDecisionScore: state.updateDecisionScore
    })));

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  // Calculate totals
  const totals = project.options.map(option => {
    let total = 0;
    project.criteria.forEach(criteria => {
      const score = option.scores[criteria.id] || 0;
      total += score * criteria.weight;
    });
    return { id: option.id, total };
  });

  const maxScore = Math.max(...totals.map(t => t.total), 0);

  const handleAddCriteria = () => {
    addDecisionCriteria(project.id, t('decision_criteria_name'), 3);
  };

  const handleAddOption = () => {
    addDecisionOption(project.id, t('decision_option_name'));
  };

  const handleScoreChange = (optionId: string, criteriaId: string, value: string) => {
    let score = parseInt(value, 10);
    if (isNaN(score)) score = 0;
    if (score < 0) score = 0;
    if (score > 10) score = 10;
    updateDecisionScore(project.id, optionId, criteriaId, score);
  };

  const handleWeightChange = (criteriaId: string, name: string, value: string) => {
    let weight = parseInt(value, 10);
    if (isNaN(weight)) weight = 1;
    if (weight < 1) weight = 1;
    if (weight > 5) weight = 5;
    updateDecisionCriteria(project.id, criteriaId, name, weight);
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 overflow-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-150" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
                <Scale size={28} className="text-indigo-500" />
                {t('decision_title')}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                {t('decision_desc')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddCriteria}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all active:scale-95 font-medium text-sm"
              >
                <Plus size={16} />
                {t('decision_add_criteria')}
              </button>
              <button
                onClick={handleAddOption}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 font-medium text-sm"
              >
                <Plus size={16} />
                {t('decision_add_option')}
              </button>
            </div>
          </div>
        </div>

        {/* Editable Workspace Name */}
        <div className="px-2 mt-4">
          <input
            type="text"
            value={project.name}
            onChange={(e) => updateDecisionProjectName(project.id, e.target.value)}
            className="text-xl font-bold bg-transparent border-none outline-none focus:ring-0 text-slate-800 dark:text-white placeholder-slate-400 p-0 w-full transition-colors"
            placeholder={t('fta_title_input')}
          />
        </div>

        {project.criteria.length === 0 && project.options.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Scale size={48} className="mb-4 opacity-20" />
            <p>{t('decision_empty')}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr>
                  {/* Top-Left Corner (Criteria/Weight Headers) */}
                  <th className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-r border-slate-200 dark:border-slate-700 sticky left-0 z-10 w-64 min-w-[16rem]">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('decision_criteria_name')}</span>
                    </div>
                  </th>
                  <th className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-r border-slate-200 dark:border-slate-700 w-24 min-w-[6rem] text-center">
                    <div className="flex flex-col items-center gap-1 justify-center">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('decision_criteria_weight')}</span>
                    </div>
                  </th>
                  
                  {/* Option Headers */}
                  {project.options.map((option) => (
                    <th 
                      key={option.id}
                      className={`p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-r border-slate-200 dark:border-slate-700 min-w-[12rem] transition-colors ${hoveredCol === option.id ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}
                      onMouseEnter={() => setHoveredCol(option.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <div className="flex items-center justify-between gap-2 group/opt">
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => updateDecisionOptionName(project.id, option.id, e.target.value)}
                          className="bg-transparent border-none outline-none focus:ring-0 font-medium text-slate-700 dark:text-slate-200 w-full p-0"
                        />
                        <button
                          onClick={() => deleteDecisionOption(project.id, option.id)}
                          className="opacity-0 group-hover/opt:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Criteria Rows */}
                {project.criteria.map((criteria) => (
                  <tr 
                    key={criteria.id}
                    className={`transition-colors ${hoveredRow === criteria.id ? 'bg-slate-50 dark:bg-slate-700/30' : ''}`}
                    onMouseEnter={() => setHoveredRow(criteria.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Criteria Name */}
                    <td className="p-4 border-b border-r border-slate-200 dark:border-slate-700 sticky left-0 z-10 bg-white dark:bg-slate-800 group/crit">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={criteria.name}
                          onChange={(e) => updateDecisionCriteria(project.id, criteria.id, e.target.value, criteria.weight)}
                          className="bg-transparent border-none outline-none focus:ring-0 text-slate-700 dark:text-slate-300 w-full p-0"
                        />
                        <button
                          onClick={() => deleteDecisionCriteria(project.id, criteria.id)}
                          className="opacity-0 group-hover/crit:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                    
                    {/* Criteria Weight */}
                    <td className="p-4 border-b border-r border-slate-200 dark:border-slate-700 text-center">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={criteria.weight}
                        onChange={(e) => handleWeightChange(criteria.id, criteria.name, e.target.value)}
                        className="w-16 text-center bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-indigo-600 dark:text-indigo-400 font-semibold focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Scores for each option */}
                    {project.options.map((option) => (
                      <td 
                        key={`${criteria.id}-${option.id}`}
                        className={`p-4 border-b border-r border-slate-200 dark:border-slate-700 transition-colors ${hoveredCol === option.id ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}
                        onMouseEnter={() => setHoveredCol(option.id)}
                        onMouseLeave={() => setHoveredCol(null)}
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            placeholder="-"
                            value={option.scores[criteria.id] || ''}
                            onChange={(e) => handleScoreChange(option.id, criteria.id, e.target.value)}
                            className="w-full max-w-[5rem] text-center bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 transition-all hover:bg-white dark:hover:bg-slate-700"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Total Score Row */}
                {project.criteria.length > 0 && project.options.length > 0 && (
                  <tr>
                    <td 
                      colSpan={2} 
                      className="p-4 border-t-2 border-r border-slate-200 dark:border-slate-700 sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300 text-end"
                    >
                      {t('decision_total_score')}:
                    </td>
                    {project.options.map((option) => {
                      const total = totals.find(t => t.id === option.id)?.total || 0;
                      const isWinner = total === maxScore && maxScore > 0;
                      
                      return (
                        <td 
                          key={`total-${option.id}`}
                          className={`p-4 border-t-2 border-r border-slate-200 dark:border-slate-700 text-center relative overflow-hidden transition-all duration-500 ${
                            isWinner 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                              : hoveredCol === option.id 
                                ? 'bg-indigo-50/50 dark:bg-indigo-500/5' 
                                : ''
                          }`}
                          onMouseEnter={() => setHoveredCol(option.id)}
                          onMouseLeave={() => setHoveredCol(null)}
                        >
                          {isWinner && (
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-100 to-transparent dark:from-emerald-500/10 pointer-events-none" />
                          )}
                          <div className="flex flex-col items-center justify-center gap-1 relative z-10">
                            <span className={`text-2xl font-black ${isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                              {total}
                            </span>
                            {isWinner && (
                              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider animate-bounce mt-1">
                                <Trophy size={14} />
                                Winner
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
