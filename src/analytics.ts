declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackLogin() {
  window.gtag?.('event', 'login', {
    method: 'Google',
  });
}

