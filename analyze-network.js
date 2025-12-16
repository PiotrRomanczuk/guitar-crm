const fs = require('fs');

try {
  const report = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));
  const items = report.audits['network-requests'].details.items;
  if (items.length > 0) {
    console.log(JSON.stringify(items[0], null, 2));
  }
} catch (e) {
  console.error(e);
}
