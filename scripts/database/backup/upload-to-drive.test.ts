import { uploadFile } from './upload-to-drive';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Mock dependencies
jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn(),
    },
    drive: jest.fn(),
  },
}));

jest.mock('fs');
jest.mock('path');

describe('uploadFile', () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
    throw new Error(`Process.exit called with ${code}`);
  });
  
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

  const originalEnv = process.env;
  const originalArgv = process.argv;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.argv = [...originalArgv];
    
    // Default mocks
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.statSync as jest.Mock).mockReturnValue({ size: 1024 });
    (fs.createReadStream as jest.Mock).mockReturnValue('mock-stream');
    (path.basename as jest.Mock).mockReturnValue('backup.sql');
  });

  afterAll(() => {
    process.env = originalEnv;
    process.argv = originalArgv;
    mockExit.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  it('should fail if no file path provided', async () => {
    process.argv = ['node', 'script.ts']; // No file path arg
    
    await expect(uploadFile()).rejects.toThrow('Process.exit called with 1');
    expect(mockConsoleError).toHaveBeenCalledWith('Please provide a file path');
  });

  it('should fail if file does not exist', async () => {
    process.argv = ['node', 'script.ts', 'missing.sql'];
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    await expect(uploadFile()).rejects.toThrow('Process.exit called with 1');
    expect(mockConsoleError).toHaveBeenCalledWith('File not found:', 'missing.sql');
  });

  it('should fail if credentials are missing', async () => {
    process.argv = ['node', 'script.ts', 'backup.sql'];
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY = '';
    process.env.GOOGLE_DRIVE_FOLDER_ID = 'folder-id';

    await expect(uploadFile()).rejects.toThrow('Process.exit called with 0');
    expect(mockConsoleWarn).toHaveBeenCalledWith(expect.stringContaining('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set'));
  });

  it('should upload file successfully', async () => {
    process.argv = ['node', 'script.ts', 'backup.sql'];
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY = '{"private_key": "key"}';
    process.env.GOOGLE_DRIVE_FOLDER_ID = 'folder-id';

    const mockCreate = jest.fn().mockResolvedValue({
      data: { id: 'file-id', webViewLink: 'http://link' }
    });

    (google.drive as jest.Mock).mockReturnValue({
      files: {
        create: mockCreate
      }
    });

    await uploadFile();

    expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
      credentials: { private_key: 'key' },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    expect(mockCreate).toHaveBeenCalledWith({
      requestBody: {
        name: 'backup.sql',
        parents: ['folder-id'],
      },
      media: {
        mimeType: 'application/sql',
        body: 'mock-stream',
      },
      fields: 'id, name, webViewLink',
    });

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Upload successful'));
  });

  it('should handle upload errors', async () => {
    process.argv = ['node', 'script.ts', 'backup.sql'];
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY = '{"private_key": "key"}';
    process.env.GOOGLE_DRIVE_FOLDER_ID = 'folder-id';

    const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));

    (google.drive as jest.Mock).mockReturnValue({
      files: {
        create: mockCreate
      }
    });

    await expect(uploadFile()).rejects.toThrow('Process.exit called with 1');
    expect(mockConsoleError).toHaveBeenCalledWith('❌ Upload failed:', 'API Error');
  });
});
