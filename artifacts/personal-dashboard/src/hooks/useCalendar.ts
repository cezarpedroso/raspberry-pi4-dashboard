import { useState, useEffect, useCallback, useRef } from "react";

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  isAllDay: boolean;
  location?: string;
  description?: string;
  colorId?: string;
}

export interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  signIn: () => void;
  signOut: () => void;
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let accessToken: string | null = localStorage.getItem("gcal_token");
let tokenExpiry: number = parseInt(localStorage.getItem("gcal_token_expiry") || "0", 10);

function isTokenValid(): boolean {
  return !!accessToken && Date.now() < tokenExpiry;
}

function clearToken() {
  accessToken = null;
  tokenExpiry = 0;
  localStorage.removeItem("gcal_token");
  localStorage.removeItem("gcal_token_expiry");
}

function saveToken(token: string, expiresIn: number) {
  accessToken = token;
  tokenExpiry = Date.now() + expiresIn * 1000 - 60000;
  localStorage.setItem("gcal_token", token);
  localStorage.setItem("gcal_token_expiry", tokenExpiry.toString());
}

declare global {
  interface Window {
    google: typeof google;
  }
  namespace google {
    namespace accounts {
      namespace oauth2 {
        interface TokenClient {
          requestAccessToken(overrideConfig?: { prompt?: string }): void;
        }
        interface TokenResponse {
          access_token: string;
          expires_in: number;
          error?: string;
        }
        function initTokenClient(config: {
          client_id: string;
          scope: string;
          callback: (resp: TokenResponse) => void;
          error_callback?: (err: { type: string }) => void;
        }): TokenClient;
      }
    }
  }
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("gis-script")) {
      if (window.google?.accounts) resolve();
      else {
        const check = setInterval(() => {
          if (window.google?.accounts) { clearInterval(check); resolve(); }
        }, 100);
      }
      return;
    }
    const script = document.createElement("script");
    script.id = "gis-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

async function fetchTodayEvents(token: string): Promise<CalendarEvent[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", startOfDay);
  url.searchParams.set("timeMax", endOfDay);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "20");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) { clearToken(); throw new Error("auth_expired"); }
    throw new Error("Failed to fetch calendar");
  }

  const data = await res.json();
  return (data.items || []).map((item: Record<string, unknown>) => {
    const startObj = item.start as Record<string, string> | undefined;
    const endObj = item.end as Record<string, string> | undefined;
    const isAllDay = !!(startObj?.date && !startObj?.dateTime);
    const start = startObj?.dateTime || startObj?.date || "";
    const end = endObj?.dateTime || endObj?.date || "";
    return {
      id: item.id as string,
      summary: (item.summary as string) || "(No title)",
      start,
      end,
      isAllDay,
      location: item.location as string | undefined,
      description: item.description as string | undefined,
      colorId: item.colorId as string | undefined,
    };
  });
}

export function useCalendar(): CalendarState {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(isTokenValid());
  const callbackRef = useRef<((token: string) => void) | null>(null);

  const loadEvents = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const evts = await fetchTodayEvents(token);
      setEvents(evts);
      setConnected(true);
    } catch (err) {
      if (err instanceof Error && err.message === "auth_expired") {
        setConnected(false);
        setError("Session expired. Please reconnect.");
      } else {
        setError(err instanceof Error ? err.message : "Calendar unavailable");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const initTokenClient = useCallback(async () => {
    await loadGoogleScript();
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          setError("Authorization failed");
          return;
        }
        saveToken(resp.access_token, resp.expires_in);
        setConnected(true);
        if (callbackRef.current) callbackRef.current(resp.access_token);
      },
      error_callback: () => {
        setError("Authorization was cancelled");
      },
    });
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    if (!tokenClient) await initTokenClient();
    callbackRef.current = (token) => loadEvents(token);
    tokenClient!.requestAccessToken({ prompt: connected ? "" : "consent" });
  }, [initTokenClient, loadEvents, connected]);

  const signOut = useCallback(() => {
    clearToken();
    setConnected(false);
    setEvents([]);
    setError(null);
  }, []);

  useEffect(() => {
    initTokenClient();
    if (isTokenValid() && accessToken) {
      loadEvents(accessToken);
    }
    const id = setInterval(() => {
      if (isTokenValid() && accessToken) {
        loadEvents(accessToken);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [initTokenClient, loadEvents]);

  return { events, loading, error, connected, signIn, signOut };
}
