import React from 'react';

interface ToolHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor?: string;
  dividerOnTop?: boolean;
  children?: React.ReactNode;
}

export default function ToolHeader({ title, subtitle, icon, iconColor = 'text-indigo-500', dividerOnTop = false, children }: ToolHeaderProps) {
  if (dividerOnTop) {
    return (
      <div className="flex-none bg-white dark:bg-slate-900 z-10 flex flex-col">
        {/* Spacer for absolute top buttons */}
        <div className="h-20 w-full border-b border-slate-200 dark:border-slate-800"></div>
        {/* Header content below the line */}
        <div className="p-6 md:p-8 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className={iconColor}>
                {icon}
              </span>
              {title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{subtitle}</p>
          </div>
          {children && (
            <div className="flex items-center gap-3">
              {children}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-none pt-20 pb-6 pl-16 md:pl-16 pr-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className={iconColor}>
            {icon}
          </span>
          {title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{subtitle}</p>
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
