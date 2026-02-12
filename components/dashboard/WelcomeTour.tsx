'use client';

import { useEffect, useState, useCallback } from 'react';
import { driver } from 'driver.js';
import { Button } from '@/components/ui/button';

interface WelcomeTourProps {
  firstName?: string;
}

const TOUR_STEPS = [
  {
    element: 'body',
    popover: {
      title: 'Welcome to Strummy!',
      description:
        "Let's take a quick tour of your dashboard. You can skip anytime by pressing ESC.",
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="todays-agenda"]',
    popover: {
      title: "Today's Agenda",
      description: 'See your upcoming lessons and tasks for today at a glance.',
      side: 'left' as const,
    },
  },
  {
    element: '[data-tour="student-list"]',
    popover: {
      title: 'Student Management',
      description:
        'View and manage your students. Use search and filters to find specific students quickly.',
      side: 'left' as const,
    },
  },
];

export function WelcomeTour({ firstName }: WelcomeTourProps) {
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('dashboard-tour-seen');
    }
    return true;
  });

  const personalizedSteps = TOUR_STEPS.map((step, i) =>
    i === 0 && firstName
      ? { ...step, popover: { ...step.popover, title: `Welcome to Strummy, ${firstName}!` } }
      : step
  );

  const startTour = useCallback(() => {
    setHasSeenTour(false);
  }, []);

  useEffect(() => {
    if (hasSeenTour) return;

    const driverObj = driver({
      showProgress: true,
      steps: personalizedSteps,
      onDestroyed: () => {
        localStorage.setItem('dashboard-tour-seen', 'true');
        setHasSeenTour(true);
      },
    });

    const timer = setTimeout(() => driverObj.drive(), 500);
    return () => clearTimeout(timer);
  }, [hasSeenTour, personalizedSteps]);

  if (!hasSeenTour) return null;

  return (
    <Button
      onClick={startTour}
      size="sm"
      className="fixed bottom-4 right-4 z-50 shadow-lg"
    >
      Take Tour
    </Button>
  );
}
