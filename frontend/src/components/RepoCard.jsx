// RepoCard.jsx — card que exibe as informações de um repositório na listagem
import LanguageBadge from './LanguageBadge'

// Props: dados do repositório e função de callback quando o usuário clica em "Ver README"
export default function RepoCard({ repo, onReadmeClick }) {
  const formattedDate = repo.pushed_at
    ? new Date(repo.pushed_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null

  return (
    <article className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/8 hover:shadow-lg hover:shadow-blue-900/30">
      {/* Cabeçalho: nome + badges */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white text-base leading-tight">
          {repo.name}
        </h3>
        <div className="flex gap-1.5 flex-shrink-0">
          {repo.fork && (
            <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">fork</span>
          )}
          {repo.archived && (
            <span className="text-xs bg-yellow-900 text-yellow-400 px-2 py-0.5 rounded-full">arquivado</span>
          )}
        </div>
      </div>

      {/* Descrição */}
      {repo.description && (
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
          {repo.description}
        </p>
      )}

      {/* Topics (tags) */}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 5).map(topic => (
            <span
              key={topic}
              className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-full border border-blue-800/50"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Rodapé: linguagem, estrelas, forks, data */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-700">
        <div className="flex items-center gap-4">
          <LanguageBadge language={repo.language} />

          {repo.stargazers_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              {/* Ícone de estrela SVG inline */}
              <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {repo.stargazers_count}
            </span>
          )}
        </div>

        {formattedDate && (
          <span className="text-xs text-gray-500">atualizado {formattedDate}</span>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-sm py-1.5 rounded-md border border-white/20 text-gray-300 hover:border-white/40 hover:text-white transition-colors"
        >
          Ver no GitHub
        </a>

        {/* Botão de README aparece para todos os repos — o modal trata o caso sem README */}
        <button
          onClick={() => onReadmeClick(repo.name)}
          className="flex-1 text-sm py-1.5 rounded-md bg-blue-700 hover:bg-blue-600 text-white transition-colors"
        >
          Ver README
        </button>
      </div>
    </article>
  )
}
