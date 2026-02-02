'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  OnboardingLayout,
  OnboardingFooter,
  SkillLevelSelector,
  type SkillLevel,
} from '@/components/onboarding';

export default function OnboardingSkillLevelPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selectedLevel) return;

    setLoading(true);

    // In a real app, you'd save the skill level to the database here
    // For now, we'll store in sessionStorage
    sessionStorage.setItem('onboarding_skill_level', selectedLevel);

    // Get previously stored goals
    const goalsJson = sessionStorage.getItem('onboarding_goals');
    const goals = goalsJson ? JSON.parse(goalsJson) : [];

    // TODO: Save onboarding data to user profile via API
    // await saveOnboardingData({ goals, skillLevel: selectedLevel });

    // Clear session storage
    sessionStorage.removeItem('onboarding_goals');
    sessionStorage.removeItem('onboarding_skill_level');

    // Redirect to dashboard
    router.push('/dashboard');
  };

  const handleBack = () => {
    router.push('/onboarding/goals');
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={3}
      stepLabel=""
      title={
        <>
          Define Your <br />
          <span className="text-primary">Skill Level</span>
        </>
      }
      subtitle="Help us tailor your learning path with AI-assisted recommendations suited to your abilities."
      onBack={handleBack}
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 px-6 py-4 flex flex-col gap-4">
        <SkillLevelSelector
          selectedLevel={selectedLevel}
          onChange={setSelectedLevel}
        />
      </div>

      {/* Footer */}
      <OnboardingFooter
        onNext={handleNext}
        onBack={handleBack}
        nextLabel="Next"
        backLabel="Back"
        showBack
        nextDisabled={!selectedLevel}
        loading={loading}
      />
    </OnboardingLayout>
  );
}
