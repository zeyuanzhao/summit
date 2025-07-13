import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseStringVector(
  str: string | null | undefined,
): number[] | null {
  if (!str) return null;
  try {
    const parsed = JSON.parse(str);
    return parsed.map(Number);
  } catch {
    return null;
  }
}

export function normalizeVector(vector: number[] | null): number[] | null {
  if (!vector || vector.length === 0) return null;
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) return vector.map(() => 0);
  return vector.map((val) => val / norm);
}
