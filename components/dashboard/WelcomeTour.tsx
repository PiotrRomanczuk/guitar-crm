'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';

interface WelcomeTourProps {
  firstName?: string;
}

export function WelcomeTour({ firstName }: WelcomeTourProps) {
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    // Check if user has seen the tour before
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('dashboard-tour-seen');
    }
    return true;
  });

  useEffect(() => {
    if (!hasSeenTour) {
      const driverObj = driver({
        showProgress: true,
        steps: [
          {
            element: 'body',
            popover: {
              title: `Welcome to Guitar CRM${firstName ? `, ${firstName}` : ''}! 🎸`,
              description:
                "Let's take a quick tour of your dashboard. You can skip this anytime by pressing ESC or clicking outside.",
              side: 'bottom',
              align: 'center',
            },
          },
          {
            element: '[data-tour="stats"]',
            popover: {
              title: 'Your Stats at a Glance',
              description:
                'View key metrics like total lessons, active students, and songs in your library. Click any stat card to see more details.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="quick-actions"]',
            popover: {
              title: 'Quick Actions',
              description:
                'Quickly schedule lessons, add songs, or create assignments without navigating through menus.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="student-list"]',
            popover: {
              title: 'Student Management',
              description:
                'View and manage your students. Use search and filters to find specific students quickly.',
              side: 'left',
            },
          },
          {
            element: '[data-tour="ai-assistant"]',
            popover: {
              title: 'AI Assistant',
              description:
                "Need help? Your AI assistant can answer questions, provide practice tips, and suggest songs based on your preferences. Try asking something!",
              side: 'left',
            },
          },
          {
            element: '[data-tour="todays-agenda"]',
            popover: {
              title: "Today's Agenda",
              description: 'See your upcoming lessons and tasks for today at a glance.',
              side: 'left',
            },
          },
        ],
        onDestroyed: () => {
          localStorage.setItem('dashboard-tour-seen', 'true');
          setHasSeenTour(true);
        },
      });

      // Start tour after a short delay to ensure DOM is ready
      const timer = setTimeout(() => {
        driverObj.drive();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, firstName]);

  const startTour = () => {
    setHasSeenTour(false);
  };

  if (hasSeenTour) {
    return (
      <button
        onClick={startTour}
        className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        🎯 Take Tour
      </button>
    );
  }

  return null;
}
