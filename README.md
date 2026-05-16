# Garden App

A garden-focused mobile app that starts with one core function: search for a
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

Start the Expo development server:

```bash
npm run dev
```

Then open the app with Expo Go or an emulator:

```bash
npm run ios
npm run android
```

Run TypeScript verification:

```bash
npm run build
```