import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { LanguageProvider } from './services/LanguageContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import "./i18n";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ErrorBoundary>,
)
