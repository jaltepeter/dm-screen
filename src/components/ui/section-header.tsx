import { cn } from '@/lib/utils';

export default function SectionHeader({
  children,
  className
}: {
  children: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className
      )}>
      {children}
    </p>
  );
}
