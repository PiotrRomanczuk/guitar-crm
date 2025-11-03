interface Props {
	title: string;
	author: string;
}

export default function SongDetailHeader({ title, author }: Props) {
	return (
		<>
			<h1 className='text-3xl font-bold mb-2'>{title}</h1>
			<p className='text-xl text-gray-600 mb-6'>{author}</p>
		</>
	);
}
