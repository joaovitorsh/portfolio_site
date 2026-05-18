import profile from '../config/profile'

const GITHUB_API = 'https://api.github.com'
const USERNAME = 'joaovitorsh'

const headers = { 'Accept': 'application/vnd.github+json' }

export async function fetchRepos() {
  let repos = []
  let page = 1

  while (true) {
    const res = await fetch(
      `${GITHUB_API}/users/${USERNAME}/repos?type=public&sort=updated&per_page=100&page=${page}`,
      { headers }
    )
    const data = await res.json()
    if (!data.length) break
    repos = [...repos, ...data]
    page++
  }

  // Mapeia os campos da GitHub API para o formato que os componentes esperam
  return repos.map(r => ({
    github_id: r.id,
    name: r.name,
    full_name: r.full_name,
    description: r.description,
    html_url: r.html_url,
    homepage: r.homepage,
    language: r.language,
    topics: r.topics ?? [],
    stargazers_count: r.stargazers_count,
    forks_count: r.forks_count,
    open_issues_count: r.open_issues_count,
    fork: r.fork,
    archived: r.archived,
    has_readme: true,
    pushed_at: r.pushed_at,
    created_at: r.created_at,
  }))
}

export async function fetchReadme(repoName) {
  const res = await fetch(
    `${GITHUB_API}/repos/${USERNAME}/${repoName}/readme`,
    { headers }
  )
  if (res.status === 404) return null
  const data = await res.json()
  // GitHub retorna o conteúdo em Base64 — TextDecoder garante UTF-8 correto
  const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c => c.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

export async function fetchProfile() {
  return profile
}
