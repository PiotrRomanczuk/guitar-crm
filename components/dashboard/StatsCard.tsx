'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  delay?: number;
  variant?: 'default' | 'gradient';
  href?: string;
  iconColor?: string;
  iconBgColor?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading,
  delay = 0,
  variant = 'default',
  href,
  iconColor,
  iconBgColor,
  change,
  changeType = 'neutral',
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          {Icon && <Skeleton className="h-4 w-4 rounded" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          {description && <Skeleton className="h-3 w-32" />}
        </CardContent>
      </Card>
    );
  }

  const cardContent = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              iconBgColor || 'bg-primary/10 group-hover:bg-primary/20'
            )}
          >
            <Icon className={cn('h-4 w-4', iconColor || 'text-muted-foreground')} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {change && (
          <p
            className={cn(
              'text-sm font-medium mt-2',
              changeType === 'positive' && 'text-green-600 dark:text-green-400',
              changeType === 'negative' && 'text-red-600 dark:text-red-400',
              changeType === 'neutral' && 'text-muted-foreground'
            )}
          >
            {change}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </>
  );

  if (variant === 'gradient') {
    const content = (
      <div
        className={cn(
          'group relative bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-all duration-300 opacity-0 animate-fade-in cursor-pointer',
          href && 'hover:shadow-lg'
        )}
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
      >
        <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            {(change || description) && (
              <p
                className={cn(
                  'text-sm font-medium',
                  change && changeType === 'positive' && 'text-green-600 dark:text-green-400',
                  change && changeType === 'negative' && 'text-red-600 dark:text-red-400',
                  change && changeType === 'neutral' && 'text-muted-foreground',
                  !change && 'text-muted-foreground'
                )}
              >
                {change || description}
              </p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                iconBgColor || 'bg-primary/10 group-hover:bg-primary/20'
              )}
            >
              <Icon className={cn('w-6 h-6', iconColor || 'text-primary')} />
            </div>
          )}
        </div>
      </div>
    );

    return href ? <Link href={href}>{content}</Link> : <div>{content}</div>;
  }

  const wrapperContent = (
    <Card
      className={cn(
        'transition-all duration-200 opacity-0 animate-fade-in',
        href && 'cursor-pointer hover:border-primary/50 hover:shadow-md'
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {cardContent}
    </Card>
  );

  return href ? <Link href={href}>{wrapperContent}</Link> : wrapperContent;
}
