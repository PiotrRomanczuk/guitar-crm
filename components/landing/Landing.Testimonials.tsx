'use client';

import { useEffect, useRef, useState } from 'react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      "Guitar CRM transformed how I run my studio. I used to spend hours on admin work — now I focus on what matters: teaching music.",
    author: 'Sarah Mitchell',
    role: 'Private Guitar Teacher',
    location: 'Austin, TX',
    avatar: 'SM',
    color: 'from-amber-500 to-orange-500',
  },
  {
    quote:
      "My students love the practice tracking. They're more motivated than ever, and I can see exactly where each one needs help.",
    author: 'Marcus Chen',
    role: 'Jazz Guitar Instructor',
    location: 'Seattle, WA',
    avatar: 'MC',
    color: 'from-violet-500 to-purple-500',
  },
  {
    quote:
      "The scheduling alone saves me 5 hours a week. But the real magic is how it helps me remember every detail about every student.",
    author: 'Elena Rodriguez',
    role: 'Classical Guitar Teacher',
    location: 'Miami, FL',
    avatar: 'ER',
    color: 'from-rose-500 to-pink-500',
  },
  {
    quote:
      "As a student, having all my lessons, assignments, and progress in one place keeps me accountable. I've improved faster than ever.",
    author: 'James Park',
    role: 'Guitar Student',
    location: 'Chicago, IL',
    avatar: 'JP',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    quote:
      "We run a music school with 12 teachers. Guitar CRM brought everyone together on one platform. Game changer.",
    author: 'Amanda Foster',
    role: 'Music School Director',
    location: 'Denver, CO',
    avatar: 'AF',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    quote:
      "The Spotify integration for building repertoire lists? Genius. My students can listen to songs before we learn them.",
    author: 'David Kim',
    role: 'Contemporary Guitar Teacher',
    location: 'Los Angeles, CA',
    avatar: 'DK',
    color: 'from-primary to-amber-500',
  },
];

function TestimonialCard({
  quote,
  author,
  role,
  location,
  avatar,
  color,
  index,
}: (typeof testimonials)[0] & { index: number }) {
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
      className={`group relative p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Quote icon */}
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
        <Quote className="w-4 h-4 text-primary" />
      </div>

      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

      <div className="relative">
        {/* Quote */}
        <p className="text-foreground leading-relaxed mb-6">&ldquo;{quote}&rdquo;</p>

        {/* Author */}
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-semibold text-sm shadow-lg`}
          >
            {avatar}
          </div>
          <div>
            <p className="font-semibold text-foreground">{author}</p>
            <p className="text-sm text-muted-foreground">
              {role} · {location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingTestimonials() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -translate-y-1/2" />
      </div>

      {/* Organic wave decoration */}
      <svg
        className="absolute top-0 left-0 w-full h-24 text-muted/30"
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0 Q360,96 720,48 T1440,96 L1440,0 Z"
          fill="currentColor"
        />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              Stories
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Loved by musicians everywhere
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of teachers and students who&apos;ve transformed their musical journey.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard key={testimonial.author} {...testimonial} index={i} />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '2,500+', label: 'Teachers' },
            { value: '45,000+', label: 'Students' },
            { value: '1.2M+', label: 'Lessons Tracked' },
            { value: '4.9/5', label: 'Average Rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
