# routes/repos.py — endpoints relacionados a repositórios
import json
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.github import fetch_all_public_repos, fetch_readme
from app.db.database import get_db
from app.db.models import Repository
from app.schemas.repos import ReadmeOut, RepositoryOut

# APIRouter agrupa rotas relacionadas — é registrado no main.py com um prefixo
router = APIRouter(prefix="/repos", tags=["repos"])


def _is_cache_valid(cached_at: datetime) -> bool:
    """Verifica se o cache ainda é válido comparando com o tempo configurado."""
    expiry = timedelta(hours=settings.cache_expiry_hours)
    # cached_at vem do banco sem timezone; adicionamos UTC para comparar corretamente
    cached_utc = cached_at.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) - cached_utc < expiry


def _model_to_schema(repo: Repository) -> RepositoryOut:
    """Converte um objeto SQLAlchemy para o schema Pydantic, desserializando o JSON de topics."""
    topics = json.loads(repo.topics) if repo.topics else []
    data = {
        col.name: getattr(repo, col.name)
        for col in repo.__table__.columns
        if col.name not in ("id", "topics", "cached_at")
    }
    data["topics"] = topics
    return RepositoryOut(**data)


@router.get("/", response_model=list[RepositoryOut])
async def list_repos(db: AsyncSession = Depends(get_db)):
    """
    Retorna todos os repositórios públicos.

    Estratégia de cache:
    1. Verifica se há repos no banco com cache válido.
    2. Se sim → retorna do banco (rápido, sem chamar o GitHub).
    3. Se não → busca na API do GitHub, salva/atualiza o banco, retorna.
    """
    # Busca qualquer repositório no banco para checar o cache
    result = await db.execute(select(Repository).limit(1))
    sample = result.scalar_one_or_none()

    if sample and _is_cache_valid(sample.cached_at):
        # Cache válido: retorna todos do banco
        result = await db.execute(
            select(Repository).order_by(Repository.pushed_at.desc().nullslast())
        )
        repos = result.scalars().all()
        return [_model_to_schema(r) for r in repos]

    # Cache expirado ou banco vazio: busca no GitHub
    github_repos = await fetch_all_public_repos()
    now = datetime.utcnow()

    # Apaga os dados antigos e insere tudo de novo (upsert simples)
    await db.execute(delete(Repository))

    for repo_data in github_repos:
        def _parse_dt(val: str | None) -> datetime | None:
            if not val:
                return None
            return datetime.fromisoformat(val.replace("Z", "")).replace(tzinfo=None)

        repo = Repository(
            github_id=repo_data["id"],
            name=repo_data["name"],
            full_name=repo_data["full_name"],
            description=repo_data.get("description"),
            html_url=repo_data["html_url"],
            homepage=repo_data.get("homepage"),
            language=repo_data.get("language"),
            topics=json.dumps(repo_data.get("topics", [])),
            stargazers_count=repo_data.get("stargazers_count", 0),
            forks_count=repo_data.get("forks_count", 0),
            open_issues_count=repo_data.get("open_issues_count", 0),
            fork=repo_data.get("fork", False),
            archived=repo_data.get("archived", False),
            has_readme=False,       # será atualizado quando o README for requisitado
            pushed_at=_parse_dt(repo_data.get("pushed_at")),
            created_at=_parse_dt(repo_data.get("created_at")),
            updated_at=_parse_dt(repo_data.get("updated_at")),
            cached_at=now,
        )
        db.add(repo)

    await db.commit()

    result = await db.execute(
        select(Repository).order_by(Repository.pushed_at.desc().nullslast())
    )
    repos = result.scalars().all()
    return [_model_to_schema(r) for r in repos]


@router.get("/{repo_name}/readme", response_model=ReadmeOut)
async def get_readme(repo_name: str, db: AsyncSession = Depends(get_db)):
    """
    Retorna o conteúdo Markdown do README de um repositório específico.
    O frontend renderiza esse Markdown como HTML usando react-markdown.
    """
    content = await fetch_readme(repo_name)

    # Atualiza has_readme no banco para saber que o repo tem README
    if content is not None:
        result = await db.execute(
            select(Repository).where(Repository.name == repo_name)
        )
        repo = result.scalar_one_or_none()
        if repo:
            repo.has_readme = True
            await db.commit()

    return ReadmeOut(repo_name=repo_name, content=content)
