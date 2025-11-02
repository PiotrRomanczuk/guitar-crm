import SongFormFieldText from './SongForm.FieldText';
import SongFormFieldSelect from './SongForm.FieldSelect';

interface Props {
	formData: Record<string, string>;
	errors: Record<string, string>;
	onChange: (field: string, value: string) => void;
}

export default function SongFormFields({ formData, errors, onChange }: Props) {
	return (
		<div className='space-y-4'>
			<SongFormFieldText
				label='Title'
				id='title'
				value={formData.title}
				error={errors.title}
				onChange={(value) => onChange('title', value)}
				required
			/>

			<SongFormFieldText
				label='Author'
				id='author'
				value={formData.author}
				error={errors.author}
				onChange={(value) => onChange('author', value)}
				required
			/>

			<div className='grid grid-cols-2 gap-4'>
				<SongFormFieldSelect
					label='Difficulty Level'
					id='level'
					value={formData.level}
					error={errors.level}
					onChange={(value) => onChange('level', value)}
					options={[
						{ value: 'beginner', label: 'Beginner' },
						{ value: 'intermediate', label: 'Intermediate' },
						{ value: 'advanced', label: 'Advanced' },
					]}
					required
				/>

				<SongFormFieldSelect
					label='Musical Key'
					id='key'
					value={formData.key}
					error={errors.key}
					onChange={(value) => onChange('key', value)}
					options={[
						{ value: 'C', label: 'C' },
						{ value: 'C#', label: 'C#' },
						{ value: 'D', label: 'D' },
						{ value: 'D#', label: 'D#' },
						{ value: 'E', label: 'E' },
						{ value: 'F', label: 'F' },
						{ value: 'F#', label: 'F#' },
						{ value: 'G', label: 'G' },
						{ value: 'G#', label: 'G#' },
						{ value: 'A', label: 'A' },
						{ value: 'A#', label: 'A#' },
						{ value: 'B', label: 'B' },
						{ value: 'Cm', label: 'Cm' },
						{ value: 'C#m', label: 'C#m' },
						{ value: 'Dm', label: 'Dm' },
						{ value: 'D#m', label: 'D#m' },
						{ value: 'Em', label: 'Em' },
						{ value: 'Fm', label: 'Fm' },
						{ value: 'F#m', label: 'F#m' },
						{ value: 'Gm', label: 'Gm' },
						{ value: 'G#m', label: 'G#m' },
						{ value: 'Am', label: 'Am' },
						{ value: 'A#m', label: 'A#m' },
						{ value: 'Bm', label: 'Bm' },
					]}
					required
				/>
			</div>

			<SongFormFieldText
				label='Ultimate Guitar Link'
				id='ultimate_guitar_link'
				type='url'
				value={formData.ultimate_guitar_link}
				error={errors.ultimate_guitar_link}
				onChange={(value) => onChange('ultimate_guitar_link', value)}
				required
			/>

			<SongFormFieldText
				label='Chords'
				id='chords'
				value={formData.chords}
				error={errors.chords}
				onChange={(value) => onChange('chords', value)}
				placeholder='Em7 G D C'
			/>

			<SongFormFieldText
				label='Short Title'
				id='short_title'
				value={formData.short_title}
				error={errors.short_title}
				onChange={(value) => onChange('short_title', value)}
				placeholder='Brief title'
			/>
		</div>
	);
}
