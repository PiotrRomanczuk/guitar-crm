'use client';

import { useState, useEffect } from 'react';

const PHRASES = [
  'Master your favorite songs.',
  'Track your progress.',
  'Achieve your musical goals.',
];

export function AnimatedText() {
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = PHRASES[phraseIndex];
    const typeSpeed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentPhrase) {
        // Finished typing, wait before deleting
        setTimeout(() => setIsDeleting(true), 2000);
        return;
      }

      if (isDeleting && text === '') {
        // Finished deleting, move to next phrase
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
        return;
      }

      const nextText = isDeleting
        ? currentPhrase.substring(0, text.length - 1)
        : currentPhrase.substring(0, text.length + 1);

      setText(nextText);
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex]);

  return (
    <p className="text-white text-lg font-medium min-h-7">
      {text}
      <span className="animate-pulse">|</span>
    </p>
  );
}
