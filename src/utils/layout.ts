import type { CalendarEvent, TimedEventSegment } from '../types/calendar';
import { clampDate, daysBetweenInclusive, endOfDay, isSameDay, overlapsRange, startOfDay } from './date';

export function splitEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  return events.filter((event) => overlapsRange(event, dayStart, dayEnd));
}

export function getAllDayEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return splitEventsForDay(events, day).filter((event) => event.isAllDay);
}

export function getTimedSegmentsForDay(
  events: CalendarEvent[],
  day: Date,
  visibleStartHour: number,
  visibleEndHour: number,
): TimedEventSegment[] {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), visibleStartHour);
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), visibleEndHour);
  const segments = splitEventsForDay(events, day)
    .filter((event) => !event.isAllDay && overlapsRange(event, dayStart, dayEnd))
    .map((event) => ({
      event,
      day,
      start: clampDate(event.start, dayStart, dayEnd),
      end: clampDate(event.end, dayStart, dayEnd),
      column: 0,
      columnCount: 1,
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());

  return assignOverlapColumns(segments);
}

export function getEventsForMonthDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events
    .filter((event) => daysBetweenInclusive(event.start, event.end).some((eventDay) => isSameDay(eventDay, day)))
    .sort((a, b) => Number(b.isAllDay) - Number(a.isAllDay) || a.start.getTime() - b.start.getTime());
}

function assignOverlapColumns(segments: TimedEventSegment[]): TimedEventSegment[] {
  const groups: TimedEventSegment[][] = [];

  for (const segment of segments) {
    const group = groups.find((candidate) => candidate.some((item) => overlaps(segment, item)));

    if (group) {
      group.push(segment);
    } else {
      groups.push([segment]);
    }
  }

  return groups.flatMap((group) => {
    const columnEnds: Date[] = [];

    for (const segment of group) {
      const reusableColumn = columnEnds.findIndex((end) => end <= segment.start);
      const column = reusableColumn === -1 ? columnEnds.length : reusableColumn;
      columnEnds[column] = segment.end;
      segment.column = column;
    }

    const columnCount = Math.max(1, columnEnds.length);
    return group.map((segment) => ({ ...segment, columnCount }));
  });
}

function overlaps(first: TimedEventSegment, second: TimedEventSegment): boolean {
  return first.start < second.end && first.end > second.start;
}
