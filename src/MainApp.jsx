import React from 'react';
import App from './WEATHERAPP.jsx';
import './WEATHER.css'; 

function MainApp() {
  return (
    <div className="main-container">  
     <span style={{ color: 'rgba(227, 221, 221, 0.899)' }}><h1>🌤️ WEATHER  APP</h1> </span>        
      <App />
    </div>
  );
}

export default MainApp;








