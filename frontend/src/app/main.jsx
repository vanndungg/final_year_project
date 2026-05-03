

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import App from './App.jsx'
import { DataProvider } from './providers/GlobalState' // boc app bang global provider.
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../i18n'; // Initialize i18n

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider>
      <App />
      <ToastContainer />
    </DataProvider>
  </StrictMode>,
)