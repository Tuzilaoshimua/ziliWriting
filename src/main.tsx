import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import { isTauri } from '@tauri-apps/api/core'
import { registerSW } from 'virtual:pwa-register'

if (!isTauri()) registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
