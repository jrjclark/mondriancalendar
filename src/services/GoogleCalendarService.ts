import type { CalendarEvent, GoogleCalendarEvent, WeekStart } from '../types/calendar';
import { formatDateInput } from '../utils/date';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export class CalendarApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CalendarApiError';
  }
}

export async function fetchCalendarEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date,
  signal?: AbortSignal,
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: formatDateInput(timeMin),
    timeMax: formatDateInput(timeMax),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '2500',
  });

  const response = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new CalendarApiError(details || `Calendar request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { items?: GoogleCalendarEvent[] };
  return (payload.items ?? [])
    .filter((event) => event.status !== 'cancelled')
    .map(normalizeGoogleEvent)
    .filter((event): event is CalendarEvent => Boolean(event));
}

export async function fetchCalendarWeekStart(accessToken: string, signal?: AbortSignal): Promise<WeekStart> {
  const response = await fetch(`${CALENDAR_API_BASE}/users/me/settings/weekStart`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    return 0;
  }

  const payload = (await response.json()) as { value?: string };
  return parseWeekStart(payload.value);
}

export async function fetchCalendarHideWeekends(accessToken: string, signal?: AbortSignal): Promise<boolean> {
  const response = await fetch(`${CALENDAR_API_BASE}/users/me/settings/hideWeekends`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as { value?: string };
  return payload.value === 'true';
}

function parseWeekStart(value: string | undefined): WeekStart {
  if (value === '1') {
    return 1;
  }

  if (value === '6') {
    return 6;
  }

  return 0;
}

function normalizeGoogleEvent(event: GoogleCalendarEvent & { status?: string }): CalendarEvent | null {
  if (!event.start || !event.end) {
    return null;
  }

  const isAllDay = Boolean(event.start.date);
  const start = parseCalendarDate(event.start, false);
  const end = parseCalendarDate(event.end, true);

  if (!start || !end) {
    return null;
  }

  return {
    id: event.id,
    title: event.summary?.trim() || 'Untitled event',
    description: event.description,
    location: event.location,
    start,
    end,
    isAllDay,
    htmlLink: event.htmlLink,
    hangoutLink: event.hangoutLink,
    status: event.status,
    created: event.created ? new Date(event.created) : undefined,
    updated: event.updated ? new Date(event.updated) : undefined,
    creator: normalizePerson(event.creator),
    organizer: normalizePerson(event.organizer),
    attendees: (event.attendees ?? []).map((attendee) => ({
      ...normalizePerson(attendee),
      optional: attendee.optional,
      responseStatus: attendee.responseStatus,
      comment: attendee.comment,
      additionalGuests: attendee.additionalGuests,
    })),
    attendeesOmitted: event.attendeesOmitted,
    recurrence: event.recurrence,
    recurringEventId: event.recurringEventId,
    transparency: event.transparency,
    visibility: event.visibility,
    iCalUID: event.iCalUID,
    sequence: event.sequence,
    conference: normalizeConference(event),
    attachments: (event.attachments ?? []).map((attachment) => ({
      title: attachment.title,
      url: attachment.fileUrl,
      mimeType: attachment.mimeType,
    })),
    source: event.source
      ? {
          title: event.source.title,
          url: event.source.url,
        }
      : undefined,
    eventType: event.eventType,
    locked: event.locked,
    privateCopy: event.privateCopy,
    reminders: event.reminders
      ? {
          useDefault: event.reminders.useDefault,
          overrides: event.reminders.overrides ?? [],
        }
      : undefined,
    birthday: event.birthdayProperties
      ? {
          type: event.birthdayProperties.type,
          label: event.birthdayProperties.customTypeName,
        }
      : undefined,
    workingLocation: normalizeWorkingLocation(event),
    outOfOffice: event.outOfOfficeProperties?.declineMessage || event.outOfOfficeProperties?.autoDeclineMode,
    focusTime:
      event.focusTimeProperties?.declineMessage ||
      event.focusTimeProperties?.chatStatus ||
      event.focusTimeProperties?.autoDeclineMode,
  };
}

function normalizePerson(person: GoogleCalendarEvent['creator']) {
  if (!person) {
    return undefined;
  }

  return {
    email: person.email,
    name: person.displayName,
    self: person.self,
  };
}

function normalizeConference(event: GoogleCalendarEvent): CalendarEvent['conference'] {
  const entryPoints = event.conferenceData?.entryPoints ?? [];
  const video = entryPoints.find((entryPoint) => entryPoint.entryPointType === 'video');
  const phone = entryPoints.find((entryPoint) => entryPoint.entryPointType === 'phone');
  const link = video?.uri || event.hangoutLink;

  if (!event.conferenceData && !event.hangoutLink) {
    return undefined;
  }

  return {
    name: event.conferenceData?.conferenceSolution?.name,
    link,
    phone: phone?.uri || phone?.label,
    meetingCode: video?.meetingCode || phone?.meetingCode,
    passcode: video?.passcode || video?.password || video?.pin || video?.accessCode,
    notes: event.conferenceData?.notes,
  };
}

function normalizeWorkingLocation(event: GoogleCalendarEvent): string | undefined {
  const workingLocation = event.workingLocationProperties;

  if (!workingLocation) {
    return undefined;
  }

  if (workingLocation.type === 'homeOffice') {
    return 'Home office';
  }

  if (workingLocation.customLocation?.label) {
    return workingLocation.customLocation.label;
  }

  const office = workingLocation.officeLocation;
  if (!office) {
    return workingLocation.type;
  }

  return [office.label, office.buildingId, office.floorId, office.floorSectionId, office.deskId]
    .filter(Boolean)
    .join(', ');
}

function parseCalendarDate(value: GoogleCalendarEvent['start'], isEnd: boolean): Date | null {
  if (value.dateTime) {
    return new Date(value.dateTime);
  }

  if (value.date) {
    const [year, month, day] = value.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return isEnd ? date : new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  return null;
}
