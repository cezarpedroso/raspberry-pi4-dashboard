import { useState, useEffect, useCallback } from "react";

export interface WeatherData {
  tempC: number;
  tempF: number;
  condition: string;
  description: string;
  windSpeed: number;
  humidity: number;
  feelsLikeC: number;
  feelsLikeF: number;
  icon: string;
  location: string;
  loading: boolean;
  error: string | null;
}

// Maps weather.gov short forecast text to icon and condition
function parseCondition(shortForecast: string): { condition: string; icon: string } {
  const s = shortForecast.toLowerCase();
  if (s.includes("thunder")) return { condition: "Thunderstorm", icon: "⛈" };
  if (s.includes("snow") || s.includes("blizzard")) return { condition: "Snow", icon: "❄" };
  if (s.includes("rain") || s.includes("shower") || s.includes("drizzle")) return { condition: "Rain", icon: "🌧" };
  if (s.includes("fog") || s.includes("mist")) return { condition: "Foggy", icon: "🌫" };
  if (s.includes("partly cloudy") || s.includes("partly sunny")) return { condition: "Partly Cloudy", icon: "⛅" };
  if (s.includes("mostly cloudy") || s.includes("overcast")) return { condition: "Mostly Cloudy", icon: "🌥" };
  if (s.includes("cloud")) return { condition: "Cloudy", icon: "☁" };
  if (s.includes("sunny") || s.includes("clear")) return { condition: "Clear", icon: "☀" };
  if (s.includes("wind") || s.includes("breezy")) return { condition: "Windy", icon: "💨" };
  return { condition: shortForecast, icon: "🌡" };
}

// Convert Fahrenheit to Celsius
function toCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Oskaloosa, IA
const LAT = 41.2959;
const LON = -92.6430;

export function useWeather(): WeatherData {
  const [data, setData] = useState<WeatherData>({
    tempC: 0,
    tempF: 0,
    condition: "",
    description: "",
    windSpeed: 0,
    humidity: 0,
    feelsLikeC: 0,
    feelsLikeF: 0,
    icon: "🌡",
    location: "Chicago, IL",
    loading: true,
    error: null,
  });

  const fetchWeather = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      // Step 1: Get grid endpoint for coordinates
      const pointsRes = await fetch(
        `https://api.weather.gov/points/${LAT},${LON}`,
        { headers: { "User-Agent": "PersonalDashboard/1.0" } }
      );
      if (!pointsRes.ok) throw new Error("Failed to get weather grid");
      const pointsData = await pointsRes.json();

      const { forecastHourly, relativeLocation } = pointsData.properties;
      const city = relativeLocation?.properties?.city ?? "Chicago";
      const state = relativeLocation?.properties?.state ?? "IL";

      // Step 2: Get hourly forecast
      const forecastRes = await fetch(forecastHourly, {
        headers: { "User-Agent": "PersonalDashboard/1.0" },
      });
      if (!forecastRes.ok) throw new Error("Failed to get forecast");
      const forecastData = await forecastRes.json();

      const current = forecastData.properties.periods[0];
      const tempF = Math.round(current.temperature);
      const tempC = toCelsius(tempF);

      // wind speed string e.g. "12 mph"
      const windMatch = current.windSpeed?.match(/(\d+)/);
      const windSpeed = windMatch ? parseInt(windMatch[1], 10) : 0;

      const { condition, icon } = parseCondition(current.shortForecast);

      // Humidity comes from dewpoint if available
      const dewpointC = current.dewpoint?.value ?? null;
      let humidity = 0;
      if (dewpointC !== null) {
        // Approximate relative humidity from dewpoint
        humidity = Math.round(
          100 * Math.exp((17.625 * dewpointC) / (243.04 + dewpointC)) /
            Math.exp((17.625 * tempC) / (243.04 + tempC))
        );
      }

      // Feels like — use temperature for simplicity (weather.gov hourly doesn't expose apparent temp directly)
      const feelsLikeF = current.apparentTemperature?.value
        ? Math.round(current.apparentTemperature.value * 9/5 + 32)
        : tempF;
      const feelsLikeC = toCelsius(feelsLikeF);

      setData({
        tempC,
        tempF,
        condition,
        description: current.shortForecast,
        windSpeed,
        humidity,
        feelsLikeC,
        feelsLikeF,
        icon,
        location: `${city}, ${state}`,
        loading: false,
        error: null,
      });
    } catch (err) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Weather unavailable",
      }));
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const id = setInterval(fetchWeather, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchWeather]);

  return data;
}
