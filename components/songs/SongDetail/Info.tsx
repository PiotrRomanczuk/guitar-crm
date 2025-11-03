import type { Song } from '../types';

interface Props {
	song: Song;
}

export default function SongDetailInfo({ song }: Props) {
	return (
		<>
			<div className='grid grid-cols-2 gap-4 mb-6'>
				<div className='p-4 bg-gray-50 rounded'>
					<p className='font-medium text-gray-600'>Level</p>
					<p className='text-lg'>{song.level}</p>
				</div>
				<div className='p-4 bg-gray-50 rounded'>
					<p className='font-medium text-gray-600'>Key</p>
					<p className='text-lg'>{song.key}</p>
				</div>
			</div>

			{song.chords && (
				<div className='mb-6 p-4 bg-blue-50 rounded'>
					<p className='font-medium mb-2'>Chords</p>
					<p className='font-mono'>{song.chords}</p>
				</div>
			)}

			<div className='mb-6'>
				<a
					href={song.ultimate_guitar_link || '#'}
					target='_blank'
					rel='noopener noreferrer'
					className='text-blue-600 hover:underline'
				>
					View on Ultimate Guitar
				</a>
			</div>
		</>
	);
}
