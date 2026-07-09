import type { CSSProperties, KeyboardEvent } from 'react';
import type { CalendarEvent } from '../types/calendar';
import { boogieAccentForEvent, colorForEvent, shouldShowBoogieAccent, textColorForBackground } from '../utils/colors';
import { formatTimeRange } from '../utils/date';

interface EventBlockProps {
  event: CalendarEvent;
  compact?: boolean;
  className?: string;
  boogieWoogie?: boolean;
  onSelect?: (event: CalendarEvent) => void;
  style?: CSSProperties;
}

export function EventBlock({
  event,
  compact = false,
  className = '',
  boogieWoogie = false,
  onSelect,
  style,
}: EventBlockProps) {
  const background = colorForEvent(event);
  const color = textColorForBackground(background);
  const timeLabel = event.isAllDay ? 'All day' : formatTimeRange(event.start, event.end);
  const isInteractive = Boolean(onSelect);
  const showBoogieAccent =
    boogieWoogie &&
    !compact &&
    event.end.getTime() - event.start.getTime() > 60 * 60 * 1000 &&
    shouldShowBoogieAccent(event);
  const boogieAccent = boogieAccentForEvent(event, background);

  const handleKeyDown = (keyboardEvent: KeyboardEvent<HTMLElement>) => {
    if (!onSelect) {
      return;
    }

    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      onSelect(event);
    }
  };

  return (
    <article
      className={`event-block${compact ? ' event-block--compact' : ''}${isInteractive ? ' event-block--interactive' : ''}${showBoogieAccent ? ' event-block--boogie-accent' : ''}${className ? ` ${className}` : ''}`}
      style={{ ...style, background, color, '--boogie-accent': boogieAccent } as CSSProperties}
      aria-label={`${event.title}, ${timeLabel}`}
      onClick={onSelect ? () => onSelect(event) : undefined}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      title={`${event.title} · ${timeLabel}`}
    >
      <strong>{event.title}</strong>
      {!compact && <span>{timeLabel}</span>}
    </article>
  );
}
