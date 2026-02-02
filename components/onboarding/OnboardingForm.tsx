'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { completeOnboarding } from '@/app/actions/onboarding';
import type { OnboardingData } from '@/types/onboarding';
import { OnboardingSchema } from '@/schemas/OnboardingSchema';
import FormAlert from '@/components/shared/FormAlert';
import { StepIndicator } from '@/components/ui/step-indicator';
import { SelectableCard } from '@/components/ui/selectable-card';
import { Music, BarChart2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
}

interface FieldErrors {
  goals?: string;
  skillLevel?: string;
}

const GOAL_OPTIONS = [
  { id: 'learn-songs', label: 'Learn favorite songs', description: 'Master the classics', emoji: '🎸' },
  { id: 'music-theory', label: 'Music theory', description: 'Understand the fretboard', emoji: '🎼' },
  { id: 'performance', label: 'Performance skills', description: 'Stage presence & confidence', emoji: '🎤' },
  { id: 'songwriting', label: 'Songwriting', description: 'Compose your own music', emoji: '📝' },
  { id: 'technique', label: 'Improve technique', description: 'Speed, precision, dexterity', emoji: '⚡' },
];

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'I know a few chords or am just starting out.', icon: <Music className="h-6 w-6" /> },
  { value: 'intermediate', label: 'Intermediate', description: 'I can play songs and know some scales.', icon: <BarChart2 className="h-6 w-6" /> },
  { value: 'advanced', label: 'Advanced', description: 'I understand theory and can improvise freely.', icon: <Sparkles className="h-6 w-6" /> },
];

const LEARNING_STYLES = [
  { id: 'video', label: 'Video tutorials', emoji: '📹' },
  { id: 'sheet-music', label: 'Sheet music', emoji: '🎼' },
  { id: 'tabs', label: 'Tab notation', emoji: '🎵' },
  { id: 'all', label: 'All of the above', emoji: '✨' },
];

const INSTRUMENT_PREFERENCES = [
  { value: 'acoustic', label: 'Acoustic', emoji: '🎸' },
  { value: 'electric', label: 'Electric', emoji: '⚡' },
  { value: 'classical', label: 'Classical', emoji: '🎻' },
  { value: 'bass', label: 'Bass Guitar', emoji: '🎵' },
];

export function OnboardingForm({ user }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    goals: [],
    skillLevel: 'beginner',
    learningStyle: [],
    instrumentPreference: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState({
    goals: false,
    skillLevel: false,
  });

  const firstName = user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '';

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const result = OnboardingSchema.safeParse(formData);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as 'goals' | 'skillLevel';
        if (touched[field] && !errors[field]) {
          errors[field] = issue.message;
        }
      }
    }

    return errors;
  };

  useEffect(() => {
    if (touched.goals || touched.skillLevel) {
      setFieldErrors(validate());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.goals, formData.skillLevel, touched.goals, touched.skillLevel]);

  const toggleGoal = (goalId: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter((g) => g !== goalId)
        : [...prev.goals, goalId],
    }));
    setError(null);
    if (touched.goals) {
      setFieldErrors((prev) => ({ ...prev, goals: undefined }));
    }
  };

  const toggleLearningStyle = (styleId: string) => {
    setFormData((prev) => ({
      ...prev,
      learningStyle: prev.learningStyle.includes(styleId)
        ? prev.learningStyle.filter((s) => s !== styleId)
        : [...prev.learningStyle, styleId],
    }));
  };

  const toggleInstrumentPreference = (instrumentId: string) => {
    setFormData((prev) => ({
      ...prev,
      instrumentPreference: prev.instrumentPreference.includes(instrumentId)
        ? prev.instrumentPreference.filter((i) => i !== instrumentId)
        : [...prev.instrumentPreference, instrumentId],
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setTouched({ ...touched, goals: true });
      if (formData.goals.length === 0) {
        return;
      }
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
    const result = OnboardingSchema.safeParse(formData);
    if (!result.success) {
      setError('Please complete all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await completeOnboarding(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        toast.success('Profile set up successfully!');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Learning Goals', 'Skill Level', 'Preferences'];

  return (
    <div className="mt-8 space-y-6">
      {/* Progress Bar */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={3}
        label={stepLabels[currentStep - 1]}
      />

      {/* AI Badge */}
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm w-fit">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="text-primary text-xs font-bold tracking-wide">
          AI PERSONALIZATION
        </span>
      </div>

      {/* Step 1: Goals */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Welcome{firstName ? `, ${firstName}` : ''}!
            </h2>
            <p className="text-muted-foreground mt-1">
              Select your primary learning goals so our AI can tailor your lesson plan.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {GOAL_OPTIONS.map((goal) => (
              <SelectableCard
                key={goal.id}
                selected={formData.goals.includes(goal.id)}
                onSelect={() => toggleGoal(goal.id)}
                emoji={goal.emoji}
                title={goal.label}
                description={goal.description}
                type="checkbox"
              />
            ))}
          </div>
          {fieldErrors.goals && (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.goals}
            </p>
          )}
        </div>
      )}

      {/* Step 2: Skill Level */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Define Your <span className="text-primary">Skill Level</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              Help us tailor your learning path with AI-assisted recommendations.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {SKILL_LEVELS.map((level) => (
              <SelectableCard
                key={level.value}
                selected={formData.skillLevel === level.value}
                onSelect={() => {
                  setFormData((prev) => ({
                    ...prev,
                    skillLevel: level.value as OnboardingData['skillLevel'],
                  }));
                  setError(null);
                }}
                icon={level.icon}
                title={level.label}
                description={level.description}
                type="radio"
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Preferences */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Learning Preferences
            </h2>
            <p className="text-muted-foreground mt-1">
              How do you prefer to learn? (Optional)
            </p>
          </div>

          <div className="space-y-6">
            <fieldset>
              <legend className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide text-muted-foreground">
                Learning style
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {LEARNING_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => toggleLearningStyle(style.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-center',
                      formData.learningStyle.includes(style.id)
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border bg-card hover:border-primary/50'
                    )}
                    aria-pressed={formData.learningStyle.includes(style.id)}
                  >
                    <div className="text-2xl mb-1" aria-hidden="true">{style.emoji}</div>
                    <div className="text-xs font-medium text-foreground">{style.label}</div>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide text-muted-foreground">
                Instrument preference
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {INSTRUMENT_PREFERENCES.map((instrument) => (
                  <button
                    key={instrument.value}
                    type="button"
                    onClick={() => toggleInstrumentPreference(instrument.value)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-center',
                      formData.instrumentPreference.includes(instrument.value)
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border bg-card hover:border-primary/50'
                    )}
                    aria-pressed={formData.instrumentPreference.includes(instrument.value)}
                  >
                    <div className="text-2xl mb-1" aria-hidden="true">{instrument.emoji}</div>
                    <div className="text-xs font-medium text-foreground">{instrument.label}</div>
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      )}

      {error && <FormAlert type="error" message={error} />}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={loading}
            className="flex-1 h-12 rounded-lg font-bold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={handleNext}
            className="flex-1 h-12 rounded-lg font-bold shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-12 rounded-lg font-bold shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        )}
      </div>

      {currentStep === 1 && (
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
          disabled={loading}
        >
          Skip to preferences
        </button>
      )}
    </div>
  );
}
