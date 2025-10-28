import { useState } from "react";
import { motion,     AnimatePresence } from "framer-motion";
import { getAiWeatherSummary } from "../services/ai.service";

export default function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Map Open-Meteo weather codes to readable conditions
  const weatherCodeMap = {
    0: "Clear",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Cloudy",
    45: "Foggy",
    48: "Rime Fog",
    51: "Light Drizzle",
    61: "Rainy",
    71: "Snowy",
    80: "Showers",
    95: "Thunderstorm",
  };

  async function getCoordinates(cityName) {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`
    );
    const data = await res.json();
    if (!data.results || data.results.length === 0)
      throw new Error("City not found");
    const { latitude, longitude, country } = data.results[0];
    return { latitude, longitude, country };
  }

  async function getWeatherData(cityName) {
    const { latitude, longitude, country } = await getCoordinates(cityName);
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const data = await res.json();
    const current = data.current_weather;
    const condition = weatherCodeMap[current.weathercode] || "Unknown";

    return {
      city: cityName,
      country,
      currentTemp: current.temperature,
      condition,
      humidity: 60, // static for simplicity
    };
  }

  async function handleSearch() {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    setWeather(null);
    setAiSummary("");

    try {
      const weatherData = await getWeatherData(city);
      setWeather(weatherData);
      const aiText = await getAiWeatherSummary(weatherData);
      setAiSummary(aiText);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Define UI based on condition
  const getWeatherUI = (condition) => {
    switch (condition) {
      case "Clear":
      case "Mainly Clear":
        return {
          bg: "from-blue-400 to-yellow-300",
          icon: "☀️",
          message: "A perfect sunny day! Grab your sunglasses 😎",
        };
      case "Partly Cloudy":
      case "Cloudy":
        return {
          bg: "from-gray-300 to-gray-500",
          icon: "⛅",
          message: "A bit cloudy — but still beautiful outside 🌤️",
        };
      case "Rainy":
      case "Light Drizzle":
      case "Showers":
        return {
          bg: "from-blue-600 to-gray-800",
          icon: "🌧️",
          message: "Rain’s here! Don’t forget your umbrella ☔",
        };
      case "Snowy":
        return {
          bg: "from-blue-200 to-white",
          icon: "❄️",
          message: "Snow is falling — time for a hot chocolate ☕",
        };
      case "Thunderstorm":
        return {
          bg: "from-gray-700 to-black",
          icon: "⛈️",
          message: "Thunderstorm outside! Stay safe indoors ⚡",
        };
      case "Foggy":
      case "Rime Fog":
        return {
          bg: "from-gray-400 to-gray-600",
          icon: "🌫️",
          message: "Fog ahead — drive safe and take it slow 🚗",
        };
      default:
        return {
          bg: "from-slate-300 to-slate-600",
          icon: "🌍",
          message: "Weather data available — enjoy your day!",
        };
    }
  };

  const ui = weather ? getWeatherUI(weather.condition) : null;

  return (
    <motion.div
      className={`min-h-screen flex flex-col items-center justify-center text-white transition-all duration-700 ${
        ui
          ? `bg-gradient-to-br ${ui.bg}`
          : "bg-gradient-to-br from-sky-400 to-indigo-600"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="bg-white/20 backdrop-blur-md rounded-2xl p-8 w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] shadow-2xl text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold mb-6">🌦️ AI Weather Assistant</h1>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold"
          >
            Search
          </motion.button>
        </div>

        {loading && <p>⏳ Fetching weather...</p>}
        {error && <p className="text-red-300">{error}</p>}

        <AnimatePresence>
          {weather && (
            <motion.div
              key={weather.condition}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-4"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-7xl mb-2"
              >
                {ui.icon}
              </motion.div>

              <h2 className="text-2xl font-semibold">
                {weather.city}, {weather.country}
              </h2>
              <p className="text-lg mt-2">🌡️ {weather.currentTemp}°C</p>
              <p className="text-lg">💧 Humidity: {weather.humidity}%</p>
              <p className="text-lg font-medium mt-1">
                Condition: {weather.condition}
              </p>
              <p className="italic mt-2">{ui.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {aiSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white/30 rounded-xl p-4 text-black font-medium"
          >
            🤖 {aiSummary}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
