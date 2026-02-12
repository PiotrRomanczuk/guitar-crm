import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export function StudentListError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="bg-card rounded-xl border border-destructive/50 overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-destructive">Error loading students</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Failed to fetch student data. Please try again.
        </p>
      </div>
      <div className="p-6 text-center">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="min-h-[44px]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

export function StudentListEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 sm:p-12 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex justify-center mb-4"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
      </motion.div>
      <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        Get started by adding your first student to begin tracking their progress.
      </p>
      <Link href="/dashboard/users">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="lg" className="min-h-[44px]">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function StudentListNoResults() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 sm:p-12 text-center"
    >
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Try adjusting your search or filter criteria.
      </p>
    </motion.div>
  );
}
