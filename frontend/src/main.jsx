import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DataProvider } from './GlobalState' // 1. Import DataProvider bạn vừa tạo

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider> {/* 2. Bao bọc App lại */}
      <App />
    </DataProvider>
  </StrictMode>,
)