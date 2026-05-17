import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Aurora from './components/Aurora'
import Home from './pages/Home'
import Projects from './pages/Projects'
import About from './pages/About'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white relative">

        {/* Aurora fixo como fundo — fica atrás de todo o conteúdo via z-index */}
        <div className="fixed inset-0 z-0">
          <Aurora
            colorStops={['#0f0a1e', '#1d4ed8', '#0f172a']}
            amplitude={1.2}
            blend={0.6}
            speed={0.6}
          />
        </div>

        {/* Todo o conteúdo fica acima do aurora */}
        <div className="relative z-10">
          <Header />
          {/* Espaço para o header flutuante não sobrepor o conteúdo */}
          <div className="h-20" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  )
}
