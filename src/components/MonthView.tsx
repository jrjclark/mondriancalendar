import type { CSSProperties } from 'react';
import type { ArtStyle, CalendarEvent, WeekStart } from '../types/calendar';
import { boogieLineVariables } from '../utils/boogie';
import {
  WEEKDAY_LABELS,
  getCurrentWeekRowIndex,
  getMonthGridDays,
  getOrderedWeekdayLabels,
  getOrderedWeekdays,
  isSameDay,
  isSameMonth,
} from '../utils/date';
import { getEventsForMonthDay } from '../utils/layout';
import { EventBlock } from './EventBlock';
import { MondrianGrid } from './MondrianGrid';

interface MonthViewProps {
  events: CalendarEvent[];
  anchorDate: Date;
  weekStart: WeekStart;
  paintingMode: boolean;
  artStyle: ArtStyle;
  onEventSelect: (event: CalendarEvent) => void;
}

export function MonthView({ events, anchorDate, weekStart, paintingMode, artStyle, onEventSelect }: MonthViewProps) {
  const isBoogieWoogie = artStyle === 'boogie';
  const days = getMonthGridDays(anchorDate, weekStart);
  const orderedWeekdays = getOrderedWeekdays(weekStart);
  const orderedWeekdayLabels = getOrderedWeekdayLabels(weekStart);
  const today = new Date();
  const rows = Math.ceil(days.length / 7);
  const emphasizedColumn = today.getDay();
  const emphasizedRow = getCurrentWeekRowIndex(anchorDate, today, weekStart);
  const narrowWeekdays = getQuietestMonthWeekdays(events, days, anchorDate, emphasizedColumn);
  const columnTemplate = orderedWeekdays.map((weekday) => {
    if (weekday === emphasizedColumn) {
      return '2fr';
    }

    if (narrowWeekdays.has(weekday)) {
      return '0.72fr';
    }

    return '1fr';
  }).join(' ');
  const rowTemplate = Array.from({ length: rows }, (_, index) => (index === emphasizedRow ? '1.45fr' : '1fr')).join(' ');

  return (
    <MondrianGrid
      className={`month-view${paintingMode ? ' painting-mode' : ''}${isBoogieWoogie ? ' boogie-woogie' : ''}`}
      label="Monthly calendar"
    >
      <div className="month-weekdays" style={{ gridTemplateColumns: columnTemplate }}>
        {orderedWeekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="month-grid" style={{ gridTemplateColumns: columnTemplate, gridTemplateRows: rowTemplate }}>
        {days.map((day) => {
          const dayEvents = getEventsForMonthDay(events, day);
          const visibleEvents = dayEvents.slice(0, 4);
          const isOutsideMonth = !isSameMonth(day, anchorDate);
          const isToday = isSameDay(day, today);
          const dayBoogieStyle = isBoogieWoogie
            ? (boogieLineVariables(day.toISOString()) as CSSProperties)
            : undefined;

          return (
            <section
              className={`month-day${isOutsideMonth ? ' is-muted' : ''}${isToday ? ' is-today' : ''}`}
              key={day.toISOString()}
              aria-label={`${day.toDateString()}, ${dayEvents.length} events`}
              style={dayBoogieStyle}
            >
              <header>
                <strong>{day.getDate()}</strong>
              </header>
              <div className="month-event-list">
                {visibleEvents.map((event) => (
                  <EventBlock
                    key={`${event.id}-${day.toISOString()}`}
                    event={event}
                    compact
                    boogieWoogie={isBoogieWoogie}
                    onSelect={onEventSelect}
                  />
                ))}
                {dayEvents.length > visibleEvents.length && (
                  <span className="more-indicator">+{dayEvents.length - visibleEvents.length} more</span>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </MondrianGrid>
  );
}

function getQuietestMonthWeekdays(
  events: CalendarEvent[],
  days: Date[],
  anchorDate: Date,
  excludedWeekday: number,
): Set<number> {
  const counts = WEEKDAY_LABELS.map((_, weekday) => ({
    weekday,
    count: days
      .filter((day) => isSameMonth(day, anchorDate) && day.getDay() === weekday)
      .reduce((total, day) => total + getEventsForMonthDay(events, day).length, 0),
  }));

  return new Set(
    counts
      .filter(({ weekday }) => weekday !== excludedWeekday)
      .sort((first, second) => first.count - second.count || first.weekday - second.weekday)
      .slice(0, 2)
      .map(({ weekday }) => weekday),
  );
}
