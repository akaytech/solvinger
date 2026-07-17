const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');
code = code.replace(/\r?\n\s*,\r?\n\s*"whys_placeholder"/g, ',\n      "whys_placeholder"');
fs.writeFileSync('src/i18n.ts', code);
console.log('Fixed syntax error in i18n.ts');
