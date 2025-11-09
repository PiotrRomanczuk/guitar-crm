const inputClass =
	'w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500';

const labelClass =
	'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

interface Props {
	formData: {
		date: string;
		start_time?: string;
		title?: string;
		notes?: string;
	};
	validationErrors: { [key: string]: string };
	handleChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => void;
}

export function LessonFormFields({
	formData,
	validationErrors,
	handleChange,
}: Props) {
	return (
		<>
			<div>
				<label htmlFor='date' className={labelClass}>
					Date *
				</label>
				<input
					type='date'
					id='date'
					name='date'
					value={formData.date}
					onChange={handleChange}
					required
					data-testid='lesson-date'
					className={inputClass}
				/>
				{validationErrors.date && (
					<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
						{validationErrors.date}
					</p>
				)}
			</div>

			<div>
				<label htmlFor='start_time' className={labelClass}>
					Start Time
				</label>
				<input
					type='time'
					id='start_time'
					name='start_time'
					value={formData.start_time || ''}
					onChange={handleChange}
					data-testid='lesson-start-time'
					className={inputClass}
				/>
			</div>

			<div>
				<label htmlFor='title' className={labelClass}>
					Title
				</label>
				<input
					type='text'
					id='title'
					name='title'
					value={formData.title || ''}
					onChange={handleChange}
					placeholder='e.g., Guitar Basics, Advanced Techniques'
					data-testid='lesson-title'
					className={inputClass}
				/>
			</div>

			<div>
				<label htmlFor='notes' className={labelClass}>
					Notes
				</label>
				<textarea
					id='notes'
					name='notes'
					value={formData.notes || ''}
					onChange={handleChange}
					rows={4}
					placeholder='Add any notes about this lesson...'
					data-testid='lesson-notes'
					className={inputClass}
				/>
			</div>
		</>
	);
}
