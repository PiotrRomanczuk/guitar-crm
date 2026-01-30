'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, Pencil, Send } from 'lucide-react';
import { AssignmentTemplate } from '@/schemas';
import { deleteAssignmentTemplate } from '@/app/actions/assignment-templates';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/ui/empty-state';

interface TemplateListProps {
  templates: AssignmentTemplate[];
}

export default function TemplateList({ templates }: TemplateListProps) {
  const router = useRouter();
  const [templateToDelete, setTemplateToDelete] = useState<AssignmentTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!templateToDelete?.id) return;

    setIsDeleting(true);
    try {
      await deleteAssignmentTemplate(templateToDelete.id);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setTemplateToDelete(null);
    }
  };

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No templates"
        message="Get started by creating a new assignment template."
        actionLabel="Create Template"
        actionHref="/dashboard/assignments/templates/new"
      />
    );
  }

  return (
    <>
      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground truncate">{template.title}</h3>
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {template.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href={`/dashboard/assignments/new?templateId=${template.id}`}>
                  <Send className="h-4 w-4 mr-1" />
                  Assign
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href={`/dashboard/assignments/templates/${template.id}`}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setTemplateToDelete(template)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{template.title}</TableCell>
                <TableCell className="text-muted-foreground max-w-md truncate">
                  {template.description}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/assignments/new?templateId=${template.id}`}>
                        <Send className="h-4 w-4 mr-1" />
                        Assign
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/assignments/templates/${template.id}`}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setTemplateToDelete(template)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template
              {templateToDelete && (
                <span className="font-medium text-foreground"> &quot;{templateToDelete.title}&quot;</span>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
