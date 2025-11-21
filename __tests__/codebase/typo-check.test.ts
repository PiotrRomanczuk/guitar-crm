/**
 * Typo Check Test
 * 
 * This test verifies that common typos are not present in the codebase.
 * Addresses issue: "reapeat" (typo of "repeat")
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Codebase Typo Checks', () => {
  describe('Common Typos', () => {
    it('should not contain "reapeat" (typo of "repeat")', () => {
      // Search for the typo in the codebase
      const searchCommand = `grep -r "reapeat" ${process.cwd()} --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.md" 2>/dev/null || true`;
      
      try {
        const result = execSync(searchCommand, { encoding: 'utf-8' });
        
        // Filter out node_modules and .git directories
        const filteredResult = result
          .split('\n')
          .filter((line) => line.trim() !== '')
          .filter((line) => !line.includes('node_modules'))
          .filter((line) => !line.includes('.git'))
          .filter((line) => !line.includes('typo-check.test.ts')) // Exclude this test file itself
          .filter((line) => !line.includes('TYPO_ANALYSIS.md')) // Exclude the typo analysis documentation
          .join('\n');
        
        // Should find no matches
        expect(filteredResult).toBe('');
      } catch (error) {
        // grep exits with code 1 if no matches found, which is what we want
        // Only fail if there's an actual error
        if (error instanceof Error && !error.message.includes('Command failed')) {
          throw error;
        }
      }
    });

    it('should have legitimate uses of "repeat" with correct spelling', () => {
      // Verify that "repeat" is used correctly in specific files
      const legitimateFiles = [
        'scripts/testing/test-admin-access.js',
        'scripts/database/utils/export-seed-data.ts',
      ];

      legitimateFiles.forEach((file) => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Should contain correct "repeat" usage
          expect(content).toMatch(/\.repeat\(/);
          
          // Should NOT contain the typo
          expect(content).not.toMatch(/reapeat/i);
        }
      });
    });
  });

  describe('Documentation Quality', () => {
    it('should have typo analysis documentation', () => {
      const typoAnalysisPath = path.join(process.cwd(), 'docs', 'TYPO_ANALYSIS.md');
      expect(fs.existsSync(typoAnalysisPath)).toBe(true);

      if (fs.existsSync(typoAnalysisPath)) {
        const content = fs.readFileSync(typoAnalysisPath, 'utf-8');
        
        // Verify documentation mentions the typo
        expect(content).toContain('reapeat');
        expect(content).toContain('repeat');
        expect(content).toContain('typo');
      }
    });
  });
});
