import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

// <html> öğesinin yön (dir) ve dil (lang) niteliklerini aktif dile göre ayarlar.
// i18n.dir() Arapça (ve gelecekte İbranice/Farsça) için 'rtl', diğerleri için
// 'ltr' döndürür. Böylece metin akışı, input hizası ve flex sıralaması doğru olur.
const applyDocumentDirection = (lng: string) => {
  document.documentElement.dir = i18n.dir(lng);
  document.documentElement.lang = lng;
};

i18n
  .use(LanguageDetector)
  .use(resourcesToBackend((language: string) => import(`./locales/${language}.json`)))
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => applyDocumentDirection(i18n.language));

// Kullanıcı dili değiştirdiğinde yönü güncelle.
i18n.on('languageChanged', applyDocumentDirection);

export default i18n;
