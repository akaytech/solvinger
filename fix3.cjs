const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');
code = code.replace(/,,/g, ',');
fs.writeFileSync('src/i18n.ts', code);
console.log('Fixed double commas in i18n.ts');
