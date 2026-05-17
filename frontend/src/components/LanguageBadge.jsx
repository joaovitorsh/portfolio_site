// LanguageBadge.jsx — bolinha colorida que indica a linguagem principal do repo
// Mesmas cores que o GitHub usa para cada linguagem
const LANGUAGE_COLORS = {
  Python:     '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Java:       '#b07219',
  Go:         '#00ADD8',
  Rust:       '#dea584',
  C:          '#555555',
  'C++':      '#f34b7d',
  'C#':       '#178600',
  Ruby:       '#701516',
  PHP:        '#4F5D95',
  Swift:      '#F05138',
  Kotlin:     '#A97BFF',
  Shell:      '#89e051',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Dockerfile: '#384d54',
}

export default function LanguageBadge({ language }) {
  if (!language) return null

  const color = LANGUAGE_COLORS[language] || '#8b949e'

  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      {/* A bolinha colorida — estilo inline porque a cor é dinâmica */}
      <span
        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {language}
    </span>
  )
}
