import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';

const GlobalExportButton: React.FC = () => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const activeTool = useRoadmapStore(s => s.activeTool);
  const { getNodes } = useReactFlow();

  if (!activeTool) return null;

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const isReactFlowTool = ['wbs', '5whys', 'fta', 'flowchart'].includes(activeTool);

      if (isReactFlowTool) {
        const nodes = getNodes();
        if (nodes.length === 0) {
          setIsExporting(false);
          toast.error(t('export_empty', { defaultValue: 'Nothing to export' }));
          return;
        }
        
        const nodesBounds = getNodesBounds(nodes);
        const padding = 50;
        nodesBounds.x -= padding;
        nodesBounds.y -= padding;
        nodesBounds.width += padding * 2;
        nodesBounds.height += padding * 2;
        
        const transform = getViewportForBounds(nodesBounds, nodesBounds.width, nodesBounds.height, 0.5, 2, 0);
        const element = document.querySelector('.react-flow__viewport') as HTMLElement;
        
        if (!element) throw new Error("ReactFlow viewport not found");
        
        // Wait for images or layout to stabilize
        await new Promise(resolve => setTimeout(resolve, 200));

        const dataUrl = await toPng(element, {
          cacheBust: true,
          backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
          width: nodesBounds.width,
          height: nodesBounds.height,
          style: {
            width: `${nodesBounds.width}px`,
            height: `${nodesBounds.height}px`,
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
          }
        });
        
        const a = document.createElement('a');
        a.download = `${activeTool}-export.png`;
        a.href = dataUrl;
        a.click();
        toast.success(t('export_success', { defaultValue: 'Exported successfully' }));
      } else {
        // HTML tool
        const element = document.querySelector('.flex-1.overflow-auto > div') || document.querySelector('.flex-1.overflow-auto');
        
        if (!element) {
          toast.error(t('export_empty', { defaultValue: 'Nothing to export' }));
          return;
        }
        
        // Temporarily ensure no scrollbars or clipped content in the capture
        const originalOverflow = (element as HTMLElement).style.overflow;
        const originalHeight = (element as HTMLElement).style.height;
        
        (element as HTMLElement).style.overflow = 'visible';
        (element as HTMLElement).style.height = 'auto';

        await new Promise(resolve => setTimeout(resolve, 200));
        
        const dataUrl = await toPng(element as HTMLElement, {
          cacheBust: true,
          backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
          style: { margin: '0' }
        });
        
        // Restore
        (element as HTMLElement).style.overflow = originalOverflow;
        (element as HTMLElement).style.height = originalHeight;
        
        const a = document.createElement('a');
        a.download = `${activeTool}-export.png`;
        a.href = dataUrl;
        a.click();
        toast.success(t('export_success', { defaultValue: 'Exported successfully' }));
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('export_failed', { defaultValue: 'Export failed' }));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium text-sm ${isExporting ? 'opacity-75 cursor-not-allowed' : ''}`}
      title={t('export_image')} aria-label={t('export_image')}
    >
      {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
      <span className="hidden sm:inline">{t('export_image')}</span>
    </button>
  );
};

export default GlobalExportButton;
