import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ActionCardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  linkText: string;
  comingSoon?: boolean;
}

export function AdminActionCard({
  href,
  icon,
  title,
  description,
  linkText,
  comingSoon = false,
}: ActionCardProps) {
  const cardContent = (
    <Card className={`h-full transition-shadow ${!comingSoon ? 'hover:shadow-md' : ''}`}>
      <CardContent className="p-4 sm:p-6 flex flex-col h-full">
        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{icon}</div>
        <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 flex items-center gap-2">
          {title}
          {comingSoon && (
            <Badge variant="secondary" className="text-xs font-normal">
              Coming Soon
            </Badge>
          )}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 grow">{description}</p>
        <span
          className={`text-sm font-medium ${
            comingSoon ? 'text-muted-foreground' : 'text-primary group-hover:underline'
          }`}
        >
          {linkText} &rarr;
        </span>
      </CardContent>
    </Card>
  );

  if (comingSoon) {
    return <div className="block h-full opacity-75 cursor-not-allowed">{cardContent}</div>;
  }

  return (
    <Link href={href} className="block h-full group">
      {cardContent}
    </Link>
  );
}
