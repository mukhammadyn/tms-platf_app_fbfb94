import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
}

export function PageHeader({ title, subtitle, action, onAction, actionIcon }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4')}>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {action && (
        <Button onClick={onAction} className="shrink-0">
          {actionIcon && <span className="mr-2 flex items-center">{actionIcon}</span>}
          {action}
        </Button>
      )}
    </div>
  );
}
