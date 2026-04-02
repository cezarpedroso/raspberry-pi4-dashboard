import { useWeather } from "@/hooks/useWeather";

export function WeatherPanel() {
  const weather = useWeather();

  return (
    <div
      className="glass-panel p-6 flex flex-col gap-4 h-full"
      style={{ borderRadius: "1.5rem" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-400 pulse-dot" />
        <span className="text-xs font-semibold tracking-[0.2em] uppercase opacity-35">Weather</span>
      </div>

      {weather.loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm opacity-30 animate-pulse font-orbitron tracking-widest">Syncing...</span>
        </div>
      ) : weather.error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <span className="text-5xl">🌡</span>
          <span className="text-sm opacity-30 text-center">{weather.error}</span>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 mt-1">
            <span className="text-7xl leading-none select-none" role="img" aria-label={weather.condition}>
              {weather.icon}
            </span>
            <div className="flex flex-col">
              <div
                className="font-orbitron font-bold leading-none"
                style={{ fontSize: "4.5rem", textShadow: "0 0 40px rgba(220,50,50,0.3)" }}
              >
                {weather.tempF}°
                <span className="text-3xl opacity-50">F</span>
              </div>
              <div className="font-orbitron text-xl opacity-40 mt-1">{weather.tempC}°C</div>
            </div>
          </div>

          <div>
            <div className="text-2xl font-semibold opacity-90 tracking-wide">{weather.condition}</div>
            <div className="text-sm opacity-45 mt-1 tracking-wide">{weather.description}</div>
          </div>

          <div className="mt-auto glass-divider" />

          <div className="grid grid-cols-3 gap-3 mt-1">
            <Stat label="Wind" value={`${weather.windSpeed} mph`} />
            {weather.humidity > 0 && <Stat label="Humidity" value={`${weather.humidity}%`} />}
            <Stat label="Location" value={weather.location} wide />
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`flex flex-col ${wide ? "col-span-2" : ""}`}>
      <span className="text-[10px] uppercase tracking-[0.15em] opacity-35 font-semibold mb-1">{label}</span>
      <span className="text-sm font-semibold opacity-75 font-orbitron tracking-wide">{value}</span>
    </div>
  );
}
