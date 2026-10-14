'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.name==='.git'?[]:e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files = walk(root);
const prohibited = /\.(pkl|pickle|joblib|dta|sav|parquet|npz|npy)$/i;
assert(!files.some(p=>prohibited.test(p)),'Restricted data/model file found.');
assert(!files.some(p=>p.includes('node_modules') || p.includes('.venv') || p.includes('private_build')),'Local runtime found in public candidate.');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (/^https?:/.test(match[1])) continue;
  assert(fs.existsSync(path.join(root,match[1])),`Missing local asset: ${match[1]}`);
}
for(const file of ['assets/app.js','assets/predictor.js']) {
  const src=fs.readFileSync(path.join(root,file),'utf8');
  assert(!/\b(?:fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage)\b/.test(src),'Unexpected network/persistent input handling.');
}
const refs=JSON.parse(fs.readFileSync(path.join(root,'tests/reference-cases.json'),'utf8'));
assert(refs.every(r=>/^SYN_\d+$/.test(r.id)),'Non-synthetic identifier found.');
const results = {date:new Date().toISOString().slice(0,10),restrictedFilesAbsent:true,localAssetsPresent:true,noPredictionNetworkOrPersistentStorage:true,referenceIdentifiersSynthetic:true,result:'PASS'};
fs.writeFileSync(path.join(root,'tests/package-audit.json'),JSON.stringify(results,null,2)+'\n');
const tracked=walk(root).filter(p=>path.basename(p)!=='SHA256SUMS.txt').sort((a,b)=>a.localeCompare(b,'en'));
const lines=tracked.map(p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')+'  '+path.relative(root,p).split(path.sep).join('/'));
fs.writeFileSync(path.join(root,'SHA256SUMS.txt'),lines.join('\n')+'\n');
console.log(JSON.stringify({...results,fileCount:tracked.length,totalBytes:tracked.reduce((sum,p)=>sum+fs.statSync(p).size,0)},null,2));
