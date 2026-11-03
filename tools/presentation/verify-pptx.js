const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = path.resolve(__dirname, '../../artifacts/deck');
const file = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.pptx') && f.includes('GBSN'))[0];
const full = path.join(dir, file);

// crude but dependency-free: use the unzip entry directory via node's zlib is overkill;
// instead list with tar (bsdtar ships with Windows 10+)
const out = execSync(`tar -tf "${full}"`)
  .toString()
  .split(/\r?\n/)
  .filter(Boolean);
const slides = out.filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e));
const notes = out.filter((e) =>
  /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(e),
);
const media = out.filter((e) => e.startsWith('ppt/media/'));

console.log('file       ' + file);
console.log('bytes      ' + fs.statSync(full).size);
console.log('slides     ' + slides.length);
console.log('notes      ' + notes.length);
console.log('media      ' + media.length);
console.log('media list ' + media.join(', '));
