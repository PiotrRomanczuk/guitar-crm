'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import path from 'path';

const execAsync = promisify(exec);

export async function performDatabaseBackup() {
  try {
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Database backup is only available in development' };
    }

    const { isAdmin } = await getUserWithRolesSSR();

    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Only admins can perform backups' };
    }

    const scriptPath = path.join(process.cwd(), 'scripts', 'database', 'backup', 'backup-db.sh');

    if (!existsSync(scriptPath)) {
      return { success: false, error: 'Backup script not found' };
    }

    const env = { ...process.env };
    delete env.LD_PRELOAD;
    delete env.NODE_OPTIONS;

    const { stderr } = await execAsync(`bash "${scriptPath}"`, {
      env,
      timeout: 60_000,
    });

    if (stderr) {
      console.error('[backup] stderr output during backup');
    }

    return { success: true, message: 'Backup completed successfully' };
  } catch {
    return { success: false, error: 'Backup failed. Check server logs for details.' };
  }
}
