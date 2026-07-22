import React, { useState } from 'react';
import { Link, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRoadmapStore } from '../store/useRoadmapStore';

const GlobalShareButton: React.FC = () => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentProjectId = useRoadmapStore(s => s.currentProjectId);
  const activeTool = useRoadmapStore(s => s.activeTool);
  const setProjectPublic = useRoadmapStore(s => s.setProjectPublic);

  if (!currentProjectId || !activeTool) return null;

  const handleShare = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      await setProjectPublic(currentProjectId, true);
      const url = `${window.location.origin}${window.location.pathname}#/project/${currentProjectId}/${activeTool}`;
      await navigator.clipboard.writeText(url);
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to share:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isLoading}
      className={`absolute top-4 right-[250px] z-[100] flex items-center gap-2 bg-indigo-50/90 dark:bg-indigo-900/40 backdrop-blur-md px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-700 shadow-sm transition-colors text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-medium text-sm ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      title={t('share')}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : isCopied ? (
        <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Link size={18} />
      )}
      <span className="hidden sm:inline">
        {isCopied ? t('copied') : t('share')}
      </span>
    </button>
  );
};

export default GlobalShareButton;
