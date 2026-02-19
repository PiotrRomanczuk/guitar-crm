'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface Props {
  role: 'admin' | 'teacher' | 'student';
}

export default function LessonTableEmpty({ role }: Props) {
  const isStudent = role === 'student';
  const imageSrc = isStudent
    ? '/illustrations/no-lessons-scheduled--a-motivational-empty-state-i.png'
    : '/illustrations/all-lessons-scheduled--a-triumphant-empty-state-il.png';

  const altText = isStudent ? 'No lessons scheduled' : 'All lessons scheduled';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      data-testid="empty-state"
      className="flex flex-col items-center justify-center py-8 sm:py-12 text-center border rounded-xl bg-muted/10"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-48 h-36 sm:w-64 sm:h-48 mb-4 sm:mb-6"
      >
        <Image src={imageSrc} alt={altText} fill sizes="(max-width: 640px) 192px, 256px" className="object-contain" />
      </motion.div>
      <p className="text-base sm:text-lg font-medium text-foreground">No lessons found</p>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1 px-4">
        {isStudent
          ? "You haven't been scheduled for any lessons yet."
          : 'Create your first lesson to get started.'}
      </p>
    </motion.div>
  );
}
