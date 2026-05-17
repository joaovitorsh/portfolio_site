import { Link, useLocation } from 'react-router-dom'

function NavLink({ to, children }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
          : 'text-gray-300 hover:text-white hover:bg-white/10 active:scale-95'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Header() {
  return (
    // Wrapper que centraliza o header flutuante no topo da página
    <div className="fixed top-4 left-0 right-0 z-40 flex justify-center px-4">
      <header className="w-full max-w-2xl bg-gray-900/70 backdrop-blur-lg border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between shadow-xl">
        <Link to="/" className="text-white font-bold text-base tracking-tight">
          João Vítor <span className="text-blue-400 font-normal text-sm">/ dev</span>
        </Link>

        <nav className="flex gap-1">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/projects">Projetos</NavLink>
          <NavLink to="/about">Sobre</NavLink>
        </nav>
      </header>
    </div>
  )
}
