import { useRandomFact } from "@/hooks/useRandomFact";

const CATEGORY_STYLES: Record<string, { dot: string; tag: string; tagBorder: string }> = {
  History:    { dot: "bg-rose-400",   tag: "rgba(251,113,133,0.9)", tagBorder: "rgba(251,113,133,0.25)" },
  Philosophy: { dot: "bg-violet-400", tag: "rgba(167,139,250,0.9)", tagBorder: "rgba(167,139,250,0.25)" },
  Religion:   { dot: "bg-amber-400",  tag: "rgba(251,191,36,0.9)",  tagBorder: "rgba(251,191,36,0.25)"  },
  Curiosity:  { dot: "bg-teal-400",   tag: "rgba(52,211,153,0.9)",  tagBorder: "rgba(52,211,153,0.25)"  },
};

export function FactPanel() {
  const fact = useRandomFact();
  const style = CATEGORY_STYLES[fact.category] ?? CATEGORY_STYLES["Curiosity"];

  return (
    <div
      className="glass-panel p-5 flex flex-col gap-3 h-full"
      style={{ borderRadius: "1.5rem" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full pulse-dot ${style.dot}`} />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase opacity-35">Knowledge</span>
        </div>
        {fact.category && (
          <span
            className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded-full"
            style={{ color: style.tag, background: `${style.tagBorder}`, border: `1px solid ${style.tagBorder}` }}
          >
            {fact.category.toUpperCase()}
          </span>
        )}
      </div>

      {fact.loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm opacity-25 animate-pulse tracking-widest">Loading...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <div className="text-3xl opacity-20 leading-none select-none" style={{ color: style.tag }}>✦</div>
          <div className="panel-scroll flex-1 pr-1">
            <p className="text-xl leading-[1.75] opacity-80 font-light">
              {fact.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
