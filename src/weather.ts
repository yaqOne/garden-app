export type LocationResult = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

export type CurrentWeather = {
  location: LocationResult;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  observedAt: string;
};

type GeocodingApiResult = {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

type GeocodingApiResponse = {
  results?: GeocodingApiResult[];
};

type ForecastApiResponse = {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
  };
};

export const getWeatherDescription = (code: number): string => {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Heavy thunderstorm with hail",
  };

  return descriptions[code] ?? "Weather data available";
};

export const getGardenHint = (weather: CurrentWeather): string => {
  if (weather.precipitation > 0) {
    return "Rain is already helping your garden today.";
  }

  if (weather.temperature >= 28) {
    return "Water early or late to protect plants from midday heat.";
  }

  if (weather.windSpeed >= 30) {
    return "Windy conditions may dry containers and young plants quickly.";
  }

  if (weather.temperature <= 4) {
    return "Cold conditions can stress tender plants; check frost protection.";
  }

  return "Good conditions for checking soil moisture and garden tasks.";
};

export const searchLocations = async (
  query: string,
): Promise<LocationResult[]> => {
  const params = new URLSearchParams({
    name: query,
    count: "5",
    language: "en",
    format: "json",
  });

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Location search failed. Please try again.");
  }

  const data = (await response.json()) as GeocodingApiResponse;

  return (
    data.results?.map((result) => ({
      id: result.id,
      name: result.name,
      country: result.country ?? "Unknown country",
      admin1: result.admin1,
      latitude: result.latitude,
      longitude: result.longitude,
    })) ?? []
  );
};

export const fetchCurrentWeather = async (
  location: LocationResult,
): Promise<CurrentWeather> => {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
    timezone: "auto",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Weather lookup failed. Please try again.");
  }

  const data = (await response.json()) as ForecastApiResponse;

  if (!data.current) {
    throw new Error("No current weather is available for this location.");
  }

  return {
    location,
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    precipitation: data.current.precipitation,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
    observedAt: data.current.time,
  };
};
