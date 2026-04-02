import { useEffect, useRef, useState, useCallback } from "react";
import { ClockPanel } from "@/components/ClockPanel";
import { WeatherPanel } from "@/components/WeatherPanel";
import { VersePanel } from "@/components/VersePanel";
import { FactPanel } from "@/components/FactPanel";
import { CalendarPanel } from "@/components/CalendarPanel";
import { useClock } from "@/hooks/useClock";

/* ── Orbs ──────────────────────────────────────────────────── */
function RedOrbs() {
  return (
    <>
      <div className="orb orb-a" style={{
        width: 700, height: 700, top: -150, left: -150,
        background: "radial-gradient(circle, rgba(120,0,0,0.7) 0%, rgba(60,0,0,0.3) 40%, transparent 70%)",
        opacity: 0.55,
      }} />
      <div className="orb orb-b" style={{
        width: 600, height: 600, bottom: -100, right: -80,
        background: "radial-gradient(circle, rgba(90,0,0,0.65) 0%, rgba(40,0,0,0.3) 40%, transparent 70%)",
        opacity: 0.45,
      }} />
      <div className="orb orb-c" style={{
        width: 450, height: 450, top: "35%", left: "42%",
        background: "radial-gradient(circle, rgba(100,10,10,0.50) 0%, transparent 65%)",
        opacity: 0.35,
      }} />
    </>
  );
}

/* ── Background ────────────────────────────────────────────── */
function Background({ bgImage }: { bgImage: string | null }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, #080000 0%, #100000 50%, #080000 100%)",
      }} />
      {bgImage && (
        <>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }} />
          <div className="bg-overlay" />
        </>
      )}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: bgImage ? 0.30 : 1 }}>
        <RedOrbs />
      </div>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.40) 100%)",
        zIndex: 2,
      }} />
    </div>
  );
}

/* ── Upload button ─────────────────────────────────────────── */
function UploadButton({ onUpload }: { onUpload: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(URL.createObjectURL(file));
  };
  return (
    <>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <button className="upload-btn" onClick={() => ref.current?.click()}>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" transform="rotate(180, 8, 8)" />
        </svg>
        Background
      </button>
    </>
  );
}

/* ── Dashboard ─────────────────────────────────────────────── */
export function Dashboard() {
  const { hour } = useClock();
  const [bgImage, setBgImage] = useState<string | null>(null);

  const handleUpload = useCallback((url: string) => {
    setBgImage(url);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
  }, [hour]);

  return (
    <div className="dashboard-root">
      <Background bgImage={bgImage} />

      <div className="dashboard-grid">

        {/* Left column: Clock + Verse */}
        <div className="dashboard-col">
          <div className="dashboard-cell" style={{ flex: "0 0 55%" }}>
            <ClockPanel />
          </div>
          <div className="dashboard-cell" style={{ flex: "1 1 0" }}>
            <VersePanel />
          </div>
        </div>

        {/* Center column: Calendar */}
        <div className="dashboard-col">
          <div className="dashboard-cell" style={{ flex: "1 1 0" }}>
            <CalendarPanel />
          </div>
        </div>

        {/* Right column: Weather + Fact */}
        <div className="dashboard-col">
          <div className="dashboard-cell" style={{ flex: "0 0 52%" }}>
            <WeatherPanel />
          </div>
          <div className="dashboard-cell" style={{ flex: "1 1 0" }}>
            <FactPanel />
          </div>
        </div>

      </div>

      <UploadButton onUpload={handleUpload} />

      <div
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50"
        style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.12, fontFamily: "'Orbitron', monospace", fontWeight: 600 }}
      >
        Personal Dashboard
      </div>
    </div>
  );
}
