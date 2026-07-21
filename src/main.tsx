// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Forzamos un z-index super alto para que los modales no lo tapen */}
    <Toaster 
      position="bottom-right" 
      toastOptions={{ 
        duration: 3000,
        style: { zIndex: 999999 }
      }} 
    />
    <App />
  </StrictMode>,
)