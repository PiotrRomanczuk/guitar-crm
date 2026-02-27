import type { Metadata } from 'next';
import FretboardPageClient from './FretboardPageClient';

export const metadata: Metadata = {
  title: 'Guitar Fretboard | Strummy',
  description: 'Explore scales, chords, and notes across the guitar fretboard with interactive audio.',
};

export default function FretboardPage() {
  return <FretboardPageClient />;
}
