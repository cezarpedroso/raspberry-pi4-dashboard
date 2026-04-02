import { useCalendar, CalendarEvent } from "@/hooks/useCalendar";

const EVENT_COLORS: Record<string, string> = {
  "1": "#a4bdfc",
  "2": "#7ae7bf",
  "3": "#dbadff",
  "4": "#ff887c",
  "5": "#fbd75b",
  "6": "#ffb878",
  "7": "#46d6db",
  "8": "#e1e1e1",
  "9": "#5484ed",
  "10": "#51b749",
  "11": "#dc2127",
};

function formatTime(iso: string, isAllDay: boolean): string {
  if (isAllDay) return "All day";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function getDayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

function EventItem({ event }: { event: CalendarEvent }) {
  const color = EVENT_COLORS[event.colorId ?? ""] ?? "rgba(220,60,60,0.9)";
  const startTime = formatTime(event.start, event.isAllDay);
  const endTime = event.isAllDay ? "" : formatTime(event.end, event.isAllDay);

  return (
    <div className="flex gap-3 items-start">
      <div
        className="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold opacity-90 leading-tight">{event.summary}</span>
        <span className="text-xs opacity-45 font-orbitron tracking-wide mt-0.5">
          {startTime}{endTime && !event.isAllDay ? ` – ${endTime}` : ""}
        </span>
        {event.location && (
          <span className="text-[11px] opacity-35 truncate mt-0.5">{event.location}</span>
        )}
      </div>
    </div>
  );
}

export function CalendarPanel() {
  const { events, loading, error, connected, signIn, signOut } = useCalendar();

  return (
    <div
      className="glass-panel p-5 flex flex-col gap-4 h-full"
      style={{ borderRadius: "1.5rem" }}
    >
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full pulse-dot ${connected ? "bg-green-500" : "bg-amber-400"}`} />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase opacity-35">Calendar</span>
        </div>
        {connected && (
          <button
            onClick={signOut}
            className="text-[10px] opacity-25 hover:opacity-60 transition-opacity tracking-widest uppercase font-semibold"
          >
            Disconnect
          </button>
        )}
      </div>

      <div className="flex-shrink-0">
        <div className="text-base font-semibold opacity-75 tracking-wide">{getDayLabel()}</div>
        <div className="glass-divider mt-2" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto panel-scroll">
        {!connected ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-6">
            <div className="text-5xl opacity-60 select-none">📅</div>
            <p className="text-sm opacity-45 text-center leading-relaxed px-4">
              Connect your Google Calendar to see today's events
            </p>
            {error && (
              <p className="text-xs text-red-400 opacity-75 text-center px-3">{error}</p>
            )}
            <button onClick={signIn} className="cal-connect-btn">
              Connect Google Calendar
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm opacity-30 animate-pulse font-orbitron tracking-widest">Syncing...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="text-sm opacity-40 text-center">{error}</span>
            <button onClick={signIn} className="cal-connect-btn">Reconnect</button>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-4xl opacity-40 select-none">✓</span>
            <span className="text-sm opacity-40 tracking-wide">No events today</span>
          </div>
        ) : (
          <div className="flex flex-col gap-5 pr-1">
            {events.map((ev) => <EventItem key={ev.id} event={ev} />)}
          </div>
        )}
      </div>
    </div>
  );
}
