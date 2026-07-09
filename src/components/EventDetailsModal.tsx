import { useEffect } from 'react';
import type { CalendarEvent, EventAttendee } from '../types/calendar';
import { colorForEvent, textColorForBackground } from '../utils/colors';
import { formatDayHeader, formatTimeRange } from '../utils/date';

interface EventDetailsModalProps {
  event: CalendarEvent;
  onClose: () => void;
}

export function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const timeLabel = event.isAllDay ? 'All day' : formatTimeRange(event.start, event.end);
  const visibleAttendees = event.attendees.slice(0, 8);
  const eventColor = colorForEvent(event);
  const eventTextColor = textColorForBackground(eventColor);

  return (
    <div className="event-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        aria-label={`${event.title} details`}
        aria-modal="true"
        className="event-modal"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        role="dialog"
      >
        <header style={{ background: eventColor, color: eventTextColor }}>
          <div>
            <p>{formatDayHeader(event.start)}</p>
            <h2>{event.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close event details">
            Close
          </button>
        </header>
        <dl>
          <div>
            <dt>Time</dt>
            <dd>{timeLabel}</dd>
          </div>
          {event.location && (
            <div>
              <dt>Location</dt>
              <dd>{event.location}</dd>
            </div>
          )}
          {event.organizer && (
            <div>
              <dt>Organizer</dt>
              <dd>{formatPerson(event.organizer)}</dd>
            </div>
          )}
          {event.creator && !samePerson(event.creator, event.organizer) && (
            <div>
              <dt>Created by</dt>
              <dd>{formatPerson(event.creator)}</dd>
            </div>
          )}
          {event.description && (
            <div>
              <dt>Details</dt>
              <dd>{stripHtml(event.description)}</dd>
            </div>
          )}
          {event.attendees.length > 0 && (
            <div>
              <dt>Guests</dt>
              <dd>
                <ul className="event-modal-list">
                  {visibleAttendees.map((attendee) => (
                    <li key={attendee.email || attendee.name}>
                      {formatAttendee(attendee)}
                      {attendee.comment && <span>{attendee.comment}</span>}
                    </li>
                  ))}
                </ul>
                {event.attendees.length > visibleAttendees.length && (
                  <span>+{event.attendees.length - visibleAttendees.length} more guests</span>
                )}
                {event.attendeesOmitted && <span>Some guests may be hidden by Calendar.</span>}
              </dd>
            </div>
          )}
        </dl>
        {event.htmlLink && (
          <a href={event.htmlLink} target="_blank" rel="noreferrer">
            Open in Google Calendar
          </a>
        )}
      </section>
    </div>
  );
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatPerson(person: { name?: string; email?: string; self?: boolean }): string {
  const label = person.name || person.email || 'Unknown';
  return person.self ? `${label} (you)` : label;
}

function samePerson(first?: { email?: string }, second?: { email?: string }): boolean {
  return Boolean(first?.email && second?.email && first.email === second.email);
}

function formatAttendee(attendee: EventAttendee): string {
  const parts = [formatPerson(attendee)];

  if (attendee.responseStatus) {
    parts.push(formatToken(attendee.responseStatus));
  }

  if (attendee.optional) {
    parts.push('optional');
  }

  if (attendee.additionalGuests) {
    parts.push(`+${attendee.additionalGuests}`);
  }

  return parts.join(' · ');
}

function formatToken(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').toLowerCase();
}
