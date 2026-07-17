import fs from 'fs';

const translations = {
  tr: {
    whys_placeholder: "Analiz edilecek problemi yazın...",
    whys_start: "Analiz Başlat",
    whys_problem: "Problem",
    whys_why: "Neden?",
    whys_why_placeholder: "Nedeni buraya yazın...",
    whys_root: "Kök Neden Çözümü",
    whys_root_placeholder: "Bulunan kök neden için çözüm planı...",
    swot_subtitle: "Projenizin stratejik avantaj ve dezavantajlarını haritalandırın.",
    swot_s: "Güçlü Yönler (Strengths)",
    swot_w: "Zayıf Yönler (Weaknesses)",
    swot_o: "Fırsatlar (Opportunities)",
    swot_t: "Tehditler (Threats)",
    swot_empty: "Henüz madde eklenmedi",
    swot_add: "Yeni madde ekle..."
  },
  en: {
    whys_placeholder: "Type the problem to analyze...",
    whys_start: "Start Analysis",
    whys_problem: "Problem",
    whys_why: "Why?",
    whys_why_placeholder: "Type the reason here...",
    whys_root: "Root Cause Solution",
    whys_root_placeholder: "Solution plan for the root cause...",
    swot_subtitle: "Map the strategic advantages and disadvantages of your project.",
    swot_s: "Strengths",
    swot_w: "Weaknesses",
    swot_o: "Opportunities",
    swot_t: "Threats",
    swot_empty: "No items added yet",
    swot_add: "Add new item..."
  },
  es: {
    whys_placeholder: "Escriba el problema a analizar...",
    whys_start: "Iniciar Análisis",
    whys_problem: "Problema",
    whys_why: "¿Por qué?",
    whys_why_placeholder: "Escriba la razón aquí...",
    whys_root: "Solución de la Causa Raíz",
    whys_root_placeholder: "Plan de solución para la causa raíz...",
    swot_subtitle: "Mapea las ventajas y desventajas estratégicas de tu proyecto.",
    swot_s: "Fortalezas",
    swot_w: "Debilidades",
    swot_o: "Oportunidades",
    swot_t: "Amenazas",
    swot_empty: "Aún no se han añadido elementos",
    swot_add: "Añadir nuevo elemento..."
  },
  fr: {
    whys_placeholder: "Tapez le problème à analyser...",
    whys_start: "Démarrer l'analyse",
    whys_problem: "Problème",
    whys_why: "Pourquoi ?",
    whys_why_placeholder: "Tapez la raison ici...",
    whys_root: "Solution de la Cause Racine",
    whys_root_placeholder: "Plan de solution pour la cause racine...",
    swot_subtitle: "Cartographiez les avantages et inconvénients stratégiques de votre projet.",
    swot_s: "Forces",
    swot_w: "Faiblesses",
    swot_o: "Opportunités",
    swot_t: "Menaces",
    swot_empty: "Aucun élément ajouté",
    swot_add: "Ajouter un élément..."
  },
  de: {
    whys_placeholder: "Problem zur Analyse eingeben...",
    whys_start: "Analyse starten",
    whys_problem: "Problem",
    whys_why: "Warum?",
    whys_why_placeholder: "Grund hier eingeben...",
    whys_root: "Grundursachenlösung",
    whys_root_placeholder: "Lösungsplan für die Grundursache...",
    swot_subtitle: "Kartieren Sie strategische Vor- und Nachteile Ihres Projekts.",
    swot_s: "Stärken (Strengths)",
    swot_w: "Schwächen (Weaknesses)",
    swot_o: "Chancen (Opportunities)",
    swot_t: "Risiken (Threats)",
    swot_empty: "Noch keine Elemente hinzugefügt",
    swot_add: "Neues Element hinzufügen..."
  },
  pt: {
    whys_placeholder: "Digite o problema a analisar...",
    whys_start: "Iniciar Análise",
    whys_problem: "Problema",
    whys_why: "Por quê?",
    whys_why_placeholder: "Digite a razão aqui...",
    whys_root: "Solução da Causa Raiz",
    whys_root_placeholder: "Plano de solução para a causa raiz...",
    swot_subtitle: "Mapeie as vantagens e desvantagens estratégicas do seu projeto.",
    swot_s: "Forças",
    swot_w: "Fraquezas",
    swot_o: "Oportunidades",
    swot_t: "Ameaças",
    swot_empty: "Nenhum item adicionado",
    swot_add: "Adicionar novo item..."
  },
  ru: {
    whys_placeholder: "Введите проблему для анализа...",
    whys_start: "Начать анализ",
    whys_problem: "Проблема",
    whys_why: "Почему?",
    whys_why_placeholder: "Введите причину здесь...",
    whys_root: "Решение Первопричины",
    whys_root_placeholder: "План решения первопричины...",
    swot_subtitle: "Составьте карту стратегических преимуществ и недостатков вашего проекта.",
    swot_s: "Сильные стороны",
    swot_w: "Слабые стороны",
    swot_o: "Возможности",
    swot_t: "Угрозы",
    swot_empty: "Элементы еще не добавлены",
    swot_add: "Добавить новый элемент..."
  },
  ar: {
    whys_placeholder: "اكتب المشكلة لتحليلها...",
    whys_start: "بدء التحليل",
    whys_problem: "المشكلة",
    whys_why: "لماذا؟",
    whys_why_placeholder: "اكتب السبب هنا...",
    whys_root: "حل السبب الجذري",
    whys_root_placeholder: "خطة الحل للسبب الجذري...",
    swot_subtitle: "خريطة المزايا والعيوب الاستراتيجية لمشروعك.",
    swot_s: "نقاط القوة",
    swot_w: "نقاط الضعف",
    swot_o: "الفرص",
    swot_t: "التهديدات",
    swot_empty: "لم تتم إضافة عناصر بعد",
    swot_add: "إضافة عنصر جديد..."
  },
  zh: {
    whys_placeholder: "输入要分析的问题...",
    whys_start: "开始分析",
    whys_problem: "问题",
    whys_why: "为什么？",
    whys_why_placeholder: "在此输入原因...",
    whys_root: "根本原因解决方案",
    whys_root_placeholder: "根本原因的解决计划...",
    swot_subtitle: "绘制项目的战略优劣势图。",
    swot_s: "优势 (Strengths)",
    swot_w: "劣势 (Weaknesses)",
    swot_o: "机会 (Opportunities)",
    swot_t: "威胁 (Threats)",
    swot_empty: "尚未添加项目",
    swot_add: "添加新项目..."
  },
  ja: {
    whys_placeholder: "分析する問題を入力してください...",
    whys_start: "分析開始",
    whys_problem: "問題",
    whys_why: "なぜ？",
    whys_why_placeholder: "理由をここに入力...",
    whys_root: "根本原因の解決策",
    whys_root_placeholder: "根本原因の解決計画...",
    swot_subtitle: "プロジェクトの戦略的な利点と欠点をマッピングします。",
    swot_s: "強み (Strengths)",
    swot_w: "弱み (Weaknesses)",
    swot_o: "機会 (Opportunities)",
    swot_t: "脅威 (Threats)",
    swot_empty: "項目がありません",
    swot_add: "新しい項目を追加..."
  }
};

const i18nPath = 'c:/Users/Ev/Desktop/problem çözüm teknikleri uygulaması/src/i18n.ts';
let code = fs.readFileSync(i18nPath, 'utf8');

for (const [lang, keys] of Object.entries(translations)) {
  const match = new RegExp(`(${lang}:\\s*{\\s*translation:\\s*{)([\\s\\S]*?)(}\\s*})`);
  if (match.test(code)) {
    const replacement = Object.entries(keys)
      .map(([k, v]) => `,\n      "${k}": "${v.replace(/"/g, '\\"')}"`)
      .join('');
    
    // We append the new keys safely before the closing braces.
    // Wait, regex capturing groups: $1 is `lang: { translation: {`, $2 is everything inside, $3 is `} }`
    code = code.replace(match, `$1$2${replacement}\n    $3`);
  }
}

fs.writeFileSync(i18nPath, code);
console.log('i18n.ts successfully updated with new keys!');
