'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { completeOnboarding } from '@/app/actions/onboarding';
import type { OnboardingData } from '@/types/onboarding';

interface OnboardingFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
}

const GOAL_OPTIONS = [
  { id: 'learn-songs', label: 'Learn favorite songs', icon: '🎵' },
  { id: 'music-theory', label: 'Music theory', icon: '📚' },
  { id: 'performance', label: 'Performance skills', icon: '🎤' },
  { id: 'songwriting', label: 'Songwriting', icon: '✍️' },
  { id: 'technique', label: 'Improve technique', icon: '🎸' },
];

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', description: 'Know the basics' },
  { value: 'advanced', label: 'Advanced', description: 'Ready for complex pieces' },
];

const LEARNING_STYLES = [
  { id: 'video', label: 'Video tutorials', icon: '📹' },
  { id: 'sheet-music', label: 'Sheet music', icon: '🎼' },
  { id: 'tabs', label: 'Tab notation', icon: '🎵' },
  { id: 'all', label: 'All of the above', icon: '✨' },
];

const INSTRUMENT_PREFERENCES = [
  { value: 'acoustic', label: 'Acoustic', icon: '🎸' },
  { value: 'electric', label: 'Electric', icon: '⚡' },
  { value: 'classical', label: 'Classical', icon: '🎻' },
  { value: 'all', label: 'All types', icon: '🎵' },
];

export function OnboardingForm({ user }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    goals: [],
    skillLevel: 'beginner',
    learningStyle: [],
    instrumentPreference: 'all',
  });

  const firstName = user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '';

  const toggleGoal = (goalId: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter((g) => g !== goalId)
        : [...prev.goals, goalId],
    }));
  };

  const toggleLearningStyle = (styleId: string) => {
    setFormData((prev) => ({
      ...prev,
      learningStyle: prev.learningStyle.includes(styleId)
        ? prev.learningStyle.filter((s) => s !== styleId)
        : [...prev.learningStyle, styleId],
    }));
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.goals.length === 0) {
      toast.error('Please select at least one goal');
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await completeOnboarding(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile set up successfully! 🎉');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Step {currentStep} of 3</span>
          <span>{Math.round((currentStep / 3) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Goals */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Welcome{firstName ? `, ${firstName}` : ''}! 🎸
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              What are your guitar learning goals?
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.goals.includes(goal.id)
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{goal.label}</span>
                  {formData.goals.includes(goal.id) && (
                    <svg
                      className="ml-auto h-5 w-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Skill Level */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              What&apos;s your current skill level?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              This helps us personalize your learning experience
            </p>
          </div>

          <div className="space-y-3">
            {SKILL_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    skillLevel: level.value as OnboardingData['skillLevel'],
                  }))
                }
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  formData.skillLevel === level.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{level.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{level.description}</div>
                  </div>
                  {formData.skillLevel === level.value && (
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Preferences */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Learning preferences
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              How do you prefer to learn?
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {LEARNING_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => toggleLearningStyle(style.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.learningStyle.includes(style.id)
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-center space-y-1">
                    <div className="text-2xl">{style.icon}</div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {style.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Instrument preference
              </label>
              <div className="grid grid-cols-2 gap-3">
                {INSTRUMENT_PREFERENCES.map((instrument) => (
                  <button
                    key={instrument.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, instrumentPreference: instrument.value }))
                    }
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.instrumentPreference === instrument.value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center space-y-1">
                      <div className="text-2xl">{instrument.icon}</div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        {instrument.label}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {currentStep > 1 && (
          <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
            Back
          </Button>
        )}
        {currentStep < 3 ? (
          <Button type="button" onClick={handleNext} className="flex-1">
            Next
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? 'Setting up...' : 'Complete Setup 🎸'}
          </Button>
        )}
      </div>

      {currentStep === 1 && (
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Skip to preferences →
        </button>
      )}
    </div>
  );
}
