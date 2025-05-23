'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

const Weather = () => {
  const [location, setLocation] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);

  const getWeather = async () => {
    const sanitizedLocation = location.trim();
    if (!sanitizedLocation) {
      setError('Please enter a location');
      toast.error('Enter a valid city name!');
      return;
    }

    try {
      setLoading(true);
      toast.info('Fetching weather data...');

      const geoRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${sanitizedLocation}&limit=1&appid=${API_KEY}`
      );
      if (!geoRes.data.length) throw new Error('Location not found');

      const { lat, lon, name, country } = geoRes.data[0];

      const currentRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const current = {
        name,
        country,
        temp: currentRes.data.main.temp,
        humidity: currentRes.data.main.humidity,
        weather: currentRes.data.weather,
        wind_speed: currentRes.data.wind.speed,
        pressure: currentRes.data.main.pressure,
        cloudiness: currentRes.data.clouds.all,
        visibility: currentRes.data.visibility / 1000, // in km
      };
      setCurrentWeather(current);

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );

      setForecast(forecastRes.data.list);
      setError('');
      toast.success(`Weather data for ${name}, ${country} loaded successfully!`);
    } catch (err) {
      setError('Location not found or error fetching data');
      setCurrentWeather(null);
      setForecast([]);
      toast.error('Failed to fetch weather data!');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    padding: '40px 50px',
    maxWidth: '1100px',
    margin: 'auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: darkMode ? '#f0f0f0' : '#222',
    background: darkMode
      ? 'linear-gradient(135deg, #283e51, #485563)'
      : 'linear-gradient(135deg, #8ec5fc, #e0c3fc)',
    minHeight: '100vh',
    transition: 'background 0.6s ease',
  };

  const glassCard = {
    borderRadius: '20px',
    background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(15px)',
    border: darkMode ? '1.5px solid rgba(255, 255, 255, 0.2)' : '1.5px solid rgba(0, 0, 0, 0.1)',
    boxShadow: darkMode
      ? '0 8px 30px rgba(0,0,0,0.8)'
      : '0 8px 30px rgba(0,0,0,0.1)',
    padding: '25px',
    marginBottom: '30px',
    transition: 'all 0.3s ease',
  };

  const buttonStyle = {
    padding: '12px 22px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    marginLeft: '12px',
    transition: 'background-color 0.3s ease',
    backgroundColor: darkMode ? '#6173c9' : '#4a90e2',
    color: 'white',
    boxShadow: darkMode
      ? '0 6px 12px rgba(152, 166, 235, 0.6)'
      : '0 6px 12px rgba(170, 195, 223, 0.6)',
  };

  const inputStyle = {
    padding: '14px 18px',
    borderRadius: '14px',
    border: 'none',
    width: '280px',
    fontSize: '1rem',
    fontWeight: '500',
    boxShadow: darkMode
      ? '0 4px 10px rgba(255, 255, 255, 0.2)'
      : '0 4px 10px rgba(0, 0, 0, 0.1)',
  };

  // Group forecast by day
  const groupedForecast = forecast.reduce((acc, item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  // Animate card hover with scale and shadow
  const cardHover = {
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Hero Section */}
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '700', letterSpacing: '2px' }}>
          🌤️ Advanced Weather App
        </h1>
        <p style={{ fontSize: '1.2rem', fontWeight: '500', opacity: 0.85, marginTop: '10px' }}>
          Get accurate weather updates and forecasts with a beautiful interface
        </p>
      </header>

      {/* Search + Controls */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city"
          style={inputStyle}
          onKeyDown={e => e.key === 'Enter' && getWeather()}
        />
        <button
          onClick={getWeather}
          disabled={loading}
          style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Loading...' : 'Search'}
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            ...buttonStyle,
            marginLeft: '20px',
            backgroundColor: darkMode ? '#f5a623' : '#333',
            boxShadow: darkMode
              ? '0 6px 12px rgba(245,166,35,0.6)'
              : '0 6px 12px rgba(0,0,0,0.6)',
          }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p style={{ color: '#ff6b6b', textAlign: 'center', fontWeight: '600', marginBottom: '40px' }}>
          {error}
        </p>
      )}

      {/* Current Weather Card */}
      {currentWeather && (
        <section
          style={{ ...glassCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}
          className="current-weather-card"
        >
          <div style={{ flex: '1 1 300px' }}>
            <h2 style={{ fontWeight: '700', fontSize: '2.3rem' }}>
              {currentWeather.name}, {currentWeather.country}
            </h2>
            <p style={{ fontSize: '1.4rem', fontWeight: '600', margin: '8px 0' }}>
              <span role="img" aria-label="temperature">🌡️</span> {currentWeather.temp}°C
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: '500', opacity: 0.85 }}>
              {currentWeather.weather[0].description.charAt(0).toUpperCase() + currentWeather.weather[0].description.slice(1)}
            </p>
          </div>

          {/* Weather icon */}
          <div style={{ flex: '0 0 120px' }}>
            <img
              src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@4x.png`}
              alt={currentWeather.weather[0].description}
              style={{ filter: darkMode ? 'drop-shadow(0 0 5px white)' : 'drop-shadow(0 0 5px black)' }}
            />
          </div>

          {/* Other details */}
          <div
            style={{
              flex: '1 1 350px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              fontSize: '1rem',
              fontWeight: '600',
            }}
          >
            <div>💧 Humidity: <span style={{ fontWeight: '700' }}>{currentWeather.humidity}%</span></div>
            <div>💨 Wind Speed: <span style={{ fontWeight: '700' }}>{currentWeather.wind_speed} m/s</span></div>
            <div>🔵 Pressure: <span style={{ fontWeight: '700' }}>{currentWeather.pressure} hPa</span></div>
            <div>☁️ Cloudiness: <span style={{ fontWeight: '700' }}>{currentWeather.cloudiness}%</span></div>
            <div>👁 Visibility: <span style={{ fontWeight: '700' }}>{currentWeather.visibility} km</span></div>
          </div>
        </section>
      )}

      {/* Forecast Section */}
      {forecast.length > 0 && (
        <section style={{ marginBottom: '60px' }}>
          <h3 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '700', marginBottom: '30px' }}>
            📅 5-Day Forecast
          </h3>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              paddingBottom: '10px',
            }}
          >
            {Object.entries(groupedForecast).map(([date, data], idx) => (
              <div
                key={idx}
                onClick={() => setSelectedDayData(data)}
                style={{
                  ...glassCard,
                  width: '220px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  ...cardHover,
                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = darkMode
                    ? '0 15px 35px rgba(0,0,0,0.8)'
                    : '0 15px 35px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = darkMode
                    ? '0 8px 30px rgba(0,0,0,0.5)'
                    : '0 8px 30px rgba(0,0,0,0.1)';
                }}
                aria-label={`Forecast for ${new Date(date).toDateString()}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setSelectedDayData(data);
                }}
              >
                <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '10px' }}>
                  {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <img
                  src={`https://openweathermap.org/img/wn/${data[0].weather[0].icon}@2x.png`}
                  alt={data[0].weather[0].description}
                  style={{ marginBottom: '10px' }}
                />
                <p style={{ fontWeight: '600', fontSize: '1.2rem' }}>
                  {Math.round(data[0].main.temp)}°C
                </p>
                <p style={{ fontSize: '0.9rem', color: darkMode ? '#ddd' : '#555' }}>
                  {data[0].weather[0].main}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Selected day detailed graph */}
      {selectedDayData && (
        <section
          style={{
            ...glassCard,
            padding: '20px 30px',
          }}
        >
          <h4 style={{ fontWeight: '700', fontSize: '1.8rem', marginBottom: '25px', textAlign: 'center' }}>
            Detailed Forecast for {new Date(selectedDayData[0].dt_txt).toDateString()}
          </h4>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={selectedDayData.map((entry) => ({
                time: entry.dt_txt.slice(11, 16),
                temp: entry.main.temp,
                humidity: entry.main.humidity,
                pressure: entry.main.pressure,
                wind_speed: entry.wind.speed,
                cloudiness: entry.clouds.all,
              }))}
              margin={{ top: 10, right: 40, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#555' : '#ccc'} />
              <XAxis dataKey="time" stroke={darkMode ? '#eee' : '#333'} />
              <YAxis
                stroke={darkMode ? '#eee' : '#333'}
                yAxisId="left"
                orientation="left"
                domain={['auto', 'auto']}
                label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: darkMode ? '#eee' : '#333' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={darkMode ? '#eee' : '#333'}
                domain={['auto', 'auto']}
                label={{ value: 'Humidity (%)', angle: 90, position: 'insideRight', fill: darkMode ? '#eee' : '#333' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#222' : '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: darkMode
                    ? '0 0 10px rgba(255, 255, 255, 0.2)'
                    : '0 0 10px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ fontWeight: '700' }}
              />
              <Legend
                wrapperStyle={{ color: darkMode ? '#eee' : '#333', fontWeight: '600' }}
                verticalAlign="top"
                height={36}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temp"
                stroke="#ff7300"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#387908"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              {/* Additional metrics lines */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="pressure"
                stroke="#0073ff"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                legendType="line"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="wind_speed"
                stroke="#ff0000"
                strokeWidth={2}
                strokeDasharray="3 4 5 2"
                dot={false}
                legendType="line"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cloudiness"
                stroke="#a52a2a"
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={false}
                legendType="line"
              />
            </LineChart>
          </ResponsiveContainer>
          <button
            onClick={() => setSelectedDayData(null)}
            style={{
              marginTop: '20px',
              padding: '10px 22px',
              borderRadius: '10px',
              backgroundColor: darkMode ? '#ff5757' : '#e94e77',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
              width: 'fit-content',
              boxShadow: darkMode
                ? '0 4px 12px rgba(255, 87, 87, 0.7)'
                : '0 4px 12px rgba(233, 78, 119, 0.7)',
            }}
          >
            Close Detail
          </button>
        </section>
      )}

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '15px 0', opacity: 0.7, fontSize: '0.9rem' }}>
        Weather App &copy; {new Date().getFullYear()} — Powered by OpenWeatherMap API
      </footer>
    </div>
  );
};

export default Weather;
