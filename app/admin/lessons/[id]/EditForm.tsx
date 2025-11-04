interface Profile {
	user_id: string;
	full_name: string | null;
	isTeacher: boolean | null;
	isStudent: boolean | null;
}

interface FormData {
	student_id: string;
	teacher_id: string;
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

function Select({
	label,
	value,
	onChange,
	options,
	testId,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	options: Profile[];
	testId: string;
}) {
	return (
		<div>
			<label className={labelClass}>{label} *</label>
			<select
				required
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={inputClass}
				data-testid={testId}
			>
				<option value=''>Select {label.toLowerCase()}</option>
				{options.map((o) => (
					<option key={o.user_id} value={o.user_id}>
						{o.full_name || `Unnamed ${label}`}
					</option>
				))}
			</select>
		</div>
	);
}

function DateTimeFields({
	date,
	time,
	onChange,
}: {
	date: string;
	time: string;
	onChange: (updates: Partial<FormData>) => void;
}) {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
			<div>
				<label className={labelClass}>Date *</label>
				<input
					type='date'
					required
					value={date}
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
					value={time}
					onChange={(e) => onChange({ start_time: e.target.value })}
					className={inputClass}
					data-testid='time-input'
				/>
			</div>
		</div>
	);
}

function LessonFields({
	title,
	notes,
	status,
	onChange,
}: {
	title: string;
	notes: string;
	status: string;
	onChange: (updates: Partial<FormData>) => void;
}) {
	return (
		<>
			<div>
				<label className={labelClass}>Title</label>
				<input
					type='text'
					value={title}
					onChange={(e) => onChange({ title: e.target.value })}
					className={inputClass}
					data-testid='title-input'
				/>
			</div>
			<div>
				<label className={labelClass}>Notes</label>
				<textarea
					value={notes}
					onChange={(e) => onChange({ notes: e.target.value })}
					rows={3}
					className={inputClass}
					data-testid='notes-input'
				/>
			</div>
			<div>
				<label className={labelClass}>Status</label>
				<select
					value={status}
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

export function EditForm({
	formData,
	teachers,
	students,
	saving,
	onSubmit,
	onDelete,
	onChange,
}: {
	formData: FormData;
	teachers: Profile[];
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
			<Select
				label='Teacher'
				value={formData.teacher_id}
				onChange={(v) => onChange({ teacher_id: v })}
				options={teachers}
				testId='teacher-select'
			/>
			<Select
				label='Student'
				value={formData.student_id}
				onChange={(v) => onChange({ student_id: v })}
				options={students}
				testId='student-select'
			/>
			<DateTimeFields
				date={formData.date}
				time={formData.start_time}
				onChange={onChange}
			/>
			<LessonFields
				title={formData.title}
				notes={formData.notes}
				status={formData.status}
				onChange={onChange}
			/>

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
