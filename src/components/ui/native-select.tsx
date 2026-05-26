import { cn } from '@/lib/utils';

export default function NativeSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn('h-8 rounded-md border border-input bg-background px-2 text-sm', className)}
      {...props}>
      {children}
    </select>
  );
}
