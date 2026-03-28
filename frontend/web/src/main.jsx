import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import { AppRouter } from '@/app/router.jsx'

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)
