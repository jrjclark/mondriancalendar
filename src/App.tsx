import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarHeader } from './components/CalendarHeader';
import { EventDetailsModal } from './components/EventDetailsModal';
import { MonthView } from './components/MonthView';
import { SignInScreen } from './components/SignInScreen';
import { WeekView } from './components/WeekView';
import { useAuth } from './context/AuthProvider';
import {
  CalendarApiError,
  fetchCalendarEvents,
  fetchCalendarHideWeekends,
  fetchCalendarWeekStart,
} from './services/GoogleCalendarService';
import type { ArtStyle, CalendarEvent, CalendarView, WeekStart } from './types/calendar';
import { addMonths, addDays, endOfMonth, endOfWeek, getMonthGridDays, startOfMonth, startOfWeek } from './utils/date';

export function App() {
  const { accessToken, isAuthenticated, signOut } = useAuth();
  const [view, setView] = useState<CalendarView>('week');
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [showOvernightHours, setShowOvernightHours] = useState(false);
  const [paintingMode, setPaintingMode] = useState(false);
  const [artStyle, setArtStyle] = useState<ArtStyle>('composition');
  const [weekStart, setWeekStart] = useState<WeekStart>(0);
  const [hideWeekends, setHideWeekends] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleRange = useMemo(() => {
    if (view === 'week') {
      return {
        start: startOfWeek(anchorDate, weekStart),
        end: endOfWeek(anchorDate, weekStart),
      };
    }

    const gridDays = getMonthGridDays(anchorDate, weekStart);
    return {
      start: gridDays[0],
      end: new Date(gridDays[gridDays.length - 1].getFullYear(), gridDays[gridDays.length - 1].getMonth(), gridDays[gridDays.length - 1].getDate(), 23, 59, 59, 999),
    };
  }, [anchorDate, view, weekStart]);

  useEffect(() => {
    if (!accessToken) {
      setWeekStart(0);
      setHideWeekends(false);
      return;
    }

    const controller = new AbortController();

    Promise.all([
      fetchCalendarWeekStart(accessToken, controller.signal),
      fetchCalendarHideWeekends(accessToken, controller.signal),
    ])
      .then(([nextWeekStart, nextHideWeekends]) => {
        if (!controller.signal.aborted) {
          setWeekStart(nextWeekStart);
          setHideWeekends(nextHideWeekends);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setWeekStart(0);
          setHideWeekends(false);
        }
      });

    return () => controller.abort();
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchCalendarEvents(accessToken, visibleRange.start, visibleRange.end, controller.signal)
      .then((nextEvents) => {
        if (!controller.signal.aborted) {
          setEvents(nextEvents);
        }
      })
      .catch((fetchError) => {
        if (!controller.signal.aborted) {
          const message =
            fetchError instanceof CalendarApiError || fetchError instanceof Error
              ? fetchError.message
              : 'Calendar events could not be loaded.';
          setError(message);
          setEvents([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [accessToken, visibleRange.end, visibleRange.start]);

  const goPrevious = useCallback(() => {
    setAnchorDate((current) => (view === 'week' ? addDays(current, -7) : addMonths(current, -1)));
  }, [view]);

  const goNext = useCallback(() => {
    setAnchorDate((current) => (view === 'week' ? addDays(current, 7) : addMonths(current, 1)));
  }, [view]);

  const goToday = useCallback(() => {
    setAnchorDate(new Date());
  }, []);

  const handleViewChange = useCallback((nextView: CalendarView) => {
    setView(nextView);
    setAnchorDate((current) => (nextView === 'week' ? current : startOfMonth(current)));
  }, []);

  if (!isAuthenticated) {
    return <SignInScreen />;
  }

  return (
    <main className="app-shell">
      <CalendarHeader
        anchorDate={anchorDate}
        view={view}
        weekStart={weekStart}
        onViewChange={handleViewChange}
        onPrevious={goPrevious}
        onNext={goNext}
        onToday={goToday}
        showOvernightHours={showOvernightHours}
        onToggleOvernightHours={() => setShowOvernightHours((current) => !current)}
        paintingMode={paintingMode}
        onTogglePaintingMode={() => setPaintingMode((current) => !current)}
        artStyle={artStyle}
        onArtStyleChange={setArtStyle}
        onSignOut={signOut}
      />

      <section className="status-region" aria-live="polite">
        {isLoading && <p>Loading calendar...</p>}
        {error && <p className="error-message">Calendar loading failed. {friendlyError(error)}</p>}
        {!isLoading && !error && events.length === 0 && <p>No events in this period.</p>}
      </section>

      {view === 'week' ? (
        <WeekView
          events={events}
          anchorDate={anchorDate}
          weekStart={weekStart}
          hideWeekends={hideWeekends}
          showOvernightHours={showOvernightHours}
          paintingMode={paintingMode}
          artStyle={artStyle}
          onEventSelect={setSelectedEvent}
        />
      ) : (
        <MonthView
          events={events}
          anchorDate={anchorDate}
          weekStart={weekStart}
          paintingMode={paintingMode}
          artStyle={artStyle}
          onEventSelect={setSelectedEvent}
        />
      )}

      {selectedEvent && <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </main>
  );
}

function friendlyError(error: string): string {
  if (error.includes('401') || error.includes('Invalid Credentials')) {
    return 'Please sign out and sign back in.';
  }

  return 'Check the Google Cloud setup and try again.';
}
