import type { CSSProperties } from 'react';
import type { ArtStyle, CalendarEvent, TimedEventSegment, WeekStart } from '../types/calendar';
import {
  FULL_WEEKDAY_LABELS,
  WEEKDAY_LABELS,
  formatDayHeader,
  getWeekDays,
  isSameDay,
} from '../utils/date';
import { getAllDayEventsForDay, getTimedSegmentsForDay, splitEventsForDay } from '../utils/layout';
import { EventBlock } from './EventBlock';
import { MondrianGrid } from './MondrianGrid';

const VISIBLE_END_HOUR = 24;
const DAY_START_HOUR = 0;
const MORNING_START_HOUR = 6;
const LINE_PROXIMITY_MINUTES = 30;
const MEDIUM_FREE_BLOCK_MINUTES = 240;
const LARGE_FREE_BLOCK_MINUTES = 480;

interface WeekViewProps {
  events: CalendarEvent[];
  anchorDate: Date;
  weekStart: WeekStart;
  hideWeekends: boolean;
  showOvernightHours: boolean;
  paintingMode: boolean;
  artStyle: ArtStyle;
  onEventSelect: (event: CalendarEvent) => void;
}

export function WeekView({
  events,
  anchorDate,
  weekStart,
  hideWeekends,
  showOvernightHours,
  paintingMode,
  artStyle,
  onEventSelect,
}: WeekViewProps) {
  const isBoogieWoogie = artStyle === 'boogie';
  const visibleStartHour = showOvernightHours ? DAY_START_HOUR : MORNING_START_HOUR;
  const visibleMinutes = (VISIBLE_END_HOUR - visibleStartHour) * 60;
  const timeMarkers = showOvernightHours ? [0, 3, 6, 9, 12, 15, 18, 21, 24] : [6, 9, 12, 15, 18, 21, 24];
  const days = getWeekDays(anchorDate, weekStart).filter((day) => !hideWeekends || !isWeekend(day));
  const today = new Date();
  const emphasizedDayKey = days.find((day) => isSameDay(day, today))?.toDateString() ?? null;
  const emphasizedWeekday = emphasizedDayKey ? today.getDay() : null;
  const narrowWeekdays = getQuietestWeekdays(
    days.map((day) => ({
      weekday: day.getDay(),
      count: splitEventsForDay(events, day).length,
    })),
    emphasizedWeekday,
  );
  const columnTemplate = days
    .map((day) => {
      if (day.toDateString() === emphasizedDayKey) {
        return '2.15fr';
      }

      if (narrowWeekdays.has(day.getDay())) {
        return '0.72fr';
      }

      return '1fr';
    })
    .join(' ');
  const mobileFocusShare = isBoogieWoogie ? 30 : 50;
  const mobileOtherShare =
    emphasizedWeekday === null ? 1 : (100 - mobileFocusShare) / Math.max(1, days.length - 1);
  const mobileColumnTemplate = days
    .map((day) => (day.toDateString() === emphasizedDayKey ? `${mobileFocusShare}fr` : `${mobileOtherShare}fr`))
    .join(' ');
  const weekGridStyle = {
    gridTemplateColumns: columnTemplate,
    '--mobile-week-columns': mobileColumnTemplate,
  } as CSSProperties & Record<'--mobile-week-columns', string>;

  return (
    <MondrianGrid
      className={`week-view${paintingMode ? ' painting-mode' : ''}${isBoogieWoogie ? ' boogie-woogie' : ''}`}
      label="Weekly calendar"
    >
      <div className="week-days" style={weekGridStyle}>
        {days.map((day) => {
          const allDayEvents = getAllDayEventsForDay(events, day);
          const timedSegments = getTimedSegmentsForDay(events, day, visibleStartHour, VISIBLE_END_HOUR);
          const visibleTimeMarkers = getVisibleTimeMarkers(day, timedSegments, visibleStartHour, timeMarkers);
          const isToday = isSameDay(day, today);
          const isEmphasizedDay = day.toDateString() === emphasizedDayKey;
          const timelineColumnCount = Math.max(1, ...timedSegments.map((segment) => segment.columnCount));
          const hasTimelineSplit = timelineColumnCount > 1;
          const eventBoundaries = Array.from(
            timedSegments
              .reduce((boundaries, segment) => {
                const displayColumnCount = hasTimelineSplit ? timelineColumnCount : segment.columnCount;
                const width = 100 / displayColumnCount;
                const left = width * segment.column;

                [segment.start, segment.end].forEach((boundaryDate) => {
                  const top = (getVisibleMinutes(day, boundaryDate, visibleStartHour) / visibleMinutes) * 100;
                  const key = `${segment.column}-${left}-${width}-${top.toFixed(4)}`;
                  boundaries.set(key, { left, width, top });
                });

                return boundaries;
              }, new Map<string, { left: number; width: number; top: number }>())
              .values(),
          );

          return (
            <section
              className={`week-day${isToday ? ' is-today' : ''}${isEmphasizedDay ? ' is-emphasized' : ''}`}
              key={day.toISOString()}
            >
              <header className="week-day-header">
                <span>{WEEKDAY_LABELS[day.getDay()]}</span>
                <strong>{formatDayHeader(day)}</strong>
              </header>

              <div className="all-day-strip" aria-label={`${FULL_WEEKDAY_LABELS[day.getDay()]} all-day events`}>
                {allDayEvents.slice(0, 2).map((event) => (
                  <EventBlock
                    key={event.id}
                    event={event}
                    compact
                    boogieWoogie={isBoogieWoogie}
                    onSelect={onEventSelect}
                  />
                ))}
                {allDayEvents.length > 2 && <span className="more-indicator">+{allDayEvents.length - 2} more</span>}
              </div>

              <div
                className={`timeline${hasTimelineSplit ? ' timeline--split' : ''}`}
                aria-label={`${FULL_WEEKDAY_LABELS[day.getDay()]} timed events`}
              >
                {visibleTimeMarkers.map((hour) => (
                  <div
                    className={`time-marker${hour === visibleStartHour || hour === VISIBLE_END_HOUR ? ' time-marker--edge' : ''}`}
                    key={hour}
                    style={{ top: `${((hour - visibleStartHour) / (VISIBLE_END_HOUR - visibleStartHour)) * 100}%` }}
                  />
                ))}

                {hasTimelineSplit &&
                  Array.from({ length: timelineColumnCount - 1 }, (_, index) => (
                    <span
                      aria-hidden="true"
                      className="timeline-split-line"
                      key={index}
                      style={{ left: `${((index + 1) / timelineColumnCount) * 100}%` }}
                    />
                  ))}

                {eventBoundaries
                  .filter((boundary) => !isBoogieWoogie || (boundary.top > 0.1 && boundary.top < 99.9))
                  .map((boundary) => (
                    <span
                      aria-hidden="true"
                      className="event-boundary-line"
                      key={`${boundary.left}-${boundary.width}-${boundary.top}`}
                      style={{
                        left: `${boundary.left}%`,
                        top: `${boundary.top}%`,
                        width: `${boundary.width}%`,
                      }}
                    />
                  ))}

                {timedSegments.map((segment) => {
                  const top = (getVisibleMinutes(day, segment.start, visibleStartHour) / visibleMinutes) * 100;
                  const height = Math.max(
                    0.2,
                    ((getVisibleMinutes(day, segment.end, visibleStartHour) -
                      getVisibleMinutes(day, segment.start, visibleStartHour)) /
                      visibleMinutes) *
                      100,
                  );
                  const displayColumnCount = hasTimelineSplit ? timelineColumnCount : segment.columnCount;
                  const width = 100 / displayColumnCount;
                  const left = width * segment.column;

                  return (
                    <EventBlock
                      key={`${segment.event.id}-${segment.start.toISOString()}`}
                      event={segment.event}
                      className={`event-block--timed${segment.columnCount > 1 ? ' event-block--overlap' : ''}`}
                      boogieWoogie={isBoogieWoogie}
                      onSelect={onEventSelect}
                      style={{
                        position: 'absolute',
                        top: `${top}%`,
                        height: `${height}%`,
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </MondrianGrid>
  );
}

function getVisibleMinutes(day: Date, date: Date, visibleStartHour: number): number {
  const visibleStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), visibleStartHour);
  return (date.getTime() - visibleStart.getTime()) / 60000;
}

function getVisibleTimeMarkers(
  day: Date,
  timedSegments: TimedEventSegment[],
  visibleStartHour: number,
  timeMarkers: number[],
): number[] {
  const innerMarkers = timeMarkers.filter((hour) => hour !== visibleStartHour && hour !== VISIBLE_END_HOUR);
  const markersNearEventBoundary = getMarkersNearEventBoundary(day, timedSegments, innerMarkers, visibleStartHour);
  const freeIntervals = getFreeIntervals(day, timedSegments, visibleStartHour);
  const selectedMarkers = new Set<number>();

  freeIntervals.forEach((interval) => {
    const intervalMarkers = innerMarkers.filter((hour) => {
      const markerMinutes = (hour - visibleStartHour) * 60;
      return (
        markerMinutes > interval.startMinutes &&
        markerMinutes < interval.endMinutes &&
        !markersNearEventBoundary.has(hour)
      );
    });

    chooseMarkersForFreeInterval(interval, intervalMarkers, visibleStartHour).forEach((hour) => {
      selectedMarkers.add(hour);
    });
  });

  return timeMarkers.filter((hour) => hour === visibleStartHour || hour === VISIBLE_END_HOUR || selectedMarkers.has(hour));
}

function getMarkersNearEventBoundary(
  day: Date,
  timedSegments: TimedEventSegment[],
  innerMarkers: number[],
  visibleStartHour: number,
): Set<number> {
  return new Set(
    innerMarkers.filter((hour) => {
      const markerDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour);

      return timedSegments.some((segment) => {
        const distanceToStart = Math.abs(markerDate.getTime() - segment.start.getTime()) / 60000;
        const distanceToEnd = Math.abs(markerDate.getTime() - segment.end.getTime()) / 60000;
        return distanceToStart <= LINE_PROXIMITY_MINUTES || distanceToEnd <= LINE_PROXIMITY_MINUTES;
      });
    }),
  );
}

function getFreeIntervals(
  day: Date,
  timedSegments: TimedEventSegment[],
  visibleStartHour: number,
): Array<{ startMinutes: number; endMinutes: number }> {
  const visibleStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), visibleStartHour);
  const visibleEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), VISIBLE_END_HOUR);
  const visibleEndMinutes = (VISIBLE_END_HOUR - visibleStartHour) * 60;
  const occupiedIntervals = timedSegments
    .map((segment) => ({
      startMinutes: Math.max(0, (segment.start.getTime() - visibleStart.getTime()) / 60000),
      endMinutes: Math.min(visibleEndMinutes, (segment.end.getTime() - visibleStart.getTime()) / 60000),
    }))
    .filter((interval) => interval.endMinutes > interval.startMinutes)
    .sort((first, second) => first.startMinutes - second.startMinutes || first.endMinutes - second.endMinutes);

  const mergedOccupied = occupiedIntervals.reduce<Array<{ startMinutes: number; endMinutes: number }>>(
    (merged, interval) => {
      const previous = merged.at(-1);

      if (!previous || interval.startMinutes > previous.endMinutes) {
        merged.push({ ...interval });
        return merged;
      }

      previous.endMinutes = Math.max(previous.endMinutes, interval.endMinutes);
      return merged;
    },
    [],
  );

  const freeIntervals: Array<{ startMinutes: number; endMinutes: number }> = [];
  let cursorMinutes = 0;

  mergedOccupied.forEach((interval) => {
    if (interval.startMinutes > cursorMinutes) {
      freeIntervals.push({ startMinutes: cursorMinutes, endMinutes: interval.startMinutes });
    }

    cursorMinutes = Math.max(cursorMinutes, interval.endMinutes);
  });

  if (cursorMinutes < visibleEndMinutes && visibleEnd > visibleStart) {
    freeIntervals.push({ startMinutes: cursorMinutes, endMinutes: visibleEndMinutes });
  }

  return freeIntervals;
}

function chooseMarkersForFreeInterval(
  interval: { startMinutes: number; endMinutes: number },
  intervalMarkers: number[],
  visibleStartHour: number,
): number[] {
  const duration = interval.endMinutes - interval.startMinutes;

  if (duration < MEDIUM_FREE_BLOCK_MINUTES) {
    return [];
  }

  const targetCount = duration >= LARGE_FREE_BLOCK_MINUTES ? 2 : 1;
  const targets =
    targetCount === 2
      ? [
          interval.startMinutes + duration / 3,
          interval.startMinutes + (duration * 2) / 3,
        ]
      : [interval.startMinutes + duration / 2];
  const selected = new Set<number>();

  targets.forEach((target) => {
    const closestMarker = intervalMarkers
      .filter((hour) => !selected.has(hour))
      .sort((first, second) => {
        const firstMinutes = (first - visibleStartHour) * 60;
        const secondMinutes = (second - visibleStartHour) * 60;
        return Math.abs(firstMinutes - target) - Math.abs(secondMinutes - target) || first - second;
      })[0];

    if (closestMarker !== undefined) {
      selected.add(closestMarker);
    }
  });

  return Array.from(selected);
}

function getQuietestWeekdays(
  dayCounts: Array<{ weekday: number; count: number }>,
  excludedWeekday: number | null,
): Set<number> {
  return new Set(
    dayCounts
      .filter(({ weekday }) => weekday !== excludedWeekday)
      .sort((first, second) => first.count - second.count || first.weekday - second.weekday)
      .slice(0, 2)
      .map(({ weekday }) => weekday),
  );
}

function isWeekend(day: Date): boolean {
  return day.getDay() === 0 || day.getDay() === 6;
}
