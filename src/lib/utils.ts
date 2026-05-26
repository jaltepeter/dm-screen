import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBonus(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
