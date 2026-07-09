import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const GIS_SCRIPT_ID = 'google-identity-services';
const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  authError: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const tokenClientRef = useRef<GoogleTokenClient | null>(null);

  const signIn = useCallback(async () => {
    setIsInitializing(true);
    setAuthError(null);

    try {
      const client = await getTokenClient();
      tokenClientRef.current = client;
      client.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google sign-in could not start.');
      setIsInitializing(false);
    }
  }, [accessToken]);

  const signOut = useCallback(() => {
    setAccessToken(null);
    setAuthError(null);
  }, []);

  const getTokenClient = useCallback(async (): Promise<GoogleTokenClient> => {
    await loadGoogleIdentityScript();

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      throw new Error('Missing VITE_GOOGLE_CLIENT_ID. Add it to .env.local before signing in.');
    }

    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2) {
      throw new Error('Google Identity Services did not load.');
    }

    return oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_SCOPE,
      callback: (response) => {
        setIsInitializing(false);

        if (response.error) {
          setAuthError(response.error_description || response.error);
          return;
        }

        if (!response.access_token) {
          setAuthError('Google did not return an access token.');
          return;
        }

        setAccessToken(response.access_token);
        setAuthError(null);
      },
      error_callback: (error) => {
        setIsInitializing(false);
        setAuthError(error instanceof Error ? error.message : 'Google sign-in failed.');
      },
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isInitializing,
      authError,
      signIn,
      signOut,
    }),
    [accessToken, authError, isInitializing, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  const existingScript = document.getElementById(GIS_SCRIPT_ID);
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google Identity Services failed to load.')), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GIS_SCRIPT_ID;
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Identity Services failed to load.'));
    document.head.append(script);
  });
}
