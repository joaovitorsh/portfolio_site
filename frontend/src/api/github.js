// api/github.js — funções que chamam o backend FastAPI
// axios é uma biblioteca HTTP: mais ergonômica que o fetch nativo do browser
import axios from 'axios'

// Em desenvolvimento o Vite faz proxy de /api → backend:8000
// Em produção, defina VITE_API_URL apontando para o domínio real
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
})

/**
 * Busca a lista completa de repositórios públicos.
 * O backend já lida com o cache — podemos chamar sem preocupação.
 */
export async function fetchRepos() {
  const { data } = await api.get('/api/repos/')
  return data
}

/**
 * Busca o conteúdo Markdown do README de um repositório específico.
 * @param {string} repoName - nome do repositório (ex: "meu-projeto")
 */
export async function fetchReadme(repoName) {
  const { data } = await api.get(`/api/repos/${repoName}/readme`)
  return data.content  // string Markdown ou null
}

/**
 * Busca as informações do perfil do desenvolvedor.
 */
export async function fetchProfile() {
  const { data } = await api.get('/api/profile/')
  return data
}
