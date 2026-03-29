import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import App from './App.jsx'
import { DataProvider } from './providers/GlobalState' // 1. Import DataProvider bạn vừa tạo
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider> {/* 2. Bao bọc App lại */}
      <App />
      <ToastContainer />
    </DataProvider>
  </StrictMode>,
)