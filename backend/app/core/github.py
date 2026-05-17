# github.py — cliente assíncrono que faz todas as chamadas à API do GitHub
# httpx é como o requests, mas suporta async/await (necessário no FastAPI)
import base64
import httpx
from app.core.config import settings

# URL base da API REST do GitHub v3
GITHUB_API_BASE = "https://api.github.com"


def _get_headers() -> dict:
    """Monta os headers que vão em toda requisição à API do GitHub."""
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    # Se tiver token configurado, adiciona autenticação (aumenta o rate limit)
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"
    return headers


async def fetch_all_public_repos() -> list[dict]:
    """
    Busca todos os repositórios públicos do usuário no GitHub.
    A API retorna no máximo 100 por página, então percorremos todas as páginas.
    """
    repos = []
    page = 1

    # httpx.AsyncClient é como uma sessão HTTP — reutiliza conexão TCP (mais eficiente)
    async with httpx.AsyncClient(timeout=30.0) as client:
        while True:
            response = await client.get(
                f"{GITHUB_API_BASE}/users/{settings.github_username}/repos",
                headers=_get_headers(),
                params={
                    "type": "public",
                    "sort": "updated",   # mais recentes primeiro
                    "per_page": 100,
                    "page": page,
                },
            )
            response.raise_for_status()
            page_data = response.json()

            # Quando a página retorna vazia, chegamos ao fim
            if not page_data:
                break

            repos.extend(page_data)
            page += 1

    return repos


async def fetch_readme(repo_name: str) -> str | None:
    """
    Busca o conteúdo do README.md de um repositório específico.
    Retorna o texto em Markdown, ou None se não existir.
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"{GITHUB_API_BASE}/repos/{settings.github_username}/{repo_name}/readme",
            headers=_get_headers(),
        )
        # 404 significa que o repo não tem README — não é erro, apenas retorna None
        if response.status_code == 404:
            return None

        response.raise_for_status()
        data = response.json()

        # O GitHub retorna o conteúdo do README em Base64
        # Precisamos decodificar para obter o texto Markdown original
        content_b64 = data.get("content", "")
        content_bytes = base64.b64decode(content_b64)
        return content_bytes.decode("utf-8")
