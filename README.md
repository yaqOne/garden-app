# Garden App

A garden-focused web app that starts with one core function: search for a
location and look up the current weather there.

The app uses the public Open-Meteo APIs, so no API key is needed for local
development.

## Current feature

- Search for a city, town, or place.
- Pick a matching location from the results.
- View current temperature, conditions, humidity, precipitation, wind, and a
  small garden hint.

## Future garden ideas

This project is intentionally small at the start and can grow with garden
features such as:

- Plant-specific care reminders based on weather.
- Frost and heat warnings.
- Watering schedules.
- Garden bed or plant tracking.
- Seasonal planting guidance.

## Development

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Vite will print both a `Local` and a `Network` URL. Use the `Network` URL, or
the forwarded/preview URL from your development environment, when opening the
app from another device. `localhost` only works on the machine running the dev
server.

Build for production:

```bash
npm run build
```