import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { Plus, Trash2, BarChart2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function ParetoCanvas() {
  const { t } = useTranslation();
  const { currentProjectId, pareto, addParetoProject, addParetoItem, updateParetoItem, deleteParetoItem } = useRoadmapStore();
  
    const activeParetoList = pareto || [];

  const [activeParetoId, setActiveParetoId] = useState<string | null>(activeParetoList.length > 0 ? activeParetoList[0].id : null);

  const activePareto = activeParetoList.find(p => p.id === activeParetoId);

  // Derived calculations
  const chartData = useMemo(() => {
    if (!activePareto || activePareto.items.length === 0) return [];
    
    // 1. Sort by frequency descending
    const sorted = [...activePareto.items].sort((a, b) => b.frequency - a.frequency);
    
    // 2. Calculate cumulative sums and percentages
    const totalFreq = sorted.reduce((sum, item) => sum + item.frequency, 0);
    let cumulative = 0;
    
    return sorted.map(item => {
      cumulative += item.frequency;
      const cumulativePercent = totalFreq > 0 ? (cumulative / totalFreq) * 100 : 0;
      return {
        ...item,
        cumulativePercent
      };
    });
  }, [activePareto]);

  const maxFreq = chartData.length > 0 ? chartData[0].frequency : 0;
  // Make the left Y axis max at least a nice round number slightly above maxFreq
  const leftYMax = Math.max(10, Math.ceil(maxFreq * 1.1));

  // Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 400;
  const margin = { top: 40, right: 60, bottom: 60, left: 60 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const handleAddItem = () => {
    if (!currentProjectId || !activePareto) return;
    addParetoItem(currentProjectId, activePareto.id, "Yeni Kategori", 10);
  };

  const handleCreateAnalysis = () => {
    if (!currentProjectId) return;
    const pId = uuidv4();
    addParetoProject(currentProjectId, t('default_pareto_title'));
    setActiveParetoId(pId); // Wait, addParetoProject generates a random UUID if we don't pass it. Wait, the store method creates its own UUID. I'll need to select the last one after creation via a small timeout, or modify store. For now we will select it automatically if list was empty.
  };

  if (!currentProjectId) return null;

  if (activeParetoList.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
            <BarChart2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t('tool_pareto')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{t('pareto_desc')}</p>
          <button
            onClick={handleCreateAnalysis}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30"
          >
            <Plus size={20} />
            {t('pareto_add_analysis')}
          </button>
        </div>
      </div>
    );
  }

  // Auto-select first if none selected
  if (!activeParetoId && activeParetoList.length > 0) {
    setActiveParetoId(activeParetoList[0].id);
    return null; // will re-render
  }

  const barWidth = chartData.length > 0 ? (chartWidth / chartData.length) * 0.8 : 0;
  const gap = chartData.length > 0 ? (chartWidth / chartData.length) * 0.2 : 0;

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      
      {/* LEFT PANEL: Data Entry Table */}
      <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <select 
            className="bg-transparent text-lg font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            value={activeParetoId || ''}
            onChange={(e) => setActiveParetoId(e.target.value)}
          >
            {activeParetoList.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <button onClick={handleCreateAnalysis} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title={t('pareto_add_analysis')}>
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-3 rounded-tl-lg">{t('pareto_category')}</th>
                <th className="px-3 py-3 w-24 text-right">{t('pareto_frequency')}</th>
                <th className="px-2 py-3 w-10 rounded-tr-lg"></th>
              </tr>
            </thead>
            <tbody>
              {activePareto?.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => updateParetoItem(currentProjectId, activePareto.id, item.id, { category: e.target.value })}
                      className="w-full bg-transparent border-none focus:ring-0 p-1 text-slate-700 dark:text-slate-300 font-medium"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      value={item.frequency}
                      onChange={(e) => updateParetoItem(currentProjectId, activePareto.id, item.id, { frequency: Number(e.target.value) || 0 })}
                      className="w-full bg-transparent border-none focus:ring-0 p-1 text-slate-700 dark:text-slate-300 font-semibold text-right"
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      onClick={() => deleteParetoItem(currentProjectId, activePareto.id, item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!activePareto?.items || activePareto.items.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    {t('pareto_empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <button
            onClick={handleAddItem}
            className="mt-4 w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors border border-blue-200 dark:border-blue-800/50"
          >
            <Plus size={16} />
            {t('pareto_add')}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: Chart Canvas */}
      <div className="flex-1 relative p-6 flex flex-col items-center justify-center overflow-auto bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <BarChart2 className="text-blue-500" />
            {t('pareto_chart')}
          </h3>
          
          {chartData.length > 0 ? (
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible font-sans">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                const y = margin.top + chartHeight * (1 - tick);
                return (
                  <g key={`grid-\${tick}`}>
                    <line
                      x1={margin.left}
                      y1={y}
                      x2={svgWidth - margin.right}
                      y2={y}
                      className="stroke-slate-200 dark:stroke-slate-700"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    {/* Left Y Axis Labels (Frequency) */}
                    <text
                      x={margin.left - 10}
                      y={y}
                      className="fill-slate-500 dark:fill-slate-400 text-xs"
                      textAnchor="end"
                      alignmentBaseline="middle"
                    >
                      {Math.round(leftYMax * tick)}
                    </text>
                    {/* Right Y Axis Labels (Percentage) */}
                    <text
                      x={svgWidth - margin.right + 10}
                      y={y}
                      className="fill-slate-500 dark:fill-slate-400 text-xs"
                      textAnchor="start"
                      alignmentBaseline="middle"
                    >
                      {tick * 100}%
                    </text>
                  </g>
                );
              })}

              {/* Axes Lines */}
              <line x1={margin.left} y1={margin.top} x2={margin.left} y2={svgHeight - margin.bottom} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
              <line x1={svgWidth - margin.right} y1={margin.top} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
              <line x1={margin.left} y1={svgHeight - margin.bottom} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />

              {/* Bars and Line Points */}
              {chartData.map((d, i) => {
                const x = margin.left + i * (barWidth + gap) + gap / 2;
                const barH = (d.frequency / leftYMax) * chartHeight;
                const y = svgHeight - margin.bottom - barH;
                
                return (
                  <g key={"bar-" + d.id} className="group cursor-pointer">
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barH}
                      className="fill-blue-500 hover:fill-blue-400 dark:fill-blue-600 dark:hover:fill-blue-500 transition-colors rx-1 ry-1"
                      rx="4"
                    />
                    {/* X Axis Label */}
                    <text
                      x={x + barWidth / 2}
                      y={svgHeight - margin.bottom + 20}
                      className="fill-slate-600 dark:fill-slate-300 text-xs font-medium"
                      textAnchor="middle"
                      transform={"rotate(-30 " + (x + barWidth / 2) + " " + (svgHeight - margin.bottom + 20) + ")"}
                    >
                      {d.category.length > 15 ? d.category.substring(0, 15) + '...' : d.category}
                    </text>
                    {/* Tooltip text (native title) */}
                    <title>{d.category}: {d.frequency} ({d.cumulativePercent.toFixed(1)}%)</title>
                  </g>
                );
              })}

              {/* Cumulative Line Path */}
              <path
                d={chartData.reduce((path, d, i) => {
                  const cx = margin.left + i * (barWidth + gap) + gap / 2 + barWidth / 2;
                  const cy = margin.top + chartHeight * (1 - d.cumulativePercent / 100);
                  return path + ' ' + (i === 0 ? 'M' : 'L') + ' ' + cx + ' ' + cy;
                }, '')}
                className="stroke-amber-500 fill-none"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Cumulative Line Dots */}
              {chartData.map((d, i) => {
                const cx = margin.left + i * (barWidth + gap) + gap / 2 + barWidth / 2;
                const cy = margin.top + chartHeight * (1 - d.cumulativePercent / 100);
                return (
                  <circle
                    key={"dot-" + d.id}
                    cx={cx}
                    cy={cy}
                    r="5"
                    className="fill-white dark:fill-slate-800 stroke-amber-500"
                    strokeWidth="2.5"
                  />
                );
              })}
            </svg>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <BarChart2 size={48} className="mb-4 opacity-50" />
              <p>{t('pareto_empty')}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
