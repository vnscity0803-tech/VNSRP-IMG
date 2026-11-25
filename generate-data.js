const fs = require('fs');
const path = require('path');

/**
 * Script để scan folder và generate data.json
 * Chạy: node generate-data.js
 */

function scanMaleFolder() {
  const malePath = path.join(__dirname, 'male');
  const items = [];

  if (!fs.existsSync(malePath)) {
    console.error('Folder "male" không tìm thấy');
    return items;
  }

  // Scan male/6/312.png, male/6/311.png...
  const components = fs.readdirSync(malePath);

  components.forEach(componentId => {
    const componentPath = path.join(malePath, componentId);
    if (!fs.statSync(componentPath).isDirectory()) return;

    const drawables = fs.readdirSync(componentPath);
    drawables.forEach(drawableFile => {
      if (!drawableFile.endsWith('.png')) return;

      const drawableId = drawableFile.replace('.png', '');
      const imagePath = `male/${componentId}/${drawableFile}`;

      items.push({
        component: parseInt(componentId),
        drawable: parseInt(drawableId),
        texture: 0, // texture đầu tiên
        image: imagePath,
        name: `male_component_${componentId}_${drawableId}`
      });
    });
  });

  return items;
}

function scanOxInventoryFolder() {
  const oxPath = path.join(__dirname, 'ox_inventory');
  const items = [];

  if (!fs.existsSync(oxPath)) {
    console.warn('Folder "ox_inventory" không tìm thấy');
    return items;
  }

  const files = fs.readdirSync(oxPath);
  files.forEach(file => {
    if (!file.endsWith('.png')) return;

    // Parse: male_component_6_312.png
    const match = file.match(/male_component_(\d+)_(\d+)\.png/);
    if (!match) return;

    const componentId = parseInt(match[1]);
    const drawableId = parseInt(match[2]);

    items.push({
      component: componentId,
      drawable: drawableId,
      texture: 0,
      image: `ox_inventory/${file}`,
      name: `male_component_${componentId}_${drawableId}`
    });
  });

  return items;
}

// Generate data
const data = {
  generated: new Date().toISOString(),
  male: scanMaleFolder(),
  ox_inventory: scanOxInventoryFolder()
};

// Merge và deduplicate
const merged = {};
[...data.male, ...data.ox_inventory].forEach(item => {
  const key = `${item.component}_${item.drawable}`;
  if (!merged[key]) {
    merged[key] = item;
  }
});

const finalData = {
  generated: data.generated,
  total: Object.keys(merged).length,
  items: Object.values(merged).sort((a, b) => {
    if (a.component !== b.component) return a.component - b.component;
    return a.drawable - b.drawable;
  })
};

// Ghi file
fs.writeFileSync(
  path.join(__dirname, 'data.json'),
  JSON.stringify(finalData, null, 2)
);

console.log(`✓ Generated data.json with ${finalData.total} items`);
console.log(`  First item: component ${finalData.items[0].component}, drawable ${finalData.items[0].drawable}`);
console.log(`  Last item: component ${finalData.items[finalData.total-1].component}, drawable ${finalData.items[finalData.total-1].drawable}`);
