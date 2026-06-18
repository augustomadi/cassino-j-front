import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider, applyTheme } from './theme/ThemeProvider'
import { load } from './theme/themeStorage'
import { DEFAULT_THEME } from './theme/presets'

// Aplica o tema salvo antes do 1º paint (evita flash do tema padrão)
applyTheme(load() || DEFAULT_THEME)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
