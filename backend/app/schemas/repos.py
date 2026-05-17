# schemas/repos.py — define os formatos de dados que a API aceita e retorna
# Pydantic valida automaticamente: se o dado não bater com o tipo, retorna erro 422
from datetime import datetime
from pydantic import BaseModel


class RepositoryOut(BaseModel):
    """
    Formato que o endpoint GET /api/repos retorna ao frontend.
    Só expõe os campos que o frontend realmente precisa (não todo o modelo do banco).
    """
    github_id: int
    name: str
    full_name: str
    description: str | None
    html_url: str
    homepage: str | None
    language: str | None
    topics: list[str]           # no banco fica como JSON string, aqui vira lista Python
    stargazers_count: int
    forks_count: int
    open_issues_count: int
    fork: bool
    archived: bool
    has_readme: bool
    pushed_at: datetime | None
    created_at: datetime | None

    # orm_mode=True (ou from_attributes no Pydantic v2) permite criar o schema
    # diretamente de um objeto SQLAlchemy sem precisar converter manualmente
    model_config = {"from_attributes": True}


class ReadmeOut(BaseModel):
    """Formato retornado pelo endpoint GET /api/repos/{name}/readme."""
    repo_name: str
    content: str | None         # None se o repositório não tiver README
