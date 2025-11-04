interface Profile {
	user_id: string;
	full_name: string | null;
}

interface FormData {
	student_id: string;
	date: string;
	start_time: string;
	title: string;
	notes: string;
	status: string;
}

const inputClass =
	'w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white';
const labelClass =
	'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

function StudentSelect({
	value,
	students,
	onChange,
}: {
	value: string;
	students: Profile[];
	onChange: (v: string) => void;
}) {
	return (
		<div>
			<label className={labelClass}>Student *</label>
			<select
				required
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={inputClass}
				data-testid='student-select'
			>
				<option value=''>Select a student</option>
				{students.map((s) => (
					<option key={s.user_id} value={s.user_id}>
						{s.full_name || 'Unnamed Student'}
					</option>
				))}
			</select>
		</div>
	);
}

function FormFields({
	formData,
	onChange,
}: {
	formData: FormData;
	onChange: (u: Partial<FormData>) => void;
}) {
	return (
		<>
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
				<div>
					<label className={labelClass}>Date *</label>
					<input
						type='date'
						required
						value={formData.date}
						onChange={(e) => onChange({ date: e.target.value })}
						className={inputClass}
						data-testid='date-input'
					/>
				</div>
				<div>
					<label className={labelClass}>Start Time *</label>
					<input
						type='time'
						required
						value={formData.start_time}
						onChange={(e) => onChange({ start_time: e.target.value })}
						className={inputClass}
						data-testid='time-input'
					/>
				</div>
			</div>
			<div>
				<label className={labelClass}>Title</label>
				<input
					type='text'
					value={formData.title}
					onChange={(e) => onChange({ title: e.target.value })}
					className={inputClass}
					data-testid='title-input'
				/>
			</div>
			<div>
				<label className={labelClass}>Notes</label>
				<textarea
					value={formData.notes}
					onChange={(e) => onChange({ notes: e.target.value })}
					rows={3}
					className={inputClass}
					data-testid='notes-input'
				/>
			</div>
			<div>
				<label className={labelClass}>Status</label>
				<select
					value={formData.status}
					onChange={(e) => onChange({ status: e.target.value })}
					className={inputClass}
					data-testid='status-select'
				>
					<option value='SCHEDULED'>Scheduled</option>
					<option value='IN_PROGRESS'>In Progress</option>
					<option value='COMPLETED'>Completed</option>
					<option value='CANCELLED'>Cancelled</option>
				</select>
			</div>
		</>
	);
}

export function TeacherEditForm({
	formData,
	students,
	saving,
	onSubmit,
	onDelete,
	onChange,
}: {
	formData: FormData;
	students: Profile[];
	saving: boolean;
	onSubmit: (data: FormData) => void;
	onDelete: () => void;
	onChange: (updates: Partial<FormData>) => void;
}) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(formData);
			}}
			className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4'
		>
			<StudentSelect
				value={formData.student_id}
				students={students}
				onChange={(v) => onChange({ student_id: v })}
			/>
			<FormFields formData={formData} onChange={onChange} />

			<div className='flex gap-3 pt-4'>
				<button
					type='submit'
					disabled={saving}
					className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50'
					data-testid='submit-button'
				>
					{saving ? 'Saving...' : 'Save'}
				</button>
				<button
					type='button'
					onClick={onDelete}
					className='px-6 py-2 bg-red-600 text-white rounded-lg'
					data-testid='delete-button'
				>
					Delete
				</button>
			</div>
		</form>
	);
}
