// pages/Home.jsx — página inicial do portfólio
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProfile, fetchRepos } from '../api/github'
import LanguageBadge from '../components/LanguageBadge'

export default function Home() {
  const [profile, setProfile] = useState(null)
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Promise.all faz as duas chamadas em paralelo (mais rápido que sequencial)
    Promise.all([fetchProfile(), fetchRepos()])
      .then(([profileData, reposData]) => {
        setProfile(profileData)
        // Na home mostramos apenas os 6 repos mais recentes
        setRepos(reposData.slice(0, 6))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400" />
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-16 space-y-20">
      {/* Seção Hero */}
      <section className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">

        {/* Texto */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h1 className="text-5xl font-bold text-white">{profile?.name}</h1>
            <p className="text-xl text-blue-400 font-medium mt-1">{profile?.role}</p>
          </div>

          <p className="text-gray-400 leading-relaxed max-w-lg">
            {profile?.short_bio}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {profile?.skills?.map(skill => (
              <span
                key={skill}
                className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex justify-center md:justify-start gap-4 pt-2">
            {profile?.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white px-6 py-2.5 rounded-lg font-medium border border-white/15 hover:border-white/30 transition-all duration-200 backdrop-blur-sm"
              >
                GitHub
              </a>
            )}
            <Link
              to="/projects"
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all duration-200"
            >
              Ver Projetos
            </Link>
          </div>
        </div>

        {/* Foto */}
        <div className="flex-shrink-0">
          <img
            src={`${import.meta.env.BASE_URL}avatar.jpg`}
            alt="João Vítor"
            className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover object-top border-4 border-gray-700 shadow-xl"
          />
        </div>

      </section>

      {/* Preview de repositórios recentes */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Projetos Recentes</h2>
          <Link to="/projects" className="text-blue-400 hover:text-blue-300 text-sm">
            Ver todos →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map(repo => (
            <div
              key={repo.github_id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-900/30"
            >
              <h3 className="font-semibold text-white mb-1">{repo.name}</h3>
              {/* min-h garante altura mínima para a descrição, alinhando os rodapés */}
              <p className="text-gray-400 text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
                {repo.description ?? ''}
              </p>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                <LanguageBadge language={repo.language} />
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
