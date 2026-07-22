# Solvinger - Claude Projesi Rehberi

## 🎯 Projenin Amacı
Solvinger; problem çözme, kök neden analizi ve stratejik planlama tekniklerini (SWOT, Ishikawa/Kılçık, 5 Neden, Pareto, WBS vb.) tek bir çatı altında toplayan interaktif bir SaaS (Hizmet olarak Yazılım) uygulamasıdır. Ekiplerin gerçek zamanlı (veya asenkron) işbirliği yaparak karmaşık problemleri görselleştirmesini ve çözmesini sağlar.

## 🛠️ Teknoloji Yığını (Tech Stack)
- **Frontend Framework:** React 18 (Vite ile oluşturulmuş)
- **Dil:** TypeScript
- **State Management (Durum Yönetimi):** Zustand (Ölçeklenebilirlik için Store parçalara/slicelara bölünmüştür. Ancak `useAuthStore` tamamen bağımsızdır)
- **Stil & Tasarım:** Tailwind CSS, Lucide React (İkonlar)
- **Veritabanı & Kimlik Doğrulama:** Firebase (Firestore, Auth, Analytics)
- **Çizim / Diyagram Altyapısı:** React Flow (`@xyflow/react`) ve Dagre (Otomatik hiyerarşik dizilim için)
- **Çoklu Dil (i18n):** `react-i18next`

## 📂 Dosya Mimarisi
- `/src/components/`: Kullanıcı arayüzü bileşenleri. Canvas (Çizim alanı) dosyaları (Örn: `WbsCanvas.tsx`, `IshikawaCanvas.tsx`) burada yer alır.
- `/src/store/`: Zustand durum yönetimi.
  - `useRoadmapStore.ts`: Projelerin ve tüm problem çözme araçlarının verilerini tutan ağır ana depo.
  - `/slices/`: `useRoadmapStore` içerisine entegre edilen, her bir araca özel (WBS, 5 Whys, SWOT vb.) alt depolar.
  - `useAuthStore.ts`: Kullanıcı oturum işlemlerini (Firebase Auth) tutan, diğerlerinden tamamen izole edilmiş hafif depo (Lazy loading optimizasyonu için).
- `/src/firebaseCore.ts`: Sadece Firebase App ve Auth başlatıcı. (Hafif)
- `/src/firebase.ts`: Firestore ve Analytics başlatıcı. (Ağır)
- `/src/App.tsx`: Yönlendirme (Routing) ve Lazy Loading mantığını barındıran sade giriş noktası. Sadece giriş yapmamışlara LandingPage gösterir.
- `/src/AuthenticatedApp.tsx`: Yalnızca giriş yapmış kullanıcıların gördüğü, tüm araçları yükleyen ana bileşen.

## ⚠️ Kurallar & Tercihler (Geliştirme Yaparken Dikkat Etmen Gerekenler)
1. **Versiyonlama (ZORUNLU KURAL):** Projede "Mini Task" bazlı 4 haneli özel bir versiyonlama kullanıyoruz: `Major.Minor.Patch-Mini` (Örn: `0.7.3-8`). NPM kısıtlamaları yüzünden prerelease formatı kullanılıyor. `-9`'a ulaşınca (örn: `0.7.3-9`), Patch versiyonu 1 artar ve ek silinir (`0.7.4`). Kodda yapılacak her bir görev sonrasında `package.json` bu mantıkla güncellenir.
2. **Kullanıcı İletişimi:** Geliştiricinin ana mühendisi **Antigravity** adında bir yapay zeka ajanıdır (kodu o yazar). Sen (Claude), mimari kararları veren, kodun bütününe bakıp en iyi yolu çizen **Baş Mimarsın**. Sana danışıldığında kodun en optimize halini ve adımlarını ver. Uygulama kısmını kullanıcı Antigravity'ye yaptıracaktır. O yüzden yanıtlarını kod bloklarıyla ve adım adım ver ki kullanıcı kolayca kopyalayıp mühendise iletebilsin.
3. **Modülerlik & Lazy Loading:** Projenin bundle size (paket boyutu) çok önemlidir. Ağır paketleri (Firebase Firestore, XYFlow) Landing Page'e yüklememek için katı bir izolasyon yaptık. Yeni bir özellik eklerken bu izolasyonu bozmamaya (Örn: `LandingPage` veya `AuthModal` içine `useRoadmapStore` import etmemeye) çok dikkat et.

## 🚀 Claude İçin Kod İnceleme Talimatı
Kullanıcı sana `solvinger_code_dump.txt` dosyasını attığında, bu projenin tüm kaynak kodudur. 
Lütfen kodun bütününü analiz et. Sadece kullanıcının sorduğu spesifik soruya odaklanmakla kalma, aynı zamanda mevcut Zustand store yapısıyla veya React Flow bileşenleriyle bu yeni eklenecek özelliğin nasıl uyum sağlayacağına dair net bir **Uygulama Planı (Implementation Plan)** çıkar.
