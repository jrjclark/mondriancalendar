import { useState } from 'react';
import { useAuth } from '../context/AuthProvider';

export function SignInScreen() {
  const { signIn, isInitializing, authError } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  if (showDetails) {
    return (
      <main className="signin-shell">
        <section className="signin-panel signin-panel--details" aria-labelledby="details-title">
          <div className="signin-copy signin-details">
            <header className="details-hero">
              <h1 id="details-title">More Details</h1>
              <span aria-hidden="true" />
            </header>

            <section className="details-section details-section--intro">
              <p>
                This is intended as a fun vibe coding project. It utilises the Google Calendar API to access your Google
                Calendar. It can see but not edit your calendar. If you want to update your calendar, you'll need to use
                your usual calendar app.
              </p>
            </section>

            <section className="details-section details-section--settings">
              <h2>Settings</h2>
              <p>
                Like a normal Google Calendar, you can switch between week and month views. The week view provides the
                better viewing experience.
              </p>
              <p>
                Use the 'Composition' / 'Boogie Woogie' button to switch between styles. Read below for more background
                on these styles by Mondrian.
              </p>
              <p>
                By default, the calendar excludes midnight to 6am but you can turn this on with the '12am - 6am' button.
              </p>
              <p>
                Use the 'Painting' button to remove all text from the calendar and bring your life's agenda closer to a
                true Mondrian work. You can still click on any of the boxes to open a pop up with the event details.
              </p>
            </section>

            <section className="details-section details-section--mondrian">
              <h2>Piet Mondrian</h2>
              <p>
                Mondrian painted his famous Composition works mainly from the early 1920s through the 1930s, after years
                of stripping landscapes, trees and architecture down into pure line, colour and structure. Influenced by
                Cubism, the De Stijl movement and his own belief that art could reveal a deeper universal harmony, he
                reduced painting to verticals, horizontals, white space and carefully placed blocks of colour. The result
                was not decoration, but a search for balance: every line, gap and colour field creates tension, rhythm
                and order, turning the grid into a kind of visual music.
              </p>
              <p>
                In the early 1940s, after moving to New York, Mondrian's work became looser, brighter and more
                syncopated in his Boogie Woogie paintings. Inspired by the city's street grid, flashing lights and the
                energy of jazz, works like Broadway Boogie Woogie transformed his earlier black-line compositions into a
                pulsing network of colour. The meaning shifted from quiet universal balance to movement and modern life:
                the grid was no longer still, but alive with rhythm, speed and the optimism of the city.
              </p>
            </section>

            <section className="details-section details-section--developer">
              <h2>Developer</h2>
              <p>For any feedback, please send to james@theunderbidder.net</p>
              <button type="button" onClick={() => setShowDetails(false)} aria-label="Back to sign in">
                Back
              </button>
            </section>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="signin-shell">
      <section className="signin-panel" aria-labelledby="signin-title">
        <div className="signin-art" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="signin-copy">
          <h1 id="signin-title">Mondrian Calendar</h1>
          <p>
            Sign in to your calendar to turn your schedule into a Mondrian-inspired masterpiece. An organised modernist
            masterpiece of bold lines, bright moments, perfect balance. Just the way your life should be run.
          </p>
          <button type="button" onClick={signIn} disabled={isInitializing} aria-label="Sign in with Google">
            {isInitializing ? 'Connecting...' : 'Sign in with Google'}
          </button>
          {authError && <p className="error-message">{authError}</p>}
          <p className="scope-note">This app will ask for permission to view your calendar. It cannot edit your calendar.</p>
          <button
            type="button"
            className="details-link-button"
            onClick={() => setShowDetails(true)}
            aria-label="Show more details"
          >
            Click for more details about the app, its features, and Mondrian's artworks.
          </button>
        </div>
      </section>
      <nav className="signin-legal-links" aria-label="Legal links">
        <a href="/terms.html">Terms of Service</a>
        <a href="/privacy.html">Privacy Policy</a>
      </nav>
    </main>
  );
}
