'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import path from 'path';

const execAsync = promisify(exec);

export async function performDatabaseBackup() {
  try {
    const { isAdmin } = await getUserWithRolesSSR();

    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Only admins can perform backups' };
    }

    // Path to the backup script
    const scriptPath = path.join(process.cwd(), 'scripts', 'database', 'backup', 'full-backup.sh');

    // Prepare environment variables, removing potentially problematic ones injected by VS Code extensions
    const env = { ...process.env };
    delete env.LD_PRELOAD;
    delete env.NODE_OPTIONS;

    // Execute the script using bash directly to avoid permission issues
    // and pass the sanitized environment
    const { stdout, stderr } = await execAsync(`bash "${scriptPath}"`, { env });

    console.log('Backup stdout:', stdout);
    if (stderr) console.error('Backup stderr:', stderr);

    return { success: true, message: 'Backup completed successfully' };
  } catch (error: unknown) {
    console.error('Backup failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Backup failed';
    return { success: false, error: errorMessage };
  }
}
