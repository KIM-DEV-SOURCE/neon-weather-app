import React, { useEffect, useState } from "react";

const App = () => {
  const [city, setCity] = useState(() => {
    const saved = localStorage.getItem('last');
    return saved || 'New York';
  });
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dailyForecast, setDailyForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [hourlyForecast, setHourlyForecast] = useState(null);
  const [hourlyLoading, setHourlyLoading] = useState(false);
  const [recentcity, setrecentCity] = useState(() => {
    const savedCities = localStorage.getItem('recentCity');
    return savedCities ? JSON.parse(savedCities) : [];
  });
  const [inputFocused, setInputFocused] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showHourly, setShowHourly] = useState(false);

const APIKEY = '5e504237ca051fa89c89a923d42d2768'
  const fetchWeather = async (CityName) => {
    if (!CityName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${CityName}&appid=${APIKEY}&units=metric&lang=en`
      );
      if (!response.ok) throw new Error(' No Response ');
      const data = await response.json();
      setWeather(data);
      fetchDailyForecast(CityName);
      fetchHourlyForecast(CityName);
      addRecentCity(CityName);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const geolocation = () => {
    if (!navigator.geolocation) throw new Error('Failed to get Location try again');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getLocation(latitude, longitude);
      },
      (error) => setError('Failed to get Location try again')
    );
  };

  const getLocation = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}&units=metric&lang=en`
      );
      if (!response.ok) throw new Error('Failed to get Location try again');
      const data = await response.json();
      fetchWeather(data.name);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchDailyForecast = async (CityName) => {
    if (!CityName.trim()) return;
    setForecastLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${CityName}&appid=${APIKEY}&units=metric&lang=en`
      );
      if (!response.ok) throw new Error('Failed To Fetch Weather Forecast');
      const data = await response.json();
      
      const dailyData = {};
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
        
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = {
    date: dayKey,
  temp_max: item.main.temp_max,
 temp_min: item.main.temp_min,
            weather: item.weather[0],
            dateTimestamp: item.dt
          };
        } else {
          dailyData[dayKey].temp_max = Math.max(
            dailyData[dayKey].temp_max, 
            item.main.temp_max
          );
          dailyData[dayKey].temp_min = Math.min(
            dailyData[dayKey].temp_min, 
            item.main.temp_min
          );
        }
      });

      const forecastDays = Object.values(dailyData).slice(0, 5);
      setDailyForecast(forecastDays);
    } catch (err) {
      setError(err.message);
    } finally {
      setForecastLoading(false);
    }
  };

  const fetchHourlyForecast = async (CityName) => {
    if (!CityName.trim()) return;
    setHourlyLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${CityName}&appid=${APIKEY}&units=metric&lang=ar&cnt=8`
      );
      if (!response.ok) throw new Error('Failed To Fetch Weather Forecast');
      const data = await response.json();
      
      const hourlyData = data.list.map(item => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        temp: Math.round(item.main.temp),
        description: item.weather[0].description,
        weather: item.weather[0]
      }));
      
      setHourlyForecast(hourlyData);
    } catch (err) {
      setError(err.message);
    } finally {
      setHourlyLoading(false);
    }
  };

  const addRecentCity = (CityName) => {
    if (!CityName?.trim()) return;
    setrecentCity(prevCities => {
      const filtered = prevCities.filter(city => city !== CityName);
      const newCities = [CityName, ...filtered];
      return newCities.slice(0, 5);
    });
  };

  const handelInput = (e) => {
    setCity(e.target.value);
    setInputFocused(false);
  };

  useEffect(() => {
    localStorage.setItem('last', city);
  }, [city]);

  useEffect(() => {
    localStorage.setItem('recentCity', JSON.stringify(recentcity));
  }, [recentcity]);
return (
    <div className="app-container">
      <div className="search-container">
        <div className="input-wrapper">
 <input
   type="text"
   value={city}
    onChange={handelInput}
   onFocus={() => setInputFocused(true)}
    onBlur={() => setTimeout(() => setInputFocused(false), 250)}
   onKeyPress={(e) => e.key === 'Enter' && fetchWeather(city)}
   placeholder="City Name... "
   className="search-input"
   />

   {inputFocused && recentcity.length > 0 && (
   <div className="suggestions-dropdown">
   {recentcity.map((item, index) => (
    <div
 key={index}
  className="suggestion-item"
  onClick={() => {
  setCity(item);
    setInputFocused(false);
    fetchWeather(item);
       }}
     >
  {item}
      </div>
    ))}
   </div>
  )}
        </div>

        <div className="button-group">
          <button className="location-btn" onClick={geolocation} disabled={loading}>
          📍  Current Location
          </button>
          <button className="search-btn" onClick={() => fetchWeather(city)} disabled={loading}>
            {loading ? 'SEARCHING..' : 'SEARCH'}
          </button>
        </div>
      </div>

      {weather && (
        <div className="toggle-buttons">
          <button 
          className="hourly-toggle" onClick={() => setShowHourly(!showHourly)} disabled={hourlyLoading}>
            {showHourly ? 'HIDE 24H FORECAST 🕐' : hourlyLoading ? '  LOADING 24H FORECAST...' : '  SHOW 24H FORECAST  🕐'}
          </button>
          <button className="daily-toggle" onClick={() => setShowForecast(!showForecast)} disabled={forecastLoading}>
            {showForecast ? '  HIDE 5 DAYS FORECAST  📅' : forecastLoading ? '  LOADING...' : '  SHOW 5 DAYS FORCAST 📅'}
          </button>
        </div>
      )}

      {error && (
        <div className="error-card">
          <div>Error:</div>
          {error}
        </div>
      )}

      {weather && (
 <div className="current-weather-card">
 <h2>{ weather.name}</h2>
 <div className="temp-main">{Math.round(weather.main.temp)}°C</div>
 <div className="akrem">{weather.weather[0]?.description}</div>
 <div  className="akrem">{weather.weather[0]?.main}</div>
 </div>
   )}

 {showHourly && hourlyForecast && !hourlyLoading && (
  <div className="hourly-forecast-card">
  <h3>24h Weather Forecast  🕐</h3>
 <div className="hourly-scroll">
 {hourlyForecast.map((hour, index) => (
  <div key={index} className="hourly-item">
  <div>{hour.time}</div>
 <div>{hour.temp}°</div>
 <div>{hour.description}</div>
  <div>{hour.weather.main}</div>
 </div>
  ))}
 </div>
  </div>
   )}

 {showForecast && dailyForecast && !forecastLoading && (
 <div className="daily-forecast-card">
 <h3>Weekly Forecast (5 days) 📅</h3>
  <div className="daily-grid">
  {dailyForecast.map((day, index) => (
  <div key={index} className="daily-item">
  <div>{day.date}</div>
  <div>{Math.round(day.temp_max)}°</div>
  <div>{Math.round(day.temp_min)}° Low</div>
  <div>{day.weather.description}</div>
  <div>{day.weather.main}</div>
  </div>
          
          )
          )}
 </div>
   </div>
      )}

      {showForecast && forecastLoading && (
        <div className="loading-card">
   <div> Loading 5-Day Forecast... </div>
   </div>
      )}
    </div>
  );
};

export default App;
