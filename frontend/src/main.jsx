import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n/config'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { SiteProvider } from './contexts/SiteContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { Toaster } from './components/ui/toaster'

// Load Poppins (primary UI) + Hanuman (reports only) + Noto Sans Khmer fallback
const fontLink = document.createElement('link')
fontLink.rel = 'stylesheet'
fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Hanuman:wght@100;300;400;700;900&family=Noto+Sans+Khmer:wght@100;200;300;400;500;600;700;800;900&display=swap'
document.head.appendChild(fontLink)

// Apply Poppins as primary font for overall layout
document.body.style.fontFamily = '"Poppins", ui-sans-serif, system-ui, sans-serif'
document.body.style.letterSpacing = '-0.01em'
document.body.style.lineHeight = '1.6'
document.body.style.fontWeight = '400'
document.body.style.textRendering = 'optimizeLegibility'
document.body.style.webkitFontSmoothing = 'antialiased'
document.body.style.mozOsxFontSmoothing = 'grayscale'
document.body.style.fontFeatureSettings = '"kern" 1, "liga" 1, "calt" 1'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SiteProvider>
              <App />
              <Toaster />
            </SiteProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)