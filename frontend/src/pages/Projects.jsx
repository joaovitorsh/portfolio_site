import { useEffect, useState, useMemo, useRef } from 'react'
import { fetchRepos } from '../api/github'
import RepoCard from '../components/RepoCard'
import ReadmeModal from '../components/ReadmeModal'

// Dropdown customizado — substitui o <select> nativo que tem fundo branco no sistema
function LangDropdown({ languages, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Fecha ao clicar fora do dropdown
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm hover:border-white/25 transition-colors min-w-36"
      >
        <span className="flex-1 text-left">{value}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul className="absolute top-full mt-1 w-full bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden z-20 shadow-xl">
          {languages.map(lang => (
            <li key={lang}>
              <button
                onClick={() => { onChange(lang); setOpen(false) }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  value === lang
                    ? 'bg-blue-600/40 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {lang}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Toggle switch no lugar do checkbox feio
function Toggle({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-gray-200 transition-colors select-none"
    >
      <div className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-white/15'}`}>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      {label}
    </button>
  )
}

export default function Projects() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedLang, setSelectedLang] = useState('Todas')
  const [showForks, setShowForks] = useState(false)
  const [modalRepo, setModalRepo] = useState(null)

  useEffect(() => {
    fetchRepos().then(setRepos).finally(() => setLoading(false))
  }, [])

  const languages = useMemo(() => {
    const langs = [...new Set(repos.map(r => r.language).filter(Boolean))].sort()
    return ['Todas', ...langs]
  }, [repos])

  const filtered = useMemo(() => {
    return repos.filter(repo => {
      if (!showForks && repo.fork) return false
      if (selectedLang !== 'Todas' && repo.language !== selectedLang) return false
      if (search) {
        const q = search.toLowerCase()
        const inName = repo.name.toLowerCase().includes(q)
        const inDesc = repo.description?.toLowerCase().includes(q) ?? false
        const inTopics = repo.topics.some(t => t.toLowerCase().includes(q))
        if (!inName && !inDesc && !inTopics) return false
      }
      return true
    })
  }, [repos, search, selectedLang, showForks])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400" />
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Projetos</h1>
        <p className="text-gray-400">{repos.length} repositórios públicos no GitHub</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        <input
          type="search"
          placeholder="Buscar por nome, descrição ou tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />

        <LangDropdown languages={languages} value={selectedLang} onChange={setSelectedLang} />

        <Toggle checked={showForks} onChange={setShowForks} label="Mostrar forks" />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-16">Nenhum repositório encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(repo => (
            <RepoCard key={repo.github_id} repo={repo} onReadmeClick={setModalRepo} />
          ))}
        </div>
      )}

      {modalRepo && (
        <ReadmeModal repoName={modalRepo} onClose={() => setModalRepo(null)} />
      )}
    </main>
  )
}
