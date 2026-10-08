import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App'
const theme = createTheme({ palette: { mode: 'dark', background: { paper: '#0b0b0b' } }, typography: { fontFamily: 'Space Grotesk, sans-serif' }, shape: { borderRadius: 0 } })
createRoot(document.getElementById('root')!).render(<StrictMode><ThemeProvider theme={theme}><CssBaseline enableColorScheme={false} /><BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}><MotionConfig reducedMotion="user"><App /></MotionConfig></BrowserRouter></ThemeProvider></StrictMode>)
