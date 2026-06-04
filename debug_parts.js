const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\HOME\\.gemini\\antigravity\\scratch\\kpoint-e74-book';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f.startsWith('part'));

files.sort((a, b) => {
  const numA = parseInt(a.match(/\d+/)[0]);
  const numB = parseInt(b.match(/\d+/)[0]);
  return numA - numB;
});

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf-8');
  const size = fs.statSync(path.join(dir, f)).size;
  
  // Find page marker
  let pageMarker = 'None';
  const pageNumMatch = content.match(/class="page-num"[^>]*>([\s\S]*?)<\/div>/i) ||
                        content.match(/class="page"[^>]*>([\s\S]*?)<\/div>/i);
  if (pageNumMatch) {
    pageMarker = pageNumMatch[1].replace(/<[^>]*>/g, '').trim();
  }
  
  // Find H1 or H2
  let heading = 'None';
  const hMatch = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || content.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (hMatch) {
    heading = hMatch[1].replace(/<[^>]*>/g, '').trim();
  }
  
  console.log(`${f.padEnd(12)} | Size: ${String(size).padEnd(6)} | PageMarker: ${pageMarker.padEnd(10)} | Heading: ${heading.substring(0, 50)}`);
});
