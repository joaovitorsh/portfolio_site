// ReadmeModal.jsx — modal (popup) que exibe o README renderizado em Markdown
// Aparece quando o usuário clica em "Ver README" em um RepoCard
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { fetchReadme } from '../api/github'

export default function ReadmeModal({ repoName, onClose }) {
  // useState cria variável reativa — quando muda, o componente re-renderiza
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // useEffect roda código com efeito colateral (chamada HTTP, timers, etc.)
  // O array [repoName] é a lista de dependências — roda novamente se repoName mudar
  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchReadme(repoName)
      .then(setContent)
      .catch(() => setError('Erro ao carregar o README.'))
      .finally(() => setLoading(false))
  }, [repoName])

  // Fecha o modal ao pressionar Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)  // cleanup ao desmontar
  }, [onClose])

  return (
    // Overlay escuro que cobre a tela inteira
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto"
      onClick={onClose}  // clique fora do modal fecha
    >
      {/* Conteúdo do modal — stopPropagation evita que o clique interno feche */}
      <div
        className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-white font-semibold text-lg">
            README — <span className="text-blue-400">{repoName}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Corpo do modal */}
        <div className="px-6 py-5">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-center py-8">{error}</p>
          )}

          {!loading && !error && !content && (
            <p className="text-gray-400 text-center py-8">Este repositório não possui README.</p>
          )}

          {/* ReactMarkdown transforma a string Markdown em JSX/HTML */}
          {content && (
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
