interface Props {
  title: string;
  author: string;
}

export default function SongDetailHeader({ title, author }: Props) {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-xl text-muted-foreground">{author}</p>
    </div>
  );
}
