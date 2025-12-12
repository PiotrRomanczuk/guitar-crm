import Link from 'next/link';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DashboardCard({
  emoji,
  title,
  description,
  href,
}: {
  emoji: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card className="rounded-xl hover:shadow-md transition-all duration-300 h-full flex flex-col animate-fade-in border-border/50 hover:border-border">
      <CardHeader>
        <div className="text-2xl sm:text-3xl mb-2">{emoji}</div>
        <CardTitle className="text-lg sm:text-xl tracking-tight">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Button asChild variant="ghost" className="px-0 hover:bg-transparent hover:text-primary">
          <Link href={href}>View →</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
