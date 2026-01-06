export interface OnboardingData {
  goals: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  learningStyle: string[];
  instrumentPreference: string;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: 'goals' | 'skillLevel' | 'preferences';
}
