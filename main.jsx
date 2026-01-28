import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './src/weather.css'           
import MainApp from './src/MainApp.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainApp />
  </StrictMode>,
)
