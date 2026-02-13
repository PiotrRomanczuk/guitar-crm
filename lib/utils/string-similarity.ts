/**
 * String similarity using Levenshtein distance.
 * Returns a score from 0 (completely different) to 100 (identical after normalization).
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '');
  const a = normalize(str1);
  const b = normalize(str2);

  if (a === b) return 100;

  const matrix: number[][] = [];
  const len1 = a.length;
  const len2 = b.length;

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (a.charAt(i - 1) === b.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  const maxLength = Math.max(len1, len2);
  const similarity = maxLength === 0 ? 100 : ((maxLength - matrix[len1][len2]) / maxLength) * 100;

  return Math.round(similarity);
}
