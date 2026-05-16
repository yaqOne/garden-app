import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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

  const handleSearch = async () => {
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
        setError(
          "No locations found. Try a nearby city or a different spelling.",
        );
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>Garden app beta</Text>
            <Text style={styles.title}>
              Check the weather before tending your garden.
            </Text>
            <Text style={styles.heroCopy}>
              Search for any location and get current conditions for watering,
              planting, or checking your garden.
            </Text>

            <View style={styles.searchCard}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                accessibilityLabel="Location search"
                autoCapitalize="words"
                autoCorrect={false}
                enterKeyHint="search"
                onChangeText={setQuery}
                onSubmitEditing={() => void handleSearch()}
                placeholder="Search city or town"
                placeholderTextColor="#7a8a7d"
                returnKeyType="search"
                style={styles.input}
                value={query}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isBusy }}
                disabled={isBusy}
                onPress={() => void handleSearch()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  isBusy ? styles.disabled : null,
                  pressed && !isBusy ? styles.pressed : null,
                ]}
              >
                {status === "searching" ? (
                  <ActivityIndicator color="#fffdf3" />
                ) : (
                  <Text style={styles.primaryButtonText}>Search</Text>
                )}
              </Pressable>
            </View>
          </View>

          {error ? (
            <View accessibilityLiveRegion="polite" style={styles.alert}>
              <Text style={styles.alertText}>{error}</Text>
            </View>
          ) : null}

          {locations.length > 0 ? (
            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>Choose a location</Text>
              <View style={styles.locationList}>
                {locations.map((location) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: status === "loading-weather",
                    }}
                    disabled={status === "loading-weather"}
                    key={`${location.id}-${location.latitude}-${location.longitude}`}
                    onPress={() => void handleLocationSelect(location)}
                    style={({ pressed }) => [
                      styles.locationOption,
                      pressed && status !== "loading-weather"
                        ? styles.locationPressed
                        : null,
                    ]}
                  >
                    <View style={styles.locationTextGroup}>
                      <Text style={styles.locationName}>
                        {formatLocation(location)}
                      </Text>
                      <Text style={styles.locationCoordinates}>
                        {location.latitude.toFixed(2)},{" "}
                        {location.longitude.toFixed(2)}
                      </Text>
                    </View>
                    {status === "loading-weather" ? (
                      <ActivityIndicator color="#2f653a" />
                    ) : (
                      <Text style={styles.locationArrow}>View</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {weather ? (
            <View style={styles.weatherCard}>
              <View>
                <Text style={styles.eyebrow}>Current weather</Text>
                <Text style={styles.weatherLocation}>
                  {formatLocation(weather.location)}
                </Text>
                <Text style={styles.muted}>
                  Observed {new Date(weather.observedAt).toLocaleString()}
                </Text>
              </View>

              <View style={styles.weatherSummary}>
                <Text style={styles.temperature}>
                  {Math.round(weather.temperature)}°C
                </Text>
                <View style={styles.conditionGroup}>
                  <Text style={styles.condition}>{weatherDescription}</Text>
                  <Text style={styles.muted}>
                    Feels like {Math.round(weather.apparentTemperature)}°C
                  </Text>
                </View>
              </View>

              <View style={styles.metrics}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Humidity</Text>
                  <Text style={styles.metricValue}>
                    {Math.round(weather.humidity)}%
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Rain</Text>
                  <Text style={styles.metricValue}>
                    {weather.precipitation.toFixed(1)} mm
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Wind</Text>
                  <Text style={styles.metricValue}>
                    {Math.round(weather.windSpeed)} km/h
                  </Text>
                </View>
              </View>

              <View style={styles.gardenHint}>
                <Text style={styles.gardenHintText}>{getGardenHint(weather)}</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f2e9",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    gap: 18,
    borderColor: "rgba(46, 90, 54, 0.14)",
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    backgroundColor: "#fbfbf3",
    shadowColor: "#1b3a23",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 4,
  },
  eyebrow: {
    color: "#587a36",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.7,
    textTransform: "uppercase",
  },
  title: {
    color: "#18331f",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 42,
  },
  heroCopy: {
    color: "#4a5f4e",
    fontSize: 17,
    lineHeight: 25,
  },
  searchCard: {
    gap: 10,
    borderColor: "rgba(46, 90, 54, 0.14)",
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    backgroundColor: "#ffffff",
  },
  label: {
    color: "#37513c",
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    minHeight: 52,
    borderColor: "rgba(46, 90, 54, 0.18)",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    color: "#18331f",
    backgroundColor: "#fbfbf5",
    fontSize: 16,
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#2f653a",
  },
  primaryButtonText: {
    color: "#fffdf3",
    fontSize: 16,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.65,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  alert: {
    borderColor: "rgba(170, 80, 45, 0.28)",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    backgroundColor: "#fff2e8",
  },
  alertText: {
    color: "#7a341f",
    fontSize: 15,
    fontWeight: "700",
  },
  panel: {
    gap: 12,
    borderColor: "rgba(46, 90, 54, 0.14)",
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    color: "#18331f",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  locationList: {
    gap: 10,
  },
  locationOption: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#eef5e9",
  },
  locationPressed: {
    backgroundColor: "#dfeeda",
  },
  locationTextGroup: {
    flex: 1,
    gap: 4,
  },
  locationName: {
    color: "#18331f",
    fontSize: 16,
    fontWeight: "900",
  },
  locationCoordinates: {
    color: "#66776b",
    fontSize: 13,
  },
  locationArrow: {
    color: "#2f653a",
    fontSize: 14,
    fontWeight: "900",
  },
  weatherCard: {
    gap: 18,
    borderColor: "rgba(46, 90, 54, 0.14)",
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  weatherLocation: {
    marginTop: 6,
    color: "#18331f",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  muted: {
    color: "#66776b",
    fontSize: 14,
    lineHeight: 20,
  },
  weatherSummary: {
    gap: 14,
  },
  temperature: {
    color: "#244e2d",
    fontSize: 80,
    fontWeight: "900",
    letterSpacing: -5,
    lineHeight: 84,
  },
  conditionGroup: {
    gap: 2,
  },
  condition: {
    color: "#18331f",
    fontSize: 22,
    fontWeight: "900",
  },
  metrics: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    gap: 4,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#f2f7ef",
  },
  metricLabel: {
    color: "#5e735f",
    fontSize: 12,
    fontWeight: "800",
  },
  metricValue: {
    color: "#18331f",
    fontSize: 18,
    fontWeight: "900",
  },
  gardenHint: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#dceecf",
  },
  gardenHintText: {
    color: "#244e2d",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 22,
  },
});

export default App;
