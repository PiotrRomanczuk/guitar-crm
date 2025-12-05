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
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="text-2xl sm:text-3xl mb-2">{emoji}</div>
        <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Button asChild variant="link" className="px-0 text-blue-600 hover:text-blue-700">
          <Link href={href}>View →</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
