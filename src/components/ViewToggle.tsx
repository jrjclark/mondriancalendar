import type { CalendarView } from '../types/calendar';

interface ViewToggleProps {
  view: CalendarView;
  onChange: (view: CalendarView) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="view-toggle" aria-label="Calendar view">
      <button
        type="button"
        className={view === 'week' ? 'is-active' : ''}
        onClick={() => onChange('week')}
        aria-label="Show weekly view"
        aria-pressed={view === 'week'}
      >
        Week
      </button>
      <button
        type="button"
        className={view === 'month' ? 'is-active' : ''}
        onClick={() => onChange('month')}
        aria-label="Show monthly view"
        aria-pressed={view === 'month'}
      >
        Month
      </button>
    </div>
  );
}
