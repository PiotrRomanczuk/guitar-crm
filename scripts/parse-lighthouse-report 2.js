const fs = require('fs');
const path = require('path');

const reportPath = process.argv[2];

if (!reportPath) {
  console.error('Please provide the path to the lighthouse report JSON file.');
  process.exit(1);
}

try {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  const categories = report.categories;
  const scores = {
    Performance: categories.performance?.score * 100,
    Accessibility: categories.accessibility?.score * 100,
    'Best Practices': categories['best-practices']?.score * 100,
    SEO: categories.seo?.score * 100,
    PWA: categories.pwa?.score * 100,
  };

  console.log('Category                Score   Status');
  console.log('--------------------------------------');

  Object.entries(scores).forEach(([category, score]) => {
    if (score !== undefined) {
      const status =
        score >= 90
          ? '🟢 Excellent'
          : score >= 70
          ? '🟡 Good'
          : score >= 50
          ? '🟠 Needs Work'
          : '🔴 Poor';
      console.log(
        `${category.padEnd(18)} ${Math.round(score).toString().padStart(3)}     ${status}`
      );
    }
  });

  // Display core web vitals
  const audits = report.audits;
  console.log('\n⚡ CORE WEB VITALS:');
  console.log('==================');

  const vitals = {
    'First Contentful Paint': audits['first-contentful-paint']?.displayValue,
    'Largest Contentful Paint': audits['largest-contentful-paint']?.displayValue,
    'Cumulative Layout Shift': audits['cumulative-layout-shift']?.displayValue,
    'Total Blocking Time': audits['total-blocking-time']?.displayValue,
    'Speed Index': audits['speed-index']?.displayValue,
  };

  Object.entries(vitals).forEach(([metric, value]) => {
    if (value) {
      console.log(`${metric.padEnd(25)} ${value}`);
    }
  });
} catch (error) {
  console.error('Error parsing report:', error);
  process.exit(1);
}
