"use client";
import React, { useEffect, useState } from "react";
import { WiDaySunny, WiCloud, WiRain, WiSnow } from "react-icons/wi";

export default function Weather({ defaultCity = "Bhopal" }) {
  const [city, setCity] = useState(defaultCity);
  const [cities, setCities] = useState([]);
  const [weather, setWeather] = useState(null);

  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  console.log("API Key:", API_KEY);

  // Local curated city list (public/cities.json)
  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch("/cities.json");
        const data = await res.json();
        setCities(data);
      } catch (err) {
        console.error("City list error:", err);
      }
    }
    fetchCities();
  }, []);

  // Auto-detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=hi`
          );
          const data = await res.json();
          if (data?.name) setCity(data.name);
          if (data?.main?.temp) setWeather(data);
        } catch (err) {
          console.error("Geo Weather error:", err);
        }
      });
    }
  }, []);

  // Fetch weather when city changes
  useEffect(() => {
    async function fetchWeather() {
      if (!city) return;
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=hi&appid=${API_KEY}`
        );
        const data = await res.json();
        if (data?.main?.temp) setWeather(data);
      } catch (err) {
        console.error("Weather API error:", err);
      }
    }
    fetchWeather();
  }, [city]);

  const getWeatherIcon = (main) => {
    switch (main) {
      case "Clear":
        return <WiDaySunny className="text-yellow-400 text-xl" />;
      case "Clouds":
        return <WiCloud className="text-gray-400 text-xl" />;
      case "Rain":
        return <WiRain className="text-blue-400 text-xl" />;
      case "Snow":
        return <WiSnow className="text-blue-200 text-xl" />;
      default:
        return <WiCloud className="text-gray-400 text-xl" />;
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* City Selector */}
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="bg-primary border border-custom text-secondary px-2 py-1 rounded"
      >
        {cities.length > 0 ? (
          cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))
        ) : (
          <option>Loading...</option>
        )}
      </select>

      {/* Weather Info */}
      {weather ? (
        <div className="flex items-center gap-1">
          {getWeatherIcon(weather.weather[0].main)}
          <span>{Math.round(weather.main.temp)}°C</span>
        </div>
      ) : (
        <span>--°C</span>
      )}
    </div>
  );
}
