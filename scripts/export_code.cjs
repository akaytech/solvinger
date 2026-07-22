const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(PROJECT_DIR, 'solvinger_code_dump.txt');

// Dışarı aktarılmayacak (görmezden gelinecek) klasör ve dosyalar
const IGNORE_LIST = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'public',
  'assets',
  '.firebase',
  '.gemini',
  '.agents',
  'package-lock.json',
  'solvinger_code_dump.txt'
];

const ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md'];

function shouldIgnore(filePath) {
  const baseName = path.basename(filePath);
  if (IGNORE_LIST.includes(baseName)) return true;
  
  const stats = fs.statSync(filePath);
  if (stats.isFile()) {
    const ext = path.extname(baseName);
    if (!ALLOWED_EXTENSIONS.includes(ext) && baseName !== 'CLAUDE.md' && baseName !== '.env.example') {
      return true;
    }
  }
  return false;
}

function scanDir(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (shouldIgnore(fullPath)) continue;
    
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      scanDir(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function generateDump() {
  console.log('Kodlar taranıyor...');
  const allFiles = scanDir(PROJECT_DIR);
  
  let outputContent = `# SOLVINGER PROJE KODLARI\n\n`;
  outputContent += `Bu dosya projenin güncel kaynak kodlarını içerir. Lütfen analizlerin için referans olarak kullan.\n\n`;
  outputContent += `=================================================================\n\n`;
  
  for (const filePath of allFiles) {
    const relativePath = path.relative(PROJECT_DIR, filePath);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    outputContent += `\n\n--- BAŞLANGIÇ: ${relativePath} ---\n\n`;
    outputContent += fileContent;
    outputContent += `\n\n--- BİTİŞ: ${relativePath} ---\n`;
  }
  
  fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');
  console.log(`\nBAŞARILI! Toplam ${allFiles.length} dosya birleştirildi.`);
  console.log(`Çıktı dosyası: ${OUTPUT_FILE}`);
  console.log(`Bu dosyayı Claude'a yükleyebilirsin.`);
}

generateDump();
