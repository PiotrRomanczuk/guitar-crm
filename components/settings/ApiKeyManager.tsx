'use client';

import { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

interface NewKeyResponse extends ApiKey {
  key: string;
  warning: string;
}

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<NewKeyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  async function fetchApiKeys() {
    try {
      setLoading(true);
      const response = await fetch('/api/api-keys');

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setApiKeys(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching API keys:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createApiKey(e: React.FormEvent) {
    e.preventDefault();

    if (!newKeyName.trim()) {
      setError('Key name is required');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create API key');
      }

      const newKey = await response.json();
      setShowNewKey(newKey);
      setNewKeyName('');
      setSuccess('API key created successfully');
      await fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating API key:', err);
    } finally {
      setCreating(false);
    }
  }

  async function deleteApiKey(id: string) {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      setSuccess('API key deleted successfully');
      setError(null);
      await fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting API key:', err);
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">API Keys</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your API keys for programmatic access to the Guitar CRM API.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-success/10 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-success">{success}</p>
            </div>
          </div>
        </div>
      )}

      {showNewKey && (
        <div className="rounded-md bg-primary/10 p-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">API Key Created</h3>
            <p className="mt-1 text-sm text-muted-foreground">{showNewKey.warning}</p>
            <div className="mt-4 p-3 bg-background rounded border border-border">
              <p className="text-xs text-muted-foreground mb-1">Key:</p>
              <code className="text-sm font-mono break-all">{showNewKey.key}</code>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(showNewKey.key);
                  setSuccess('Key copied to clipboard');
                }}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Copy Key
              </button>
              <button
                onClick={() => setShowNewKey(null)}
                className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded hover:bg-muted/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Create New API Key</h3>
        <form onSubmit={createApiKey} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">
              Key Name
            </label>
            <input
              type="text"
              id="name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Mobile App, Integration Service"
              className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-foreground placeholder-muted-foreground bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={creating}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create API Key'}
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <h3 className="text-lg font-semibold text-foreground p-6 border-b border-border">
          Your API Keys
        </h3>

        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading...</div>
        ) : apiKeys.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No API keys yet. Create one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {key.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(key.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(key.last_used_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          key.is_active
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteApiKey(key.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
