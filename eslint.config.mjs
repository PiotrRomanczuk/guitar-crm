import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
		// Project-specific ignores
		'supabase/**',
		'coverage/**',
		// Script files with different module system
		'scripts/**/*.js',
		'*.js',
		// History/backup files
		'scripts/history/**',
	]),
	// Project-wide rules and overrides
	{
		name: 'project/component-size-rules',
		files: [
			'app/**/*.{ts,tsx}',
			'components/**/*.{ts,tsx}',
			'lib/**/*.{ts,tsx}',
		],
		rules: {
			// Encourage small, focused components/files
			'max-lines': [
				'error',
				{ max: 300, skipBlankLines: true, skipComments: true },
			],
			'max-lines-per-function': [
				'warn',
				{ max: 120, skipBlankLines: true, IIFEs: true },
			],
			complexity: ['warn', { max: 10 }],
			'max-depth': ['warn', 4],
		},
	},
	// Do not apply size rules to generated types, migrations, or tests
	{
		name: 'project/size-rules-exceptions',
		files: [
			'types/**/*.ts',
			'supabase/**/*.{ts,sql}',
			'__tests__/**/*.{ts,tsx}',
		],
		rules: {
			'max-lines': 'off',
			'max-lines-per-function': 'off',
		},
	},
]);

export default eslintConfig;
