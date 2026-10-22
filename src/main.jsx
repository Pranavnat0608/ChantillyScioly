import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import SetupNeeded from './pages/SetupNeeded'
import { AuthProvider } from './lib/AuthContext'
import { isConfigured } from './lib/firebase'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isConfigured ? (
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    ) : (
      <SetupNeeded />
    )}
  </StrictMode>,
)
