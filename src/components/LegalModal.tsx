import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {type === 'privacy' ? t('privacy_policy_title') : t('terms_of_use_title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-slate-700 dark:text-slate-300 space-y-4 text-sm md:text-base">
          {type === 'privacy' ? (
            <>
              <p className="font-semibold text-xs text-slate-500 mb-4">Son Güncelleme: 22 Temmuz 2026</p>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6">1. Veri Sorumlusu</h3>
              <p>
                Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, "Solvinger" (bundan sonra "Uygulama" olarak anılacaktır) tarafından kişisel verilerinizin toplanması, işlenmesi ve aktarılması süreçlerine ilişkin olarak sizi bilgilendirmek amacıyla hazırlanmıştır.
              </p>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6">2. İşlenen Kişisel Verileriniz</h3>
              <p>Uygulamayı kullanımınız kapsamında aşağıdaki kişisel verileriniz işlenmektedir:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Kimlik ve İletişim Verileri:</strong> Ad, soyad, e-posta adresi, profil fotoğrafı (Google ile giriş yapılması veya manuel kayıt olunması durumunda).</li>
                <li><strong>Kullanıcı İşlem Verileri:</strong> Uygulama içerisinde oluşturduğunuz projeler, diyagramlar, notlar ve paylaştığınız içerikler.</li>
                <li><strong>İşlem Güvenliği Verileri:</strong> IP adresi, sisteme giriş-çıkış saatleri, cihaz bilgileri, Firebase tarafından atanan benzersiz kullanıcı kimliği (User ID).</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6">3. Kişisel Verilerin İşlenme Amacı</h3>
              <p>Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Kullanıcı hesaplarının oluşturulması ve yönetilmesi,</li>
                <li>Uygulamanın temel işlevlerinin (proje oluşturma, kaydetme, eş zamanlı ortak çalışma) yerine getirilmesi,</li>
                <li>Ortak çalışma (multiplayer/share) özelliği kapsamında, yetkilendirdiğiniz diğer kullanıcılarla projelerinizin paylaşılması,</li>
                <li>Sistem güvenliğinin sağlanması, hataların tespit edilmesi ve uygulamanın geliştirilmesi.</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6">4. Kişisel Verilerin Aktarımı</h3>
              <p>Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda;</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Veritabanı ve sunucu hizmetleri için altyapı sağlayıcımız olan <strong>Google (Firebase)</strong> sunucularında barındırılmaktadır (Sunucuların yurt dışında bulunması sebebiyle yurt dışına aktarım söz konusudur).</li>
                <li>Ortak çalışma özelliği kullandığınızda, projenizi paylaştığınız diğer uygulama kullanıcıları (sadece ilgili proje verileri ile sınırlı olmak üzere) ile paylaşılır.</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6">5. KVKK Madde 11 Kapsamındaki Haklarınız</h3>
              <p>Kanun’un 11. maddesi uyarınca veri sahibi olarak verilerinizin işlenip işlenmediğini öğrenme, silinmesini talep etme ve diğer haklarınızı kullanmak için aşağıdaki adres üzerinden iletişime geçebilirsiniz.</p>
              
              <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <p><strong>İletişim:</strong> abdullahkilicaslanyavuz@gmail.com</p>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-xs text-slate-500 mb-4">Son Güncelleme: 22 Temmuz 2026</p>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6">1. Taraflar ve Kabul</h3>
              <p>
                Bu Kullanım Koşulları, "Solvinger" uygulamasını kullanım şartlarını düzenlemektedir. Uygulamaya kayıt olarak veya uygulamayı kullanarak bu koşulları kabul etmiş sayılırsınız.
              </p>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6">2. Hizmetin Kapsamı</h3>
              <p>
                Solvinger, kullanıcıların problem çözme tekniklerini (WBS, SWOT, Ishikawa, Pareto vb.) kullanarak projeler oluşturmasını ve bu projeleri diğer kullanıcılarla paylaşarak ortaklaşa çalışmasını sağlayan bir üretkenlik aracıdır. Hizmet, "olduğu gibi" sunulmakta olup, kesintisiz veya hatasız çalışma garantisi verilmemektedir.
              </p>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6">3. Kullanıcı Yükümlülükleri</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Kullanıcı, hesabının güvenliğinden bizzat sorumludur.</li>
                <li>Uygulama içerisine girilen verilerin (projeler, notlar) hukuka aykırı, telif hakkı ihlali içeren veya üçüncü şahıslara zarar verici nitelikte olmaması kullanıcının sorumluluğundadır.</li>
                <li>"Ortak Çalışma (Paylaşım)" özelliği kullanıldığında, projenin linkini kimlerle paylaştığınız tamamen sizin sorumluluğunuzdadır.</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6">4. Sorumluluğun Sınırlandırılması</h3>
              <p>
                Uygulamanın kullanımından, veri kayıplarından, sunucu kesintilerinden (Google Firebase kaynaklı sorunlar dahil) veya diğer kullanıcıların ortak projelerdeki eylemlerinden doğabilecek doğrudan veya dolaylı hiçbir zarardan Solvinger (geliştirici) sorumlu tutulamaz.
              </p>

              <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <p><strong>İletişim:</strong> abdullahkilicaslanyavuz@gmail.com</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
