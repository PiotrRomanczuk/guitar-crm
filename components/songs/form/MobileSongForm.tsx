'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';
import SongFormFieldText from './FieldText';
import SongFormFieldSelect from './FieldSelect';
import SpotifySearch from './SpotifySearch';
import ImageUpload from '@/components/shared/ImageUpload';
import { Label } from '@/components/ui/label';
import { MUSIC_KEY_OPTIONS, LEVEL_OPTIONS } from './options';
import { SongFormData } from './helpers';
import { SpotifyTrack } from '@/types/spotify';
import CategoryCombobox from './CategoryCombobox';
import { toast } from 'sonner';

interface MobileSongFormProps {
  formData: SongFormData;
  errors: Record<string, string>;
  onChange: (field: keyof SongFormData, value: SongFormData[keyof SongFormData]) => void;
  onBlur: (field: string) => void;
  onSpotifySelect: (track: SpotifyTrack) => void;
}

const STEP_LABELS = ['Essential Info', 'Resources & Media', 'Musical Details'];

// Required fields per step (must be filled to advance)
const REQUIRED_FIELDS = {
  1: ['title', 'author', 'level', 'key'],
  2: [] as string[], // No required fields in this step
  3: [] as string[], // No required fields in this step
};

export default function MobileSongForm({
  formData,
  errors,
  onChange,
  onBlur,
  onSpotifySelect,
}: MobileSongFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const canAdvance = () => {
    const requiredForStep = REQUIRED_FIELDS[currentStep as keyof typeof REQUIRED_FIELDS] || [];

    // Check if all required fields are filled and have no errors
    return requiredForStep.every((field) => {
      const value = formData[field as keyof SongFormData];
      const hasError = errors[field];
      const isFilled = value !== '' && value !== null && value !== undefined;
      return isFilled && !hasError;
    });
  };

  const handleNext = () => {
    if (!canAdvance()) {
      toast.error('Please fill all required fields before continuing');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={3}
        stepLabels={STEP_LABELS}
      />

      {/* Step Content */}
      <div className="min-h-[400px]">
        {/* Step 1: Essential Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <SpotifySearch onSelect={onSpotifySelect} />

            <SongFormFieldText
              label="Title"
              id="title"
              value={formData.title}
              error={errors.title}
              onChange={(value) => onChange('title', value)}
              onBlur={() => onBlur('title')}
              required
            />

            <SongFormFieldText
              label="Author"
              id="author"
              value={formData.author}
              error={errors.author}
              onChange={(value) => onChange('author', value)}
              onBlur={() => onBlur('author')}
              required
            />

            <SongFormFieldSelect
              label="Difficulty Level"
              id="level"
              value={formData.level}
              error={errors.level}
              onChange={(value) => onChange('level', value)}
              onBlur={() => onBlur('level')}
              options={LEVEL_OPTIONS}
              required
            />

            <SongFormFieldSelect
              label="Musical Key"
              id="key"
              value={formData.key}
              error={errors.key}
              onChange={(value) => onChange('key', value)}
              onBlur={() => onBlur('key')}
              options={MUSIC_KEY_OPTIONS}
              required
            />

            <CategoryCombobox
              value={formData.category}
              error={errors.category}
              onChange={(value) => onChange('category', value)}
              onBlur={() => onBlur('category')}
            />
          </div>
        )}

        {/* Step 2: Resources & Media */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <SongFormFieldText
              label="YouTube URL"
              id="youtube_url"
              type="url"
              value={formData.youtube_url}
              error={errors.youtube_url}
              onChange={(value) => onChange('youtube_url', value)}
              onBlur={() => onBlur('youtube_url')}
              placeholder="https://youtube.com/watch?v=..."
            />

            <SongFormFieldText
              label="Spotify Link"
              id="spotify_link_url"
              type="url"
              value={formData.spotify_link_url}
              error={errors.spotify_link_url}
              onChange={(value) => onChange('spotify_link_url', value)}
              onBlur={() => onBlur('spotify_link_url')}
              placeholder="https://open.spotify.com/track/..."
            />

            <SongFormFieldText
              label="Ultimate Guitar Link"
              id="ultimate_guitar_link"
              type="url"
              value={formData.ultimate_guitar_link}
              error={errors.ultimate_guitar_link}
              onChange={(value) => onChange('ultimate_guitar_link', value)}
              onBlur={() => onBlur('ultimate_guitar_link')}
            />

            <SongFormFieldText
              label="TikTok Short URL (Practice)"
              id="tiktok_short_url"
              type="url"
              value={formData.tiktok_short_url}
              error={errors.tiktok_short_url}
              onChange={(value) => onChange('tiktok_short_url', value)}
              onBlur={() => onBlur('tiktok_short_url')}
              placeholder="https://www.tiktok.com/@user/video/..."
            />

            <div className="space-y-2">
              <Label>Gallery Images</Label>
              <ImageUpload
                value={formData.gallery_images}
                onChange={(value) => onChange('gallery_images', value)}
                coverImage={formData.cover_image_url}
                onCoverSelect={(url) => onChange('cover_image_url', url)}
              />
              <p className="text-xs text-muted-foreground">
                Upload images for the song gallery. Click the star icon to set an image as the cover.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Musical Details */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <SongFormFieldText
              label="Capo Fret"
              id="capo_fret"
              type="number"
              value={formData.capo_fret?.toString() || ''}
              error={errors.capo_fret}
              onChange={(value) => onChange('capo_fret', value ? parseInt(value) : null)}
              onBlur={() => onBlur('capo_fret')}
              placeholder="0"
            />

            <SongFormFieldText
              label="Tempo (BPM)"
              id="tempo"
              type="number"
              value={formData.tempo?.toString() || ''}
              error={errors.tempo}
              onChange={(value) => onChange('tempo', value ? parseInt(value) : null)}
              onBlur={() => onBlur('tempo')}
              placeholder="120"
            />

            <SongFormFieldText
              label="Time Signature"
              id="time_signature"
              type="number"
              value={formData.time_signature?.toString() || ''}
              error={errors.time_signature}
              onChange={(value) => onChange('time_signature', value ? parseInt(value) : null)}
              onBlur={() => onBlur('time_signature')}
              placeholder="4"
            />

            <SongFormFieldText
              label="Duration (ms)"
              id="duration_ms"
              type="number"
              value={formData.duration_ms?.toString() || ''}
              error={errors.duration_ms}
              onChange={(value) => onChange('duration_ms', value ? parseInt(value) : null)}
              onBlur={() => onBlur('duration_ms')}
              placeholder="240000"
            />

            <SongFormFieldText
              label="Release Year"
              id="release_year"
              type="number"
              value={formData.release_year?.toString() || ''}
              error={errors.release_year}
              onChange={(value) => onChange('release_year', value ? parseInt(value) : null)}
              onBlur={() => onBlur('release_year')}
              placeholder="1995"
            />

            <SongFormFieldText
              label="Strumming Pattern"
              id="strumming_pattern"
              value={formData.strumming_pattern}
              error={errors.strumming_pattern}
              onChange={(value) => onChange('strumming_pattern', value)}
              onBlur={() => onBlur('strumming_pattern')}
              placeholder="D DU UDU"
            />

            <SongFormFieldText
              label="Chords"
              id="chords"
              value={formData.chords}
              error={errors.chords}
              onChange={(value) => onChange('chords', value)}
              onBlur={() => onBlur('chords')}
              placeholder="Em7 G D C"
            />

            <SongFormFieldText
              label="Short Title"
              id="short_title"
              value={formData.short_title}
              error={errors.short_title}
              onChange={(value) => onChange('short_title', value)}
              onBlur={() => onBlur('short_title')}
              placeholder="Brief title"
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border sticky bottom-0 bg-background pb-safe">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
        )}

        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={handleNext}
            className="flex-1"
            disabled={!canAdvance()}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            className="flex-1"
          >
            Save Song
          </Button>
        )}
      </div>
    </div>
  );
}
