const fs = require('fs');

// Read full data
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// Keep only first 300 items for testing
data.items = data.items.slice(0, 300);
data.total = 300;

fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
console.log('✓ Reduced to 300 items for testing');
