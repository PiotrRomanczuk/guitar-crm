'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Users,
  Calendar,
  Music2,
  TrendingUp,
  Bell,
  CreditCard,
  BookOpen,
  Target,
  Sparkles,
  BarChart3,
  Clock,
  FileText,
} from 'lucide-react';

const teacherFeatures = [
  {
    icon: Users,
    title: 'Student Profiles',
    description: 'Complete student records with learning history, preferences, and progress notes.',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Drag-and-drop calendar with conflict detection and automatic reminders.',
  },
  {
    icon: Music2,
    title: 'Repertoire Library',
    description: 'Organize songs by difficulty, genre, and technique with Spotify integration.',
  },
  {
    icon: CreditCard,
    title: 'Payment Tracking',
    description: 'Invoice generation, payment history, and automated billing reminders.',
  },
  {
    icon: FileText,
    title: 'Lesson Plans',
    description: 'Create reusable lesson templates and track what was covered each session.',
  },
  {
    icon: BarChart3,
    title: 'Studio Analytics',
    description: 'Insights on retention, revenue, and teaching patterns to grow your studio.',
  },
];

const studentFeatures = [
  {
    icon: BookOpen,
    title: 'Practice Journal',
    description: 'Log practice sessions with notes, record clips, and track consistency.',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set and achieve musical goals with visual progress indicators.',
  },
  {
    icon: Music2,
    title: 'Song Library',
    description: 'Access your assigned repertoire with tabs, chords, and reference recordings.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Insights',
    description: 'See your growth over time with skill assessments and milestone tracking.',
  },
  {
    icon: Clock,
    title: 'Lesson History',
    description: 'Review past lessons, assignments, and teacher feedback anytime.',
  },
  {
    icon: Sparkles,
    title: 'AI Practice Tips',
    description: 'Get personalized suggestions based on your goals and practice patterns.',
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: typeof Users;
  title: string;
  description: string;
  index: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 75}ms` }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

      <div className="relative">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
          <Icon className="w-5 h-5 text-primary" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function SectionHeader({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
        <span className="text-xs font-medium text-primary uppercase tracking-wider">{badge}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{title}</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* For Teachers */}
        <div className="mb-24">
          <SectionHeader
            badge="For Teachers"
            title="Run your studio effortlessly"
            subtitle="Everything you need to manage students, schedule lessons, and grow your teaching practice."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherFeatures.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </div>
        </div>

        {/* Divider with organic shape */}
        <div className="relative py-12">
          <svg
            className="w-full h-12 text-border"
            viewBox="0 0 1200 48"
            preserveAspectRatio="none"
          >
            <path
              d="M0,24 Q300,48 600,24 T1200,24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="8 8"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* For Students */}
        <div>
          <SectionHeader
            badge="For Students"
            title="Accelerate your journey"
            subtitle="Tools designed to help you practice smarter, track progress, and stay motivated."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentFeatures.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
