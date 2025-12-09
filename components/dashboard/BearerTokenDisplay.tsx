'use client';

import { useState, useEffect } from 'react';

export function BearerTokenDisplay() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/api-keys');
        if (!response.ok) {
          setLoading(false);
          return;
        }

        const keys = await response.json();
        // Get the first active key or the most recent one
        const activeKey = keys.find((k: any) => k.is_active) || keys[0];

        if (activeKey) {
          // We can't get the plain key for existing keys (by design for security)
          // So we'll show a note and suggest creating a new one
          setToken(null);
        } else {
          setToken(null);
        }
      } catch (error) {
        console.error('Failed to fetch API keys:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  const handleCreateToken = async () => {
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Default Token ${new Date().toLocaleDateString()}`,
        }),
      });

      if (!response.ok) {
        console.error('Failed to create token');
        return;
      }

      const data = await response.json();
      setToken(data.token);
      setCopied(false);
    } catch (error) {
      console.error('Failed to create token:', error);
    }
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-blue-200 dark:border-blue-900">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🔑 Bearer Token
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Use this token for API authentication in your applications
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
      ) : token ? (
        <div className="space-y-3">
          <div className="bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <code
                  className="text-sm font-mono text-gray-900 dark:text-gray-100 block overflow-x-auto"
                  style={{ wordBreak: 'break-all' }}
                >
                  {showToken ? token : '••••••••' + token.slice(-8)}
                </code>
              </div>
              <button
                onClick={() => setShowToken(!showToken)}
                className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 whitespace-nowrap"
              >
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            onClick={handleCopyToken}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 font-medium text-sm transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy Token'}
          </button>

          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
            ⚠️ Keep this token secret! Never share it publicly. Use it in the Authorization header:{' '}
            <code className="font-mono">Authorization: Bearer &lt;token&gt;</code>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No bearer token found. Create one to get started with API access.
          </p>
          <button
            onClick={handleCreateToken}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 font-medium text-sm transition-colors"
          >
            + Create Bearer Token
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You can manage multiple tokens in your{' '}
            <a href="/settings" className="text-blue-600 dark:text-blue-400 hover:underline">
              settings
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
