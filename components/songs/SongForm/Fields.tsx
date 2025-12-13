import SongFormFieldText from './FieldText';
import SongFormFieldSelect from './FieldSelect';
import { MUSIC_KEY_OPTIONS, LEVEL_OPTIONS } from './options';
import { SongFormData } from './helpers';

interface Props {
  formData: SongFormData;
  errors: Record<string, string>;
  onChange: (field: keyof SongFormData, value: any) => void;
}

export default function SongFormFields({ formData, errors, onChange }: Props) {
  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-2 gap-4">
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
