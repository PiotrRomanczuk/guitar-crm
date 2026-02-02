'use client';

import Link from 'next/link';
import { Brain, Library, TrendingUp, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Lesson Notes',
    description:
      'Auto-generate detailed summaries and practice plans after every lesson so you can focus entirely on teaching.',
  },
  {
    icon: Library,
    title: 'Song Library',
    description:
      'Access over 1000+ tabs, chords, and sheet music directly integrated into your dashboard for seamless lesson flow.',
  },
  {
    icon: TrendingUp,
    title: 'Student Progress',
    description:
      'Track practice streaks, technical improvements, and repertoire growth visually to keep students motivated.',
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Brain;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-amber-200 dark:border-[#3a2e22] bg-white dark:bg-[#221b10] p-8 transition-all hover:border-[#ec9c13]/50 hover:shadow-xl hover:shadow-[#ec9c13]/5 hover:-translate-y-1">
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ec9c13]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex flex-col items-start gap-6 h-full">
        {/* Icon */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-[#2e261d] text-[#d4880f] dark:text-[#ec9c13] border border-amber-200 dark:border-[#3a2e22] shadow-inner group-hover:bg-amber-100 dark:group-hover:bg-[#3a2e22] transition-colors">
          <Icon className="h-7 w-7" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h4>
          <p className="text-gray-600 dark:text-[#b9af9d] leading-relaxed">{description}</p>
        </div>

        {/* Link */}
        <Link
          href="#"
          className="inline-flex items-center text-[#d4880f] dark:text-[#ec9c13] font-bold text-sm hover:text-amber-600 dark:hover:text-amber-300 mt-auto"
        >
          Learn more
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}

export function LandingFeatures() {
  return (
    <section id="features" className="px-6 lg:px-8 py-20 bg-amber-50/50 dark:bg-[#181511] flex flex-col gap-12 items-center">
      {/* Header */}
      <div className="flex flex-col gap-3 text-center max-w-3xl">
        <h3 className="text-4xl font-bold text-gray-900 dark:text-white">Crafted Features</h3>
        <p className="text-gray-600 dark:text-[#b9af9d] text-lg">
          Everything you need to manage your studio effectively, built with precision.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
