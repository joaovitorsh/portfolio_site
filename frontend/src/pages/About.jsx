import { useEffect, useState } from 'react'
import { fetchProfile } from '../api/github'

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">{title}</h2>
      {children}
    </section>
  )
}

export default function About() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile().then(setProfile).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400" />
      </div>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src="/avatar.jpg"
          alt="João Vítor"
          className="w-28 h-28 rounded-full object-cover object-top border-4 border-gray-700 shadow-lg flex-shrink-0"
        />
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-4xl font-bold text-white">{profile?.full_name}</h1>
          <p className="text-blue-400 text-lg font-medium">{profile?.role}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-gray-500 pt-1">
            {profile?.location && <span>📍 {profile.location}</span>}
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="hover:text-gray-300 transition-colors">
                ✉️ {profile.email}
              </a>
            )}
            {profile?.phone && <span>📞 {profile.phone}</span>}
          </div>
        </div>
      </div>

      {/* Resumo */}
      <Section title="Resumo Profissional">
        <p className="text-gray-300 leading-relaxed">{profile?.bio}</p>
      </Section>

      {/* Experiência */}
      {profile?.experience?.length > 0 && (
        <Section title="Experiência Profissional">
          <div className="space-y-6">
            {profile.experience.map((job, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-white">{job.role}</p>
                    <p className="text-blue-400 text-sm">{job.company}</p>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded-full whitespace-nowrap">
                    {job.period}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {job.highlights.map((item, j) => (
                    <li key={j} className="flex gap-2 text-sm text-gray-400">
                      <span className="text-blue-500 mt-0.5 flex-shrink-0">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Stack técnico */}
      <Section title="Stack Técnico">
        <div className="flex flex-wrap gap-2">
          {profile?.skills?.map(skill => (
            <span
              key={skill}
              className="bg-white/5 backdrop-blur-sm border border-white/10 text-gray-200 px-3 py-1.5 rounded-lg text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </Section>

      {/* Links */}
      <Section title="Contato">
        <div className="flex flex-wrap gap-3">
          {profile?.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              GitHub ↗
            </a>
          )}
          {profile?.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              LinkedIn ↗
            </a>
          )}
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {profile.email}
            </a>
          )}
        </div>
      </Section>

    </main>
  )
}
