const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\HOME\\.gemini\\antigravity\\scratch\\kpoint-e74-book';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

// Sort by number in filename (e.g. part 1.html, part 2.html, ..., part 10.html)
files.sort((a, b) => {
  const numA = parseInt(a.match(/\d+/)[0]);
  const numB = parseInt(b.match(/\d+/)[0]);
  return numA - numB;
});

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf-8');
  
  // Extract page number or title/header
  let pageMatch = content.match(/page-num">-\s*([০-৯\d]+)\s*-<\/div>/i) || 
                  content.match(/page">([০-৯\d]+)\s*-<\/div>/i) ||
                  content.match(/page-num">([০-৯\d]+)<\/div>/i);
  let pageStr = pageMatch ? pageMatch[1] : 'N/A';
  
  let titleMatch = content.match(/<h1>(.*?)<\/h1>/i) || 
                   content.match(/<h2>(.*?)<\/h2>/i) ||
                   content.match(/<div class="section-header">([\s\S]*?)<\/div>/i);
  let titleStr = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 60) : 'No Heading';
  
  // Search for potential errors
  let errors = [];
  if (content.includes('২,৬০০ মিলিয়ন')) {
    errors.push('২,৬০০ মিলিয়ন (should be ২৬ মিলিয়ন or ২৬,০০০,০০০)');
  }
  if (content.includes('মিলিয়ন ওয়ান') || content.includes('মিলিয়ন ওন')) {
    // Check if there are other millions
    const matches = content.match(/(\S+\s+মিলিয়ন\s+ও[নন])/g);
    if (matches) {
      errors.push(`মিলিয়ন ওন found: ${matches.join(', ')}`);
    }
  }

  console.log(`${f.padEnd(12)} | Page: ${pageStr.padEnd(5)} | Title: ${titleStr.padEnd(50)} | Errors: ${errors.join(', ')}`);
});
