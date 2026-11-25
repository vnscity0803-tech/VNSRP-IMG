const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const outputFile = path.join(baseDir, 'data.json');

try {
  let items = [];
  
  // Get all directories (excluding hidden and git)
  const dirs = fs.readdirSync(baseDir).filter(f => {
    const fullPath = path.join(baseDir, f);
    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
  });

  console.log(`📂 Found folders: ${dirs.join(', ')}`);

  // Scan each folder for images
  for (const folder of dirs) {
    const folderPath = path.join(baseDir, folder);
    try {
      const files = fs.readdirSync(folderPath).filter(f => 
        f.endsWith('.webp') || f.endsWith('.png')
      );
      
      if (files.length > 0) {
        files.forEach((file, idx) => {
          items.push({
            folder: folder,
            index: idx,
            name: `${folder}_${file.replace(/\.(webp|png)$/, '')}`,
            image: `./${folder}/${file}`
          });
        });
        console.log(`  ✓ ${folder}: ${files.length} files`);
      }
    } catch (e) {
      console.log(`  ⚠ Error reading ${folder}: ${e.message}`);
    }
  }

  if (items.length === 0) {
    throw new Error('No image files found in any folder');
  }

  fs.writeFileSync(outputFile, JSON.stringify(items, null, 2));
  console.log(`\n✓ Generated data.json with ${items.length} items total`);
  console.log(`📍 File: ${outputFile}`);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
