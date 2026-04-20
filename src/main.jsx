/**
 * main.jsx — application entry point.
 *
 * Mounts the React tree onto #root.
 * index.css imports Tailwind, shadcn CSS vars, and font files.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
)
