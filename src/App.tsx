import { FormEvent, useMemo, useState } from "react";
import {
  CurrentWeather,
  LocationResult,
  fetchCurrentWeather,
  getGardenHint,
  getWeatherDescription,
  searchLocations,
} from "./weather";

type Status = "idle" | "searching" | "loading-weather";

const formatLocation = (location: LocationResult) =>
  [location.name, location.admin1, location.country].filter(Boolean).join(", ");

function App() {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const isBusy = status !== "idle";
  const weatherDescription = useMemo(
    () => (weather ? getWeatherDescription(weather.weatherCode) : ""),
    [weather],
  );

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Enter a city, town, or place name.");
      return;
    }

    setStatus("searching");
    setError("");
    setWeather(null);

    try {
      const results = await searchLocations(trimmedQuery);
      setLocations(results);

      if (results.length === 0) {
        setError("No locations found. Try a nearby city or a different spelling.");
      }
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Something went wrong while searching.",
      );
    } finally {
      setStatus("idle");
    }
  };

  const handleLocationSelect = async (location: LocationResult) => {
    setStatus("loading-weather");
    setError("");

    try {
      const currentWeather = await fetchCurrentWeather(location);
      setWeather(currentWeather);
    } catch (weatherError) {
      setError(
        weatherError instanceof Error
          ? weatherError.message
          : "Something went wrong while loading weather.",
      );
    } finally {
      setStatus("idle");
    }
  };

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Garden app beta</p>
        <h1 id="page-title">Check the weather before tending your garden.</h1>
        <p className="hero-copy">
          Search for any location and get current conditions that can guide your
          next watering, planting, or garden check.
        </p>

        <form className="search-card" onSubmit={handleSearch}>
          <label htmlFor="location-search">Location</label>
          <div className="search-row">
            <input
              id="location-search"
              type="search"
              value={query}
              placeholder="Search city or town"
              autoComplete="address-level2"
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit" disabled={isBusy}>
              {status === "searching" ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      </section>

      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}

      {locations.length > 0 ? (
        <section className="panel" aria-labelledby="locations-title">
          <h2 id="locations-title">Choose a location</h2>
          <div className="location-list">
            {locations.map((location) => (
              <button
                className="location-option"
                key={`${location.id}-${location.latitude}-${location.longitude}`}
                type="button"
                disabled={status === "loading-weather"}
                onClick={() => void handleLocationSelect(location)}
              >
                <span>{formatLocation(location)}</span>
                <small>
                  {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
                </small>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {weather ? (
        <section className="weather-card" aria-labelledby="weather-title">
          <div>
            <p className="eyebrow">Current weather</p>
            <h2 id="weather-title">{formatLocation(weather.location)}</h2>
            <p className="muted">
              Observed at{" "}
              {new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(weather.observedAt))}
            </p>
          </div>

          <div className="weather-summary">
            <p className="temperature">{Math.round(weather.temperature)}°C</p>
            <div>
              <p className="condition">{weatherDescription}</p>
              <p className="muted">
                Feels like {Math.round(weather.apparentTemperature)}°C
              </p>
            </div>
          </div>

          <dl className="metrics">
            <div>
              <dt>Humidity</dt>
              <dd>{Math.round(weather.humidity)}%</dd>
            </div>
            <div>
              <dt>Precipitation</dt>
              <dd>{weather.precipitation.toFixed(1)} mm</dd>
            </div>
            <div>
              <dt>Wind</dt>
              <dd>{Math.round(weather.windSpeed)} km/h</dd>
            </div>
          </dl>

          <p className="garden-hint">{getGardenHint(weather)}</p>
        </section>
      ) : null}
    </main>
  );
}

export default App;
