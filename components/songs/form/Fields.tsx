import SongFormFieldText from './FieldText';
import SongFormFieldSelect from './FieldSelect';
import ImageUpload from '@/components/shared/ImageUpload';
import { Label } from '@/components/ui/label';
import { MUSIC_KEY_OPTIONS, LEVEL_OPTIONS } from './options';
import { SongFormData } from './helpers';
import SpotifySearch from './SpotifySearch';
import { SpotifyTrack } from '@/types/spotify';

interface Props {
  formData: SongFormData;
  errors: Record<string, string>;
  onChange: (field: keyof SongFormData, value: SongFormData[keyof SongFormData]) => void;
  onSpotifySelect: (track: SpotifyTrack) => void;
}

export default function SongFormFields({ formData, errors, onChange, onSpotifySelect }: Props) {
  return (
    <div className="space-y-4">
      <SpotifySearch onSelect={onSpotifySelect} />

      <SongFormFieldText
        label="Title"
        id="title"
        value={formData.title}
        error={errors.title}
        onChange={(value) => onChange('title', value)}
        required
      />

      <SongFormFieldText
        label="Author"
        id="author"
        value={formData.author}
        error={errors.author}
        onChange={(value) => onChange('author', value)}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SongFormFieldSelect
          label="Difficulty Level"
          id="level"
          value={formData.level}
          error={errors.level}
          onChange={(value) => onChange('level', value)}
          options={LEVEL_OPTIONS}
          required
        />

        <SongFormFieldSelect
          label="Musical Key"
          id="key"
          value={formData.key}
          error={errors.key}
          onChange={(value) => onChange('key', value)}
          options={MUSIC_KEY_OPTIONS}
          required
        />
      </div>

      <SongFormFieldText
        label="Ultimate Guitar Link"
        id="ultimate_guitar_link"
        type="url"
        value={formData.ultimate_guitar_link}
        error={errors.ultimate_guitar_link}
        onChange={(value) => onChange('ultimate_guitar_link', value)}
        required
      />

      <SongFormFieldText
        label="YouTube URL"
        id="youtube_url"
        type="url"
        value={formData.youtube_url}
        error={errors.youtube_url}
        onChange={(value) => onChange('youtube_url', value)}
        placeholder="https://youtube.com/watch?v=..."
      />

      <SongFormFieldText
        label="Spotify Link"
        id="spotify_link_url"
        type="url"
        value={formData.spotify_link_url}
        error={errors.spotify_link_url}
        onChange={(value) => onChange('spotify_link_url', value)}
        placeholder="https://open.spotify.com/track/..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SongFormFieldText
          label="Capo Fret"
          id="capo_fret"
          type="number"
          value={formData.capo_fret?.toString() || ''}
          error={errors.capo_fret}
          onChange={(value) => onChange('capo_fret', value ? parseInt(value) : null)}
          placeholder="0"
        />

        <SongFormFieldText
          label="Category"
          id="category"
          value={formData.category}
          error={errors.category}
          onChange={(value) => onChange('category', value)}
          placeholder="e.g. Rock, Pop, Folk"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SongFormFieldText
          label="Tempo (BPM)"
          id="tempo"
          type="number"
          value={formData.tempo?.toString() || ''}
          error={errors.tempo}
          onChange={(value) => onChange('tempo', value ? parseInt(value) : null)}
          placeholder="120"
        />

        <SongFormFieldText
          label="Time Signature"
          id="time_signature"
          type="number"
          value={formData.time_signature?.toString() || ''}
          error={errors.time_signature}
          onChange={(value) => onChange('time_signature', value ? parseInt(value) : null)}
          placeholder="4"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SongFormFieldText
          label="Duration (ms)"
          id="duration_ms"
          type="number"
          value={formData.duration_ms?.toString() || ''}
          error={errors.duration_ms}
          onChange={(value) => onChange('duration_ms', value ? parseInt(value) : null)}
          placeholder="240000"
        />

        <SongFormFieldText
          label="Release Year"
          id="release_year"
          type="number"
          value={formData.release_year?.toString() || ''}
          error={errors.release_year}
          onChange={(value) => onChange('release_year', value ? parseInt(value) : null)}
          placeholder="1995"
        />
      </div>

      <SongFormFieldText
        label="Strumming Pattern"
        id="strumming_pattern"
        value={formData.strumming_pattern}
        error={errors.strumming_pattern}
        onChange={(value) => onChange('strumming_pattern', value)}
        placeholder="D DU UDU"
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

      <SongFormFieldText
        label="Chords"
        id="chords"
        value={formData.chords}
        error={errors.chords}
        onChange={(value) => onChange('chords', value)}
        placeholder="Em7 G D C"
      />

      <SongFormFieldText
        label="Short Title"
        id="short_title"
        value={formData.short_title}
        error={errors.short_title}
        onChange={(value) => onChange('short_title', value)}
        placeholder="Brief title"
      />
    </div>
  );
}
