import type { ArtStyle, CalendarView, WeekStart } from '../types/calendar';
import { formatMonthTitle, formatWeekTitle } from '../utils/date';
import { ViewToggle } from './ViewToggle';

interface CalendarHeaderProps {
  anchorDate: Date;
  view: CalendarView;
  weekStart: WeekStart;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  showOvernightHours: boolean;
  onToggleOvernightHours: () => void;
  paintingMode: boolean;
  onTogglePaintingMode: () => void;
  artStyle: ArtStyle;
  onArtStyleChange: (style: ArtStyle) => void;
  onSignOut: () => void;
}

export function CalendarHeader({
  anchorDate,
  view,
  weekStart,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  showOvernightHours,
  onToggleOvernightHours,
  paintingMode,
  onTogglePaintingMode,
  artStyle,
  onArtStyleChange,
  onSignOut,
}: CalendarHeaderProps) {
  const title = view === 'week' ? formatWeekTitle(anchorDate, weekStart) : formatMonthTitle(anchorDate);
  const nextArtStyle = artStyle === 'composition' ? 'boogie' : 'composition';
  const artStyleLabel = artStyle === 'composition' ? 'Composition' : 'Boogie Woogie';
  const nextArtStyleLabel = nextArtStyle === 'composition' ? 'Composition' : 'Boogie Woogie';

  return (
    <header className="calendar-header">
      <div className="brand-lockup" aria-label="Mondrian Calendar">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div>
          <h1>Mondrian Calendar</h1>
          <p>{title}</p>
        </div>
      </div>

      <div className="calendar-actions">
        <ViewToggle view={view} onChange={onViewChange} />
        <div className="navigation-buttons">
          <button type="button" onClick={onPrevious} aria-label={`Previous ${view}`}>
            Prev
          </button>
          <button type="button" onClick={onToday} aria-label="Jump to today">
            Today
          </button>
          <button type="button" onClick={onNext} aria-label={`Next ${view}`}>
            Next
          </button>
        </div>
        <button
          type="button"
          className={`calendar-option-button art-style-button${artStyle === 'boogie' ? ' is-active' : ''}`}
          onClick={() => onArtStyleChange(nextArtStyle)}
          aria-label={`Current style is ${artStyleLabel}. Switch to ${nextArtStyleLabel}.`}
          aria-pressed={artStyle === 'boogie'}
        >
          {artStyleLabel}
        </button>
        {view === 'week' && (
          <button
            type="button"
            className={`calendar-option-button${showOvernightHours ? ' is-active' : ''}`}
            onClick={onToggleOvernightHours}
            aria-label="Toggle midnight to 6am hours"
            aria-pressed={showOvernightHours}
          >
            12am-6am
          </button>
        )}
        <button
          type="button"
          className={`calendar-option-button${paintingMode ? ' is-active' : ''}`}
          onClick={onTogglePaintingMode}
          aria-label="Toggle painting mode"
          aria-pressed={paintingMode}
        >
          Painting
        </button>
        <button type="button" className="plain-button" onClick={onSignOut} aria-label="Sign out">
          Sign out
        </button>
      </div>
    </header>
  );
}
