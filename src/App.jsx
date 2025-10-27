import React, { useState } from "react";
import { fetchWeatherApi } from "openmeteo";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError("");
      setWeather(null);

      // Step 1️⃣ — Get coordinates (lat, lon) of the entered city
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}&count=1`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found. Please check the spelling.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2️⃣ — Fetch weather data using coordinates
      const params = {
        latitude,
        longitude,
        hourly: "temperature_2m",
      };
      const url = "https://api.open-meteo.com/v1/forecast";
      const responses = await fetchWeatherApi(url, params);
      const response = responses[0];
      const utcOffsetSeconds = response.utcOffsetSeconds();
      const hourly = response.hourly();

      // Step 3️⃣ — Process data
      const times = Array.from(
        { length: (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval() },
        (_, i) =>
          new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
      );

      const temperatures = hourly.variables(0).valuesArray();

      const hourlyData = times.map((t, i) => ({
        time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        temp: temperatures[i],
      }));

      setWeather({
        city: name,
        country,
        data: hourlyData.slice(0, 8), // show next 8 hours
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather data. Try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-400 to-indigo-600 flex flex-col items-center justify-center text-white p-4">
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6">🌍 Weather App</h1>

        {/* Input + Search */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter any city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-gray-800 focus:outline-none"
          />
          <button
            onClick={fetchWeather}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition"
          >
            Search
          </button>
        </div>

        {/* Loading / Error / Weather Display */}
        {loading && <p className="text-center text-lg">Loading...</p>}
        {error && <p className="text-center text-red-300">{error}</p>}

        {weather && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-center mb-2">
              {weather.city}, {weather.country}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {weather.data.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/30 rounded-xl p-3 flex flex-col items-center"
                >
                  <span className="text-lg font-bold">{item.temp.toFixed(1)}°C</span>
                  <span className="text-sm">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-white/80">
        Powered by{" "}
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Open-Meteo API
        </a>
      </p>
    </div>
  );
}

export default App;
