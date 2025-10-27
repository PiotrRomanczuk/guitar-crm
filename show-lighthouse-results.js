import fs from 'fs';
const report = JSON.parse(
	fs.readFileSync(
		'./lighthouse-reports/lighthouse-report-2025-10-26_17-51-23.report.json',
		'utf8'
	)
);

const categories = report.categories;
const scores = {
	Performance: categories.performance?.score * 100,
	Accessibility: categories.accessibility?.score * 100,
	'Best Practices': categories['best-practices']?.score * 100,
	SEO: categories.seo?.score * 100,
	PWA: categories.pwa?.score * 100,
};

console.log('');
console.log('🚢 LIGHTHOUSE AUDIT RESULTS - shadcn/ui Guitar CRM');
console.log('===================================================');
console.log('');
console.log('Category                Score   Status');
console.log('--------------------------------------');

Object.entries(scores).forEach(([category, score]) => {
	if (score !== undefined && !Number.isNaN(score)) {
		const status =
			score >= 90
				? '🟢 Excellent'
				: score >= 70
				? '🟡 Good'
				: score >= 50
				? '🟠 Needs Work'
				: '🔴 Poor';
		console.log(
			`${category.padEnd(18)} ${Math.round(score)
				.toString()
				.padStart(3)}     ${status}`
		);
	}
});

const audits = report.audits;
console.log('');
console.log('⚡ CORE WEB VITALS:');
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

console.log('');
console.log('📊 PERFORMANCE BREAKDOWN:');
console.log('=========================');
const perfAudits = {
	'Time to Interactive': audits['interactive']?.displayValue,
	'Max Potential FID': audits['max-potential-fid']?.displayValue,
	'Server Response Time': audits['server-response-time']?.displayValue,
};

Object.entries(perfAudits).forEach(([metric, value]) => {
	if (value) {
		console.log(`${metric.padEnd(25)} ${value}`);
	}
});

// Check for critical issues
const issues = [];
if (scores.Performance < 70)
	issues.push(
		'⚠️  Performance below 70 - Consider code splitting and optimization'
	);
if (scores.Accessibility < 90)
	issues.push('⚠️  Accessibility below 90 - Review ARIA attributes');
if (scores['Best Practices'] < 80)
	issues.push('⚠️  Best Practices below 80 - Check console errors');

if (issues.length > 0) {
	console.log('');
	console.log('📋 RECOMMENDATIONS:');
	console.log('===================');
	issues.forEach((issue) => console.log(issue));
}

console.log('');
console.log(
	'📁 HTML Report: ./lighthouse-reports/lighthouse-report-2025-10-26_17-51-23.report.html'
);
console.log(
	'💡 Open with: open ./lighthouse-reports/lighthouse-report-2025-10-26_17-51-23.report.html'
);
console.log('');
