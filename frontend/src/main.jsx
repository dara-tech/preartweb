import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { SiteProvider } from './contexts/SiteContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from './components/ui/toaster'

// Load modern typography with beautiful Khmer support
const fontLink = document.createElement('link')
fontLink.rel = 'stylesheet'
fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=Noto+Sans+Khmer:wght@100;200;300;400;500;600;700;800;900&display=swap'
document.head.appendChild(fontLink)

// Apply modern font stack with beautiful Khmer and English support
document.body.style.fontFamily = '"Poppins", "Noto Sans Khmer", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
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
        <AuthProvider>
          <SiteProvider>
            <App />
            <Toaster />
          </SiteProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)