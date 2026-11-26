const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const outputFile = path.join(baseDir, 'data.json');

// Map component ID to Vietnamese name
const componentMap = {
  0: 'Đầu / Khuôn mặt',
  1: 'Mặt nạ / Râu',
  2: 'Tóc',
  3: 'Thân trên / Tay / Găng tay',
  4: 'Quần',
  5: 'Dù / Ba lô',
  6: 'Giày',
  7: 'Phụ kiện',
  8: 'Áo lót / Áo bên trong',
  9: 'Áo giáp',
  10: 'Huy hiệu / Hình dán',
  11: 'Áo khoác / Áo ngoài',
  12: 'Props - Mũ',
  13: 'Props - Kính',
  14: 'Props - Tai',
  15: 'Props - Đồng hồ',
  16: 'Props - Khác'
};

function extractComponent(filename) {
  // Pattern: male_component_11_0_0 or component_11_0_0 or Item_xxx
  const match = filename.match(/component_(\d+)/);
  if (match) {
    const componentId = parseInt(match[1]);
    return {
      componentId,
      componentName: componentMap[componentId] || `Component ${componentId}`
    };
  }
  return { componentId: null, componentName: 'Khác' };
}

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
          const nameWithoutExt = file.replace(/\.(webp|png)$/, '');
          const { componentId, componentName } = extractComponent(nameWithoutExt);
          
          items.push({
            folder: folder,
            index: idx,
            name: nameWithoutExt,
            image: `./${folder}/${file}`,
            componentId: componentId,
            componentName: componentName
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
