// main.jsx — ponto de entrada do React
// ReactDOM.createRoot "monta" a árvore de componentes React dentro do <div id="root"> do HTML
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode ativa verificações extras em desenvolvimento (sem impacto em produção)
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
