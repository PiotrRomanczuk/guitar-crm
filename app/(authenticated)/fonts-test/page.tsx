/**
 * Font Testing Page
 *
 * Test and preview all available font schemes.
 * Access this page at /fonts-test
 *
 * To disable this page, delete this file or add authentication checks.
 */

import { FontSwitcher } from '@/components/settings/FontSwitcher';

export default function FontsTestPage() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <FontSwitcher />
    </div>
  );
}
