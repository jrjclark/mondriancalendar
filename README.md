# Mondrian Calendar

A read-only Google Calendar viewer inspired by Piet Mondrian: bold black lines, white free time, and event blocks in red, blue, and yellow.

## Features

- Google OAuth sign-in with the minimum Calendar scope:
  `https://www.googleapis.com/auth/calendar.readonly`
- Weekly and monthly views
- Previous, next, and today navigation
- Current weekday emphasis for Mondrian-like asymmetry
- All-day, multi-day, busy-day, empty, loading, and error states
- Deterministic event colours based on event ID/title
- No event editing, invite sending, calendar creation, moving, resizing, or deleting

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Google OAuth client:

   - Open the [Google Cloud Console](https://console.cloud.google.com/).
   - Create or select a project.
   - Enable **Google Calendar API**.
   - Go to **APIs & Services > OAuth consent screen** and configure the app.
   - Go to **APIs & Services > Credentials**.
   - Create an **OAuth client ID** for a **Web application**.
   - Add `http://localhost:5173` to **Authorized JavaScript origins**.

3. Add the client ID:

   ```bash
   cp .env.example .env.local
   ```

   Then set:

   ```bash
   VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
   ```

4. Start development:

   ```bash
   npm run dev
   ```

5. Open the local URL Vite prints, usually:

   ```text
   http://localhost:5173
   ```

## Production Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

For a deployed production domain, add that domain to the OAuth client’s **Authorized JavaScript origins** in Google Cloud Console.

## OAuth Scope

The app requests only:

```text
https://www.googleapis.com/auth/calendar.readonly
```

This allows the app to read calendar events. It does not allow creating, editing, deleting, moving, inviting, or managing calendars.

## App Structure

- `src/context/AuthProvider.tsx`: Google Identity Services OAuth token flow
- `src/services/GoogleCalendarService.ts`: Google Calendar API fetch and event normalization
- `src/components/CalendarHeader.tsx`: navigation, view switcher, sign-out
- `src/components/ViewToggle.tsx`: weekly/monthly toggle
- `src/components/WeekView.tsx`: time-based weekly Mondrian layout
- `src/components/MonthView.tsx`: asymmetric monthly grid
- `src/components/MondrianGrid.tsx`: shared calendar frame
- `src/components/EventBlock.tsx`: deterministic red/blue/yellow event blocks
- `src/utils/date.ts`: date range and formatting helpers
- `src/utils/layout.ts`: event splitting and overlap layout helpers
- `src/utils/colors.ts`: Mondrian palette and event colour hashing
