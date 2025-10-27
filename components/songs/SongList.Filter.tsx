interface Props {
	filterLevel: string | null;
	onFilterChange: (level: string | null) => void;
}

export default function SongListFilter({ filterLevel, onFilterChange }: Props) {
	return (
		<div className='py-4'>
			<label htmlFor='level-filter' className='block mb-2 font-medium'>
				Filter by level
			</label>
			<select
				id='level-filter'
				value={filterLevel || ''}
				onChange={(e) => onFilterChange(e.target.value || null)}
				className='px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
			>
				<option value=''>All Levels</option>
				<option value='beginner'>Beginner</option>
				<option value='intermediate'>Intermediate</option>
				<option value='advanced'>Advanced</option>
			</select>
		</div>
	);
}
