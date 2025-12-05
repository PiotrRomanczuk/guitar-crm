import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
}

export function AdminStatCard({ icon, value, label }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-6">
        <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{icon}</div>
        <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-1">{value}</h3>
        <p className="text-xs sm:text-base text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
