'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Copy, Check, AlertCircle } from 'lucide-react';
import { getApiKeys, createApiKey, revokeApiKey, type ApiKey } from '@/app/actions/api-keys';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ApiKeysSection() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  async function loadApiKeys() {
    try {
      const result = await getApiKeys();
      if (result.success && result.data) {
        setApiKeys(result.data);
      } else {
        toast.error(result.error || 'Failed to load API keys');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey() {
    if (!newKeyName.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createApiKey(newKeyName);
      if (result.success && result.apiKey) {
        setCreatedKey(result.apiKey);
        setNewKeyName('');
        loadApiKeys();
        toast.success('API key created successfully');
      } else {
        toast.error(result.error || 'Failed to create API key');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRevokeKey(id: string) {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await revokeApiKey(id);
      if (result.success) {
        setApiKeys(apiKeys.filter((key) => key.id !== id));
        toast.success('API key revoked successfully');
      } else {
        toast.error(result.error || 'Failed to revoke API key');
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
  }

  const handleCopy = async () => {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    }
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    setCreatedKey(null);
    setNewKeyName('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage API keys for accessing the API programmatically. These keys do not expire until
              revoked.
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogDescription>Generate a new API key for your applications.</DialogDescription>
              </DialogHeader>

              {!createdKey ? (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Input
                      id="name"
                      placeholder="Key Name (e.g. iPhone Widget)"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  <Alert
                    variant="default"
                    className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                  >
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                    <AlertTitle className="text-yellow-800 dark:text-yellow-500">
                      Save this key
                    </AlertTitle>
                    <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                      This is the only time we will show you the key. Make sure to copy it now.
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <Input readOnly value={createdKey} className="font-mono text-sm" />
                    </div>
                    <Button size="sm" className="px-3" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <DialogFooter className="sm:justify-end">
                {!createdKey ? (
                  <Button
                    type="button"
                    onClick={handleCreateKey}
                    disabled={!newKeyName.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Key'}
                  </Button>
                ) : (
                  <Button type="button" onClick={handleCloseDialog}>
                    Done
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading keys...</div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            No API keys found. Create one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevokeKey(key.id)}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Revoke</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
