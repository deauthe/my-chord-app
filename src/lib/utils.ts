import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type VariantProps<T> = T extends (...args: any[]) => any
  ? Parameters<T>[0]
  : never
