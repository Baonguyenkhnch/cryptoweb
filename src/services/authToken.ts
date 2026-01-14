export const AUTH_TOKEN_KEY = "authToken";

/**
 * Best-effort token storage for SPA.
 * - Uses localStorage so auth survives reload.
 * - Emits an event so the app can react without forcing reload.
 *
 * Security note: localStorage is vulnerable to XSS. If the backend supports it,
 * prefer HttpOnly secure cookies for production.
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } finally {
    // Same-tab notification (storage event doesn't fire in same tab)
    window.dispatchEvent(new Event("authTokenChanged"));
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("currentUser");
  } finally {
    window.dispatchEvent(new Event("authTokenChanged"));
  }
}
