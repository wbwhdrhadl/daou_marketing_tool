// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // 👈 App.jsx를 잘 가져오고 있나요?
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)