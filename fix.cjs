const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');
code = code.replace(/"close": "Kapat"\r?\n\s*"tool_wbs"/g, '"close": "Kapat",\n      "tool_wbs"');
code = code.replace(/"new_root_goal": "New Main Task",\r?\n\s*"close": "Close"\r?\n\s*"tool_wbs"/g, '"new_root_goal": "New Main Task",\n      "close": "Close",\n      "tool_wbs"');
code = code.replace(/"close": "Cerrar"\r?\n\s*"tool_wbs"/g, '"close": "Cerrar",\n      "tool_wbs"');
code = code.replace(/"close": "Fermer"\r?\n\s*"tool_wbs"/g, '"close": "Fermer",\n      "tool_wbs"');
code = code.replace(/"close": "Schließen"\r?\n\s*"tool_wbs"/g, '"close": "Schließen",\n      "tool_wbs"');
code = code.replace(/"close": "Fechar"\r?\n\s*"tool_wbs"/g, '"close": "Fechar",\n      "tool_wbs"');
code = code.replace(/"close": "Закрыть"\r?\n\s*"tool_wbs"/g, '"close": "Закрыть",\n      "tool_wbs"');
code = code.replace(/"close": "إغلاق"\r?\n\s*"tool_wbs"/g, '"close": "إغلاق",\n      "tool_wbs"');
code = code.replace(/"close": "关闭"\r?\n\s*"tool_wbs"/g, '"close": "关闭",\n      "tool_wbs"');
code = code.replace(/"close": "閉じる"\r?\n\s*"tool_wbs"/g, '"close": "閉じる",\n      "tool_wbs"');

fs.writeFileSync('src/i18n.ts', code);
console.log('Fixed');
