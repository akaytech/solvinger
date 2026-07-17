import { Network, Activity, Target, Fish, RefreshCcw, Layers } from 'lucide-react';
import { useRoadmapStore } from '../store/useRoadmapStore';

export default function WelcomeScreen() {
  const { setActiveTool } = useRoadmapStore();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-2xl text-center">
        <div className="mb-8 flex justify-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-xl shadow-indigo-500/10 transition-transform hover:scale-105">
            <Network size={48} />
          </div>
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-xl shadow-emerald-500/10 transition-transform hover:scale-105">
            <Activity size={48} />
          </div>
        </div>
        
        <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-800 dark:text-slate-100 md:text-5xl">
          Solvinger Araç Çantası
        </h1>
        <p className="mb-12 text-lg text-slate-600 dark:text-slate-400">
          Proje yönetimi ve problem çözme metodolojilerini tek bir platformda birleştirin. Başlamak için kullanmak istediğiniz aracı seçin.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => setActiveTool('wbs')}
            className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-indigo-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-indigo-500"
          >
            <Network size={40} className="mb-4 text-slate-400 transition-colors group-hover:text-indigo-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">İş Kırılım Yapısı (WBS)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Karmaşık hedefleri küçük, yönetilebilir görevlere bölün ve haritalandırın.</p>
          </button>

          <button
            onClick={() => setActiveTool('5whys')}
            className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-emerald-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-emerald-500"
          >
            <Activity size={40} className="mb-4 text-slate-400 transition-colors group-hover:text-emerald-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">5 Neden Analizi</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Bir sorunun kök nedenini bulmak için 5 kez neden sorusunu sorun.</p>
          </button>

          <button
            onClick={() => setActiveTool('swot')}
            className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-rose-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-rose-500"
          >
            <Target size={40} className="mb-4 text-slate-400 transition-colors group-hover:text-rose-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">SWOT Analizi</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Projenizin güçlü, zayıf yönlerini, fırsat ve tehditlerini değerlendirin.</p>
          </button>

          <button
            onClick={() => setActiveTool('ishikawa')}
            className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-cyan-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-cyan-500"
          >
            <Fish size={40} className="mb-4 text-slate-400 transition-colors group-hover:text-cyan-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">Ishikawa (Balık Kılçığı)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Problemin kök nedenlerini 6M kategorilerine göre sistematik olarak ayrıştırın.</p>
          </button>

          <button
            onClick={() => setActiveTool('pdca')}
            className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-indigo-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-indigo-500"
          >
            <RefreshCcw size={40} className="mb-4 text-slate-400 transition-colors group-hover:text-indigo-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">PUKÖ Döngüsü</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Planla, Uygula, Kontrol Et, Önlem Al adımlarıyla sürekli iyileştirme sağlayın.</p>
          </button>

          <button
            onClick={() => setActiveTool('waterfall')}
            className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-blue-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-blue-500"
          >
            <Layers size={40} className="mb-4 text-slate-400 transition-colors group-hover:text-blue-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">Şelale (Waterfall)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gereksinim, Tasarım, Geliştirme, Test ve Bakım fazlarıyla projenizi sıralı yönetin.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
