export interface CalendarDateTime {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  start: CalendarDateTime;
  end: CalendarDateTime;
  created?: string;
  updated?: string;
  htmlLink?: string;
  hangoutLink?: string;
  creator?: GoogleEventPerson;
  organizer?: GoogleEventPerson;
  attendees?: GoogleEventAttendee[];
  attendeesOmitted?: boolean;
  recurrence?: string[];
  recurringEventId?: string;
  transparency?: string;
  visibility?: string;
  iCalUID?: string;
  sequence?: number;
  conferenceData?: GoogleConferenceData;
  attachments?: GoogleEventAttachment[];
  source?: GoogleEventSource;
  eventType?: string;
  locked?: boolean;
  privateCopy?: boolean;
  reminders?: GoogleEventReminders;
  birthdayProperties?: GoogleBirthdayProperties;
  workingLocationProperties?: GoogleWorkingLocationProperties;
  outOfOfficeProperties?: GoogleOutOfOfficeProperties;
  focusTimeProperties?: GoogleFocusTimeProperties;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  htmlLink?: string;
  hangoutLink?: string;
  status?: string;
  created?: Date;
  updated?: Date;
  creator?: EventPerson;
  organizer?: EventPerson;
  attendees: EventAttendee[];
  attendeesOmitted?: boolean;
  recurrence?: string[];
  recurringEventId?: string;
  transparency?: string;
  visibility?: string;
  iCalUID?: string;
  sequence?: number;
  conference?: EventConference;
  attachments: EventAttachment[];
  source?: EventSource;
  eventType?: string;
  locked?: boolean;
  privateCopy?: boolean;
  reminders?: EventReminders;
  birthday?: EventBirthday;
  workingLocation?: string;
  outOfOffice?: string;
  focusTime?: string;
}

export interface GoogleEventPerson {
  id?: string;
  email?: string;
  displayName?: string;
  self?: boolean;
}

export interface GoogleEventAttendee extends GoogleEventPerson {
  organizer?: boolean;
  resource?: boolean;
  optional?: boolean;
  responseStatus?: string;
  comment?: string;
  additionalGuests?: number;
}

export interface GoogleConferenceData {
  entryPoints?: Array<{
    entryPointType?: string;
    uri?: string;
    label?: string;
    meetingCode?: string;
    passcode?: string;
    password?: string;
    pin?: string;
    accessCode?: string;
  }>;
  conferenceSolution?: {
    name?: string;
  };
  notes?: string;
}

export interface GoogleEventAttachment {
  fileUrl?: string;
  title?: string;
  mimeType?: string;
}

export interface GoogleEventSource {
  url?: string;
  title?: string;
}

export interface GoogleEventReminders {
  useDefault?: boolean;
  overrides?: Array<{
    method?: string;
    minutes?: number;
  }>;
}

export interface GoogleBirthdayProperties {
  type?: string;
  customTypeName?: string;
}

export interface GoogleWorkingLocationProperties {
  type?: string;
  customLocation?: {
    label?: string;
  };
  officeLocation?: {
    label?: string;
    buildingId?: string;
    floorId?: string;
    floorSectionId?: string;
    deskId?: string;
  };
}

export interface GoogleOutOfOfficeProperties {
  autoDeclineMode?: string;
  declineMessage?: string;
}

export interface GoogleFocusTimeProperties {
  autoDeclineMode?: string;
  declineMessage?: string;
  chatStatus?: string;
}

export interface EventPerson {
  email?: string;
  name?: string;
  self?: boolean;
}

export interface EventAttendee extends EventPerson {
  optional?: boolean;
  responseStatus?: string;
  comment?: string;
  additionalGuests?: number;
}

export interface EventConference {
  name?: string;
  link?: string;
  phone?: string;
  meetingCode?: string;
  passcode?: string;
  notes?: string;
}

export interface EventAttachment {
  title?: string;
  url?: string;
  mimeType?: string;
}

export interface EventSource {
  title?: string;
  url?: string;
}

export interface EventReminders {
  useDefault?: boolean;
  overrides: Array<{
    method?: string;
    minutes?: number;
  }>;
}

export interface EventBirthday {
  type?: string;
  label?: string;
}

export interface TimedEventSegment {
  event: CalendarEvent;
  day: Date;
  start: Date;
  end: Date;
  column: number;
  columnCount: number;
}

export type CalendarView = 'week' | 'month';

export type WeekStart = 0 | 1 | 6;

export type ArtStyle = 'composition' | 'boogie';
