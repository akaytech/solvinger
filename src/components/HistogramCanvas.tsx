import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useShallow } from 'zustand/react/shallow';
import { Plus, Trash2, BarChart } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function HistogramCanvas() {
  const { t } = useTranslation();
  const {  currentProjectId, histogram, addHistogramProject, addHistogramItem, updateHistogramItem, deleteHistogramItem  } = useRoadmapStore(useShallow((state) => ({
      currentProjectId: state.currentProjectId,
      histogram: state.histogram,
      addHistogramProject: state.addHistogramProject,
      addHistogramItem: state.addHistogramItem,
      updateHistogramItem: state.updateHistogramItem,
      deleteHistogramItem: state.deleteHistogramItem
    })));
  
  const activeHistogramList = histogram || [];

  const [activeHistogramId, setActiveHistogramId] = useState<string | null>(activeHistogramList.length > 0 ? activeHistogramList[0].id : null);

  const activeHistogram = activeHistogramList.find(p => p.id === activeHistogramId);

  // Derived calculations (NO SORTING FOR HISTOGRAM!)
  const chartData = useMemo(() => {
    if (!activeHistogram || activeHistogram.items.length === 0) return [];
    // Keep items in original order for histogram.
    return activeHistogram.items;
  }, [activeHistogram]);

  const maxFreq = chartData.length > 0 ? Math.max(...chartData.map(d => d.frequency)) : 0;
  // Make the left Y axis max at least a nice round number slightly above maxFreq
  const leftYMax = Math.max(10, Math.ceil(maxFreq * 1.1));

  // Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 400;
  const margin = { top: 40, right: 60, bottom: 60, left: 60 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const handleAddItem = () => {
    if (!currentProjectId || !activeHistogram) return;
    addHistogramItem(currentProjectId, activeHistogram.id, t('histogram_category') + "...", 10);
  };

  const handleCreateAnalysis = () => {
    if (!currentProjectId) return;
    const pId = uuidv4();
    addHistogramProject(currentProjectId, pId, t('default_histogram_title'));
    setActiveHistogramId(pId);
  };

  if (!currentProjectId) return null;

  if (activeHistogramList.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
            <BarChart size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t('tool_histogram')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{t('histogram_desc')}</p>
          <button
            onClick={handleCreateAnalysis}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30"
          >
            <Plus size={20} />
            {t('histogram_add_analysis')}
          </button>
        </div>
      </div>
    );
  }

  // Auto-select first if none selected
  if (!activeHistogramId && activeHistogramList.length > 0) {
    setActiveHistogramId(activeHistogramList[0].id);
    return null;
  }

  // Width is fully utilized (no gaps) to mimic a histogram distribution
  const barWidth = chartData.length > 0 ? (chartWidth / chartData.length) : 0;
  // Gap is extremely small (1px) just for visual separation, or 0.
  const gap = 2; 
  const actualBarWidth = Math.max(1, barWidth - gap);

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      
      {/* LEFT PANEL: Data Entry Table */}
      <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <select 
            className="bg-transparent text-lg font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            value={activeHistogramId || ''}
            onChange={(e) => setActiveHistogramId(e.target.value)}
          >
            {activeHistogramList.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <button onClick={handleCreateAnalysis} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title={t('histogram_add_analysis')}>
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-3 rounded-tl-lg">{t('histogram_category')}</th>
                <th className="px-3 py-3 w-24 text-right">{t('histogram_frequency')}</th>
                <th className="px-2 py-3 w-10 rounded-tr-lg"></th>
              </tr>
            </thead>
            <tbody>
              {activeHistogram?.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => updateHistogramItem(currentProjectId, activeHistogram.id, item.id, { category: e.target.value })}
                      className="w-full bg-transparent border-none focus:ring-0 p-1 text-slate-700 dark:text-slate-300 font-medium"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      value={item.frequency}
                      onChange={(e) => updateHistogramItem(currentProjectId, activeHistogram.id, item.id, { frequency: Number(e.target.value) || 0 })}
                      className="w-full bg-transparent border-none focus:ring-0 p-1 text-slate-700 dark:text-slate-300 font-semibold text-right"
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      onClick={() => deleteHistogramItem(currentProjectId, activeHistogram.id, item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!activeHistogram?.items || activeHistogram.items.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    {t('histogram_empty')}
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
            {t('histogram_add')}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: Chart Canvas */}
      <div className="flex-1 relative p-6 flex flex-col items-center justify-center overflow-auto bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <BarChart className="text-blue-500" />
            {t('histogram_chart')}
          </h3>
          
          {chartData.length > 0 ? (
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible font-sans">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                const y = margin.top + chartHeight * (1 - tick);
                return (
                  <g key={`grid-${tick}`}>
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
                  </g>
                );
              })}

              {/* Axes Base Lines */}
              <line x1={margin.left} y1={svgHeight - margin.bottom} x2={svgWidth - margin.right} y2={svgHeight - margin.bottom} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" />
              <line x1={margin.left} y1={margin.top} x2={margin.left} y2={svgHeight - margin.bottom} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" />

              {/* Bars and X-axis Labels */}
              {chartData.map((d, i) => {
                const x = margin.left + i * barWidth;
                const barH = leftYMax > 0 ? (d.frequency / leftYMax) * chartHeight : 0;
                const y = svgHeight - margin.bottom - barH;

                return (
                  <g key={d.id} className="group/bar">
                    {/* Bar Area */}
                    <rect
                      x={x + gap / 2}
                      y={y}
                      width={actualBarWidth}
                      height={barH}
                      className="fill-blue-500 dark:fill-blue-600 transition-all duration-300 group-hover/bar:fill-blue-400 dark:group-hover/bar:fill-blue-500 group-hover/bar:stroke-blue-300 stroke-[2px] stroke-transparent"
                      rx={2}
                      ry={2}
                    />
                    
                    {/* Hover Value Tooltip-like text above bar */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 8}
                      className="fill-blue-700 dark:fill-blue-300 text-xs font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity"
                      textAnchor="middle"
                    >
                      {d.frequency}
                    </text>

                    {/* X-axis Label */}
                    <text
                      x={x + barWidth / 2}
                      y={svgHeight - margin.bottom + 20}
                      className="fill-slate-600 dark:fill-slate-400 text-[10px] font-medium"
                      textAnchor="middle"
                      transform={`rotate(-30, ${x + barWidth / 2}, ${svgHeight - margin.bottom + 20})`}
                    >
                      {d.category.length > 12 ? d.category.substring(0, 10) + '...' : d.category}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <BarChart size={48} className="mb-4 opacity-20" />
              <p>{t('histogram_empty')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
