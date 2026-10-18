import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/index.scss';
import '@/styles/animations.scss';
import Router from './router.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
