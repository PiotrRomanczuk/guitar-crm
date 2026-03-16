'use client';

import StepWizardForm from '@/components/shared/StepWizardForm';
import { FormFieldText, FormFieldSelect } from '@/components/shared/FormField';
import SpotifySearch from './SpotifySearch';
import ImageUpload from '@/components/shared/ImageUpload';
import { Label } from '@/components/ui/label';
import { MUSIC_KEY_OPTIONS, LEVEL_OPTIONS } from './options';
import { SongFormData } from './helpers';
import { SpotifyTrack } from '@/types/spotify';
import CategoryCombobox from './CategoryCombobox';

interface MobileSongFormProps {
  formData: SongFormData;
  errors: Record<string, string>;
  onChange: (field: keyof SongFormData, value: SongFormData[keyof SongFormData]) => void;
  onBlur: (field: string) => void;
  onSpotifySelect: (track: SpotifyTrack) => void;
}

export default function MobileSongForm({
  formData,
  errors,
  onChange,
  onBlur,
  onSpotifySelect,
}: MobileSongFormProps) {
  const steps = [
    {
      label: 'Essential Info',
      requiredFields: ['title', 'author', 'level', 'key'],
      content: (
        <div className="space-y-4">
          <SpotifySearch onSelect={onSpotifySelect} />

          <FormFieldText
            label="Title"
            id="title"
            value={formData.title}
            error={errors.title}
            onChange={(value) => onChange('title', value)}
            onBlur={() => onBlur('title')}
            required
          />

          <FormFieldText
            label="Author"
            id="author"
            value={formData.author}
            error={errors.author}
            onChange={(value) => onChange('author', value)}
            onBlur={() => onBlur('author')}
            required
          />

          <FormFieldSelect
            label="Difficulty Level"
            id="level"
            value={formData.level}
            error={errors.level}
            onChange={(value) => onChange('level', value)}
            onBlur={() => onBlur('level')}
            options={LEVEL_OPTIONS}
            required
          />

          <FormFieldSelect
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
      ),
    },
    {
      label: 'Resources & Media',
      content: (
        <div className="space-y-4">
          <FormFieldText
            label="YouTube URL"
            id="youtube_url"
            type="url"
            value={formData.youtube_url}
            error={errors.youtube_url}
            onChange={(value) => onChange('youtube_url', value)}
            onBlur={() => onBlur('youtube_url')}
            placeholder="https://youtube.com/watch?v=..."
          />

          <FormFieldText
            label="Spotify Link"
            id="spotify_link_url"
            type="url"
            value={formData.spotify_link_url}
            error={errors.spotify_link_url}
            onChange={(value) => onChange('spotify_link_url', value)}
            onBlur={() => onBlur('spotify_link_url')}
            placeholder="https://open.spotify.com/track/..."
          />

          <FormFieldText
            label="Ultimate Guitar Link"
            id="ultimate_guitar_link"
            type="url"
            value={formData.ultimate_guitar_link}
            error={errors.ultimate_guitar_link}
            onChange={(value) => onChange('ultimate_guitar_link', value)}
            onBlur={() => onBlur('ultimate_guitar_link')}
          />

          <FormFieldText
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
              Upload images for the song gallery. Click the star icon to set as cover.
            </p>
          </div>
        </div>
      ),
    },
    {
      label: 'Musical Details',
      content: (
        <div className="space-y-4">
          <FormFieldText
            label="Capo Fret"
            id="capo_fret"
            type="number"
            value={formData.capo_fret?.toString() || ''}
            error={errors.capo_fret}
            onChange={(value) => onChange('capo_fret', value ? parseInt(value) : null)}
            onBlur={() => onBlur('capo_fret')}
            placeholder="0"
          />

          <FormFieldText
            label="Tempo (BPM)"
            id="tempo"
            type="number"
            value={formData.tempo?.toString() || ''}
            error={errors.tempo}
            onChange={(value) => onChange('tempo', value ? parseInt(value) : null)}
            onBlur={() => onBlur('tempo')}
            placeholder="120"
          />

          <FormFieldText
            label="Time Signature"
            id="time_signature"
            type="number"
            value={formData.time_signature?.toString() || ''}
            error={errors.time_signature}
            onChange={(value) => onChange('time_signature', value ? parseInt(value) : null)}
            onBlur={() => onBlur('time_signature')}
            placeholder="4"
          />

          <FormFieldText
            label="Duration (ms)"
            id="duration_ms"
            type="number"
            value={formData.duration_ms?.toString() || ''}
            error={errors.duration_ms}
            onChange={(value) => onChange('duration_ms', value ? parseInt(value) : null)}
            onBlur={() => onBlur('duration_ms')}
            placeholder="240000"
          />

          <FormFieldText
            label="Release Year"
            id="release_year"
            type="number"
            value={formData.release_year?.toString() || ''}
            error={errors.release_year}
            onChange={(value) => onChange('release_year', value ? parseInt(value) : null)}
            onBlur={() => onBlur('release_year')}
            placeholder="1995"
          />

          <FormFieldText
            label="Strumming Pattern"
            id="strumming_pattern"
            value={formData.strumming_pattern}
            error={errors.strumming_pattern}
            onChange={(value) => onChange('strumming_pattern', value)}
            onBlur={() => onBlur('strumming_pattern')}
            placeholder="D DU UDU"
          />

          <FormFieldText
            label="Chords"
            id="chords"
            value={formData.chords}
            error={errors.chords}
            onChange={(value) => onChange('chords', value)}
            onBlur={() => onBlur('chords')}
            placeholder="Em7 G D C"
          />

          <FormFieldText
            label="Short Title"
            id="short_title"
            value={formData.short_title}
            error={errors.short_title}
            onChange={(value) => onChange('short_title', value)}
            onBlur={() => onBlur('short_title')}
            placeholder="Brief title"
          />
        </div>
      ),
    },
  ];

  return (
    <StepWizardForm
      steps={steps}
      formData={formData as unknown as Record<string, unknown>}
      errors={errors}
      submitLabel="Save Song"
    />
  );
}
