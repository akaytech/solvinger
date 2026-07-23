# Solvinger: Project Context & Agent Alignment

## 1. Proje Özeti
**Solvinger**, 10'dan fazla problem çözme ve karar verme metodolojisini (Ishikawa, Pareto, WBS, SWOT, EOD Planner vb.) tek bir çatı altında toplayan interaktif bir SaaS (Software as a Service) uygulamasıdır. Proje; **React 19, Vite, TypeScript** modern frontend stack'i ile inşa edilmiş olup, durum yönetimi için **Zustand**, akış şemaları ve ağaç yapıları için **@xyflow/react**, arka uç ve kimlik doğrulama işlemleri için **Firebase** (Auth, Firestore, Analytics) kullanmaktadır. Ayrıca **i18next** altyapısıyla 10 farklı dil (ar, de, en, es, fr, ja, pt, ru, tr, zh) desteklemektedir.

## 2. Çalışma Düzeni (Workflow)
Bu projenin geliştirme süreci üçlü bir sacayağına dayanır:
- **Kullanıcı:** İhtiyaçları, gereksinimleri ve yönlendirmeleri belirleyen vizyoner/yönetici.
- **Claude (Claude.ai Arayüzü):** Kod yazmayan, ancak repo'yu ve kullanıcı taleplerini analiz ederek inceleyen (Code Reviewer), bug'ları ve UX sorunlarını tespit edip yürütücü ajan için detaylı, stratejik prompt'lar hazırlayan danışman/planlayıcı.
- **Antigravity (IDE Agent):** Claude'un ve kullanıcının yönlendirmelerini okuyan, anlayan, gerekli araştırma, test (lint/build) ve kodlama işlemlerini (Commit/Push dahil) doğrudan projenin terminali ve dosya sistemi üzerinde yapan yürütücü/geliştirici.

## 3. Yerleşik Kurallar / Desenler (Established Patterns)
Projede tekrar eden hataları önlemek ve standartları korumak adına kod tabanında aşağıdaki kararlara her zaman uyulmalıdır:
- **Versiyonlama (SemVer Prerelease):** Mini görevler ve UI güncellemeleri tamamlandığında `package.json` üzerinden versiyon numarası `Major.Minor.Patch-Mini` kuralına (örn: `0.7.5-21`) uygun olarak artırılır (Detay: `.agents/AGENTS.md`).
- **Üst Boşluk (Top Padding) Deseni:** Araçların kanvas ekranlarında (DecisionMatrixCanvas, ParetoCanvas, HistogramCanvas, NotepadCanvas vb.), sayfanın sol üstündeki Undo/Redo (Geri/İleri) butonları ve sağ üstündeki Paylaş (Share/Export) butonlarıyla çakışmayı önlemek için her zaman sarmalayıcı (wrapper) en dış div'e `pt-16 md:pt-20` sınıfları uygulanır.
- **i18n (Çoklu Dil Desteği):** Uygulama arayüzüne eklenen herhangi bir yeni çeviri anahtarı, `src/locales/` altındaki **10 dilin (ar, de, en, es, fr, ja, pt, ru, tr, zh)** TÜMÜNE eklenmek zorundadır. Hiçbir dil eksik bırakılamaz.
- **Firestore Güvenlik Kuralları:** `firestore.rules` projenin güvenliği için çok hassas bir alandır. Kullanıcı izni ve data yetkilendirmesi üzerinde yapılacak değişiklikler çok dikkatli tasarlanmalı ve test edilmelidir.
- **URL <-> State Senkronizasyonu:** `AuthenticatedApp.tsx` dosyasında yer alan routing/state eşitleme mekanizması (eski sürümlerde stale-closure race condition yarattığı için) hassas ve kırılgandır. React Router path'leri ile Zustand activeTool/activeProject değişimleri birbirini tetikleyen bir zincire sahiptir, modifiye edilirken yan etkiler gözetilmelidir.

## 4. Yakın Geçmiş Özeti (Recent History)
Aşağıdaki liste, projede yakın zamanda uygulanan son ~40 commit'in genel hatlarını ve projeye katılan değerleri kategorize eder:

**Yeni Özellikler & Refactoring:**
- **EOD Planner:** Sert limit (max 6) kısıtı kaldırıldı, "Bugünün Öncelikleri (Focus)" ve "Bekleme Listesi (Backlog)" olarak iki liste yapısına ayrıldı ve satır içi (inline) düzenleme eklendi.
- **Flowchart:** Tüm dil dosyalarındaki 10 eksik çeviri anahtarı tespit edilip eklendi (Tam i18n entegrasyonu).
- **Kanvas İyileştirmeleri:** Pareto ve Histogram araçlarına, başlıkların sayfa üzerinden doğrudan (inline) yeniden adlandırılması özelliği eklendi.
- **WBS:** Düğümlere (node), açıklama barındırdıklarını belirten görsel bir gösterge (indicator) eklendi.
- **Gezinme (Navigation):** WelcomeScreen ve Navbar üzerindeki araç kategorizasyonu (Tool Categories) standart hale getirildi.

**Kullanıcı Deneyimi (UX) & Tasarım:**
- **Çakışma Giderme:** Notepad, Decision Matrix, Pareto ve Histogram araçlarındaki başlıkların yüzen (absolute) butonlarla çakışmasını engellemek için `pt-16 md:pt-20` standardı tüm kanvaslara uygulandı.
- **ToolHeader:** Üst boşluklar (padding) düzenlendi, 5Whys aracı tam ekran yapılması için ToolHeader'dan arındırıldı, `dividerOnTop` özelliği ile header daha kompakt hale getirildi.
- **Kaydırma Çubuğu:** Sağ üst paneldeki buton gruplarının (Projeler, Ayarlar vb.) scrollbar (kaydırma çubuğu) ve RTL (sağdan sola) düzenlerinde çakışmaması için padding ayarları yapıldı.

**Kritik Hata Düzeltmeleri (Bug Fixes):**
- WBS aracında, yeni alt hedef eklendiğinde veya silindiğinde ebeveyn hedefin durumunun (status) otomatik senkronize olmaması sorunu çözüldü.
- İlk sayfa yüklenişi sırasında (Projeler Firestore'dan inmeden önce) ekranda anlık olarak Karşılama Ekranının (WelcomeScreen) titremesi (flicker) sorunu giderildi.
- Zustand store'daki `persist` middleware yapısı tamamen kaldırılarak, sekme arası (cross-tab) yarış durumu ve veri senkronizasyonu (sync) problemleri kökten çözüldü.
- URL ile Zustand State arasındaki stale-closure hatası ve premature senkronizasyon (erken URL yönlendirmeleri) düzeltildi.

## 5. Açık / Bilinen Konular (Open/Known Issues)
- **EOD Planner Gün Arşivi:** EOD Planner şu anda görevleri tek bir listede tutmaktadır. İlerleyen güncellemelerde "Günü Kapat" tarzı bir özellik ile geçmiş günlerde bitirilen işlerin veya bir sonraki güne sarkan görevlerin tarih bazlı arşivlendiği bir (History/Archive) özelliği planlanmaktadır. Şu an için kasıtlı olarak basit (sonsuz liste) tutulmuştur.
