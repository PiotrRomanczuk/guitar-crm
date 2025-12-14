import { ReactNode } from 'react';

interface DashboardPageLayoutProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function DashboardPageLayout({
  title,
  description,
  action,
  children,
}: DashboardPageLayoutProps) {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
