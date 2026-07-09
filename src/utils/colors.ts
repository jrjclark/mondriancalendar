import type { CalendarEvent } from '../types/calendar';

export const MONDRIAN_COLORS = ['#E53935', '#1E5AA8', '#FDD835'] as const;

export function colorForEvent(event: Pick<CalendarEvent, 'id' | 'title'>): string {
  return MONDRIAN_COLORS[Math.abs(hashEvent(event)) % MONDRIAN_COLORS.length];
}

export function boogieAccentForEvent(event: Pick<CalendarEvent, 'id' | 'title'>, background: string): string {
  const hash = Math.abs(hashEvent(event));

  if (background === '#FDD835') {
    return hash % 2 === 0 ? '#FFFFFF' : '#BDBDBD';
  }

  if (background === '#E53935') {
    return hash % 2 === 0 ? '#BDBDBD' : '#FDD835';
  }

  return hash % 2 === 0 ? '#FDD835' : '#E53935';
}

export function shouldShowBoogieAccent(event: Pick<CalendarEvent, 'id' | 'title'>): boolean {
  return Math.abs(hashEvent(event)) % 2 === 0;
}

function hashEvent(event: Pick<CalendarEvent, 'id' | 'title'>): number {
  const source = event.id || event.title || 'untitled-event';
  let hash = 0;

  for (let i = 0; i < source.length; i += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }

  return hash;
}

export function textColorForBackground(background: string): string {
  return background === '#FDD835' ? '#111111' : '#FFFFFF';
}
