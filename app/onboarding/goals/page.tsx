'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  OnboardingLayout,
  OnboardingFooter,
  GoalSelector,
} from '@/components/onboarding';

export default function OnboardingGoalsPage() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const handleNext = () => {
    // In a real app, you'd save the selected goals to the database here
    // For now, we'll store in sessionStorage and continue
    sessionStorage.setItem('onboarding_goals', JSON.stringify(selectedGoals));
    router.push('/onboarding/skill-level');
  };

  const handleSkip = () => {
    router.push('/onboarding/skill-level');
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={3}
      stepLabel="Learning Goals"
      title={
        <>
          Welcome to Guitar CRM!
        </>
      }
      subtitle="Select your primary learning goals so our AI can tailor your lesson plan."
      showBackButton={false}
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 px-6 py-4 pb-24 overflow-y-auto">
        <GoalSelector
          selectedGoals={selectedGoals}
          onChange={setSelectedGoals}
        />
      </div>

      {/* Footer */}
      <OnboardingFooter
        onNext={handleNext}
        onSkip={handleSkip}
        nextLabel="Next Step"
        skipLabel="Skip to preferences"
        showSkip
        nextDisabled={selectedGoals.length === 0}
      />
    </OnboardingLayout>
  );
}
