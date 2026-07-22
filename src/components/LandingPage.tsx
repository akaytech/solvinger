import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { useShallow } from 'zustand/react/shallow';
import { Network, Activity, Target, Fish, RefreshCcw, Layers, AlertOctagon, Scale, GitMerge, BarChart2, BarChart, ListTodo, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { t } = useTranslation();
  const setAuthModalOpen = useAuthStore(useShallow((state) => state.setAuthModalOpen));

  const tools = [
    { id: 'wbs', icon: Network, title: t('tool_wbs'), desc: t('wbs_desc'), color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/50' },
    { id: '5whys', icon: Activity, title: t('tool_5whys'), desc: t('whys_desc'), color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/50' },
    { id: 'swot', icon: Target, title: t('tool_swot'), desc: t('swot_desc'), color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/50' },
    { id: 'ishikawa', icon: Fish, title: t('tool_ishikawa'), desc: t('ishi_desc'), color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/50' },
    { id: 'pdca', icon: RefreshCcw, title: t('tool_pdca'), desc: t('pdca_desc'), color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/50' },
    { id: 'waterfall', icon: Layers, title: t('tool_waterfall'), desc: t('wf_desc'), color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/50' },
    { id: 'fta', icon: AlertOctagon, title: t('fta_title'), desc: t('fta_desc'), color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/50' },
    { id: 'decision', icon: Scale, title: t('decision_title'), desc: t('decision_desc'), color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/50' },
    { id: 'flowchart', icon: GitMerge, title: t('tool_flowchart'), desc: t('flowchart_desc'), color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/50' },
    { id: 'pareto', icon: BarChart2, title: t('tool_pareto'), desc: t('pareto_desc'), color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/50' },
    { id: 'histogram', icon: BarChart, title: t('tool_histogram'), desc: t('histogram_desc'), color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/50' },
    { id: 'eod', icon: ListTodo, title: t('tool_eod'), desc: t('eod_desc'), color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/50' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-y-auto overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Solvinger Logo" className="h-10 w-10 rounded-xl shadow-sm" />
            <span className="text-2xl font-black tracking-tight">Solvinger</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="rounded-full bg-slate-100 dark:bg-slate-800 px-6 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {t('login')}
            </button>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              {t('register')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-slate-50 dark:from-indigo-900/20 dark:via-slate-900 dark:to-slate-900"></div>
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/30 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            {t('welcome_msg')}
          </div>
          
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-8">
            {t('hero_title')}
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
            {t('hero_subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-slate-900 dark:bg-white px-8 py-4 text-lg font-bold text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 w-full sm:w-auto justify-center"
            >
              {t('register')} <ArrowRight size={20} />
            </button>
            <button
              onClick={() => {
                document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-8 py-4 text-lg font-bold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 w-full sm:w-auto justify-center"
            >
              Araçları Keşfet
            </button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-24 bg-white dark:bg-slate-950 relative border-t border-slate-100 dark:border-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Kapsamlı Analiz Araçları</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
              İster kök neden analizi yapın, ister risk değerlendirmesi... Projenizin ihtiyacı olan tüm modern yönetim araçları tek bir platformda elinizin altında.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool) => (
              <div 
                key={tool.id} 
                className="group relative flex flex-col items-start rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 transition-all hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-500/30 dark:hover:border-indigo-500/30"
              >
                <div className={`mb-6 h-14 w-14 rounded-2xl ${tool.bg} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <tool.icon size={28} className={tool.color} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">{tool.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {tool.desc}
                </p>
                <div className="mt-6 pt-6 mt-auto border-t border-slate-200 dark:border-slate-800 w-full">
                  <button 
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300"
                  >
                    Hemen Kullan <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-900"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Sürekli gelişmeye<br/>bugün başlayın.</h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-12">
            Sorunları çözmek ve stratejik kararlar almak hiç bu kadar kolay olmamıştı. Ekibinizle birlikte ücretsiz deneyin.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="rounded-full bg-white px-10 py-5 text-xl font-black text-indigo-600 shadow-2xl transition-transform hover:scale-105 active:scale-95"
          >
            Ücretsiz Hesap Oluştur
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Solvinger Logo" className="h-8 w-8 rounded-lg grayscale opacity-50" />
            <span className="text-lg font-bold text-slate-400">Solvinger</span>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Solvinger. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
      
    </div>
  );
}
