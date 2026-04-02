import { useClock } from "@/hooks/useClock";

function TimeBlock({ time, date, label, timezone, large }: {
  time: string; date: string; label: string; timezone: string; large?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold tracking-[0.18em] uppercase opacity-45">{label}</span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-orbitron font-bold tracking-widest"
          style={{ background: "rgba(200,40,40,0.15)", color: "var(--accent-red)", border: "1px solid rgba(200,40,40,0.35)" }}
        >
          {timezone}
        </span>
      </div>
      <div
        className={`font-orbitron font-bold leading-none tracking-wide ${large ? "text-[5rem]" : "text-[2.8rem]"}`}
        style={{ textShadow: large ? "0 0 30px rgba(220,50,50,0.30)" : "none" }}
      >
        {time}
      </div>
      <div className="text-sm opacity-50 font-medium tracking-wide">{date}</div>
    </div>
  );
}

export function ClockPanel() {
  const { central, curitiba } = useClock();

  return (
    <div
      className="glass-panel p-7 flex flex-col gap-6 h-full"
      style={{ borderRadius: "1.5rem" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
        <span className="text-xs font-semibold tracking-[0.2em] uppercase opacity-35">Live Clock</span>
      </div>

      <TimeBlock {...central} large />

      <div className="glass-divider my-1" />

      <TimeBlock {...curitiba} />
    </div>
  );
}
