import { useBibleVerse } from "@/hooks/useBibleVerse";

export function VersePanel() {
  const verse = useBibleVerse();

  return (
    <div
      className="glass-panel p-5 flex flex-col gap-3 h-full"
      style={{ borderRadius: "1.5rem" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-400 pulse-dot" />
        <span className="text-xs font-semibold tracking-[0.2em] uppercase opacity-35">Word of the Hour</span>
      </div>

      {verse.loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm opacity-25 animate-pulse tracking-widest">Loading...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          <div
            className="text-5xl opacity-25 leading-none select-none"
            style={{ fontFamily: "Georgia, serif", color: "var(--accent-amber)" }}
          >
            "
          </div>
          <div className="panel-scroll flex-1 pr-1">
            <p className="text-xl leading-[1.75] opacity-85 italic font-light">
              {verse.text}
            </p>
          </div>
          <div className="glass-divider" />
          <div className="flex items-center gap-2 pt-1">
            <span className="text-base font-semibold opacity-55 tracking-wide">— {verse.reference}</span>
            <span
              className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded"
              style={{ background: "rgba(251,191,36,0.12)", color: "var(--accent-amber)", border: "1px solid rgba(251,191,36,0.25)" }}
            >
              KJV
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
