/**
 * Location-based weather for theme.
 * Uses browser geolocation + Open-Meteo (no API key, CORS-friendly).
 * Maps WMO weather codes to sunny / cloudy / rainy.
 */

import type { WeatherMode } from "@/lib/theme";

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

/** WMO weather code → our WeatherMode */
function weatherCodeToMode(code: number): WeatherMode {
  if (code === 0) return "sunny";
  if ([1, 2, 3, 45, 48].includes(code)) return "cloudy";
  return "rainy"; // 51–99: drizzle, rain, snow, thunderstorm, etc.
}

export interface LocationWeatherResult {
  weather: WeatherMode;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches current weather for a location.
 * Returns sunny as fallback on error or while loading.
 */
export async function fetchWeatherForLocation(
  lat: number,
  lon: number
): Promise<WeatherMode> {
  const url = `${OPEN_METEO}?latitude=${lat}&longitude=${lon}&current=weather_code`;
  const res = await fetch(url);
  if (!res.ok) return "sunny";
  const data = (await res.json()) as { current?: { weather_code?: number } };
  const code = data.current?.weather_code ?? 0;
  return weatherCodeToMode(code);
}

/**
 * Gets browser position; rejects if denied or unavailable.
 */
export function getBrowserPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator?.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      reject,
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

/**
 * Resolves to current weather mode from user location, or "sunny" on any failure.
 */
export async function getWeatherFromLocation(): Promise<WeatherMode> {
  try {
    const { lat, lon } = await getBrowserPosition();
    return await fetchWeatherForLocation(lat, lon);
  } catch {
    return "sunny";
  }
}
