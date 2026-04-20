/**
 * main.jsx — application entry point.
 *
 * Mounts the React tree onto #root.
 * index.css imports Tailwind, shadcn CSS vars, and font files.
 *
 * Note: StrictMode disabled to prevent double-mount issues with Supabase auth.
 */
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
