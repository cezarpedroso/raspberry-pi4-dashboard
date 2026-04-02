import { useState, useEffect } from "react";

export interface ClockData {
  central: {
    time: string;
    date: string;
    label: string;
    timezone: string;
  };
  curitiba: {
    time: string;
    date: string;
    label: string;
    timezone: string;
  };
  hour: number;
}

function formatInZone(date: Date, timezone: string) {
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: timezone,
  });
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  });
  return { time: timeStr, date: dateStr };
}

function getHourInTimezone(date: Date, timezone: string): number {
  const hourStr = date.toLocaleString("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: timezone,
  });
  return parseInt(hourStr, 10);
}

export function useClock(): ClockData {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const centralTZ = "America/Chicago";
  const curitibaTZ = "America/Sao_Paulo";

  const central = formatInZone(now, centralTZ);
  const curitiba = formatInZone(now, curitibaTZ);

  return {
    central: { ...central, label: "Central Time", timezone: "CT" },
    curitiba: { ...curitiba, label: "Curitiba, Brazil", timezone: "BRT" },
    hour: getHourInTimezone(now, centralTZ),
  };
}
