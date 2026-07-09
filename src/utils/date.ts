import type { CalendarEvent } from '../types/calendar';
import type { WeekStart } from '../types/calendar';

const DAY_MS = 24 * 60 * 60 * 1000;

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const FULL_WEEKDAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function getOrderedWeekdays(weekStart: WeekStart = 0): number[] {
  return Array.from({ length: 7 }, (_, index) => (weekStart + index) % 7);
}

export function getOrderedWeekdayLabels(weekStart: WeekStart = 0): string[] {
  return getOrderedWeekdays(weekStart).map((weekday) => WEEKDAY_LABELS[weekday]);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function startOfWeek(date: Date, weekStart: WeekStart = 0): Date {
  const offset = (date.getDay() - weekStart + 7) % 7;
  return addDays(startOfDay(date), -offset);
}

export function endOfWeek(date: Date, weekStart: WeekStart = 0): Date {
  return endOfDay(addDays(startOfWeek(date, weekStart), 6));
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function getWeekDays(date: Date, weekStart: WeekStart = 0): Date[] {
  const start = startOfWeek(date, weekStart);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function getMonthGridDays(date: Date, weekStart: WeekStart = 0): Date[] {
  const start = startOfWeek(startOfMonth(date), weekStart);
  const end = endOfWeek(endOfMonth(date), weekStart);
  const days: Date[] = [];

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    days.push(cursor);
  }

  return days;
}

export function isSameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function isSameMonth(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
}

export function overlapsRange(event: CalendarEvent, rangeStart: Date, rangeEnd: Date): boolean {
  return event.start < rangeEnd && event.end > rangeStart;
}

export function formatDateInput(date: Date): string {
  return date.toISOString();
}

export function formatMonthTitle(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date);
}

export function formatWeekTitle(date: Date, weekStart: WeekStart = 0): string {
  const [first, , , , , , last] = getWeekDays(date, weekStart);
  const formatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  return `${formatter.format(first)} - ${formatter.format(last)}`;
}

export function formatDayHeader(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function minutesSinceStartOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function clampDate(date: Date, min: Date, max: Date): Date {
  if (date < min) {
    return min;
  }

  if (date > max) {
    return max;
  }

  return date;
}

export function daysBetweenInclusive(start: Date, end: Date): Date[] {
  const startDay = startOfDay(start);
  const lastDay = startOfDay(new Date(end.getTime() - 1));
  const days: Date[] = [];

  for (let cursor = startDay; cursor <= lastDay; cursor = new Date(cursor.getTime() + DAY_MS)) {
    days.push(cursor);
  }

  return days;
}

export function getCurrentWeekRowIndex(monthDate: Date, today = new Date(), weekStart: WeekStart = 0): number {
  const grid = getMonthGridDays(monthDate, weekStart);
  const index = grid.findIndex((day) => isSameDay(day, today));
  return index === -1 ? Math.floor((startOfDay(monthDate).getDate() - 1) / 7) : Math.floor(index / 7);
}
