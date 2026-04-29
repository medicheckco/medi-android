import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely converts various timestamp formats to milliseconds.
 */
export function getMillis(ts: any): number {
  if (!ts) return 0;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'number') return ts;
  if (typeof ts === 'string') return new Date(ts).getTime();
  if (typeof ts.seconds === 'number') {
    return ts.seconds * 1000 + (ts.nanoseconds || 0) / 1000000;
  }
  return 0;
}

/**
 * Safely converts various timestamp formats to a Date object.
 */
export function toDate(ts: any): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  return new Date(getMillis(ts));
}

/**
 * Parses date strings in various common formats (including DD-MM-YYYY)
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try standard parsing first
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  
  // Try DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const parts = dateStr.split(/[-/.]/);
  if (parts.length === 3) {
    const d = parseInt(parts[0]);
    const m = parseInt(parts[1]) - 1; // 0-indexed
    const y = parts[2].length === 2 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
    
    date = new Date(y, m, d);
    if (!isNaN(date.getTime())) return date;
  }
  
  return null;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleApiError(error: unknown, operationType: OperationType, path: string | null) {
  const err = error instanceof Error ? error.message : String(error);
  
  console.error('API Error:', { err, operationType, path });

  let userMessage = "Something went wrong with the connection.";
  if (err.includes("network") || err.includes("fetch")) {
    userMessage = "Network error. Please check your connection to the server.";
  } else if (err.includes("not found")) {
    userMessage = "The requested item was not found.";
  }

  const detailedError = new Error(userMessage);
  (detailedError as any).originalError = error;
  
  throw detailedError;
}
