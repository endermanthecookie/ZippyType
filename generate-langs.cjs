const fs = require('fs');
const path = require('path');

const langs = ['es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'tr', 'nl', 'pl', 'sv', 'da', 'fi', 'no', 'el'];
const enPath = path.join(__dirname, 'src', 'Lang', 'en.lang');
const enContent = fs.readFileSync(enPath, 'utf-8');

langs.forEach(lang => {
  fs.writeFileSync(path.join(__dirname, 'src', 'Lang', `${lang}.lang`), enContent);
});

console.log('Created 19 language files');
