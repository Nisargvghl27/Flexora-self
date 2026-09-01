const fs = require('fs');
const path = require('path');

function cleanConsoleLogs(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      cleanConsoleLogs(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Match console.log statements that are on a single line
      const newContent = content.replace(/^[ \t]*console\.log\(.*?\);?[ \t]*\r?\n/gm, '');
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Cleaned: ${fullPath}`);
      }
    }
  }
}

cleanConsoleLogs('e:/Flexora/frontend/src');
