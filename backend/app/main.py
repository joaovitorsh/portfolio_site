# main.py — ponto de entrada da aplicação FastAPI
# É aqui que tudo se junta: configurações, rotas e ciclo de vida
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import repos, profile
from app.db.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Código que roda na inicialização e no encerramento da aplicação.
    'yield' separa o que acontece antes (startup) do que acontece depois (shutdown).
    """
    # Startup: garante que as tabelas existem no banco antes de receber requests
    await create_tables()
    yield
    # Shutdown: nada a limpar por enquanto


app = FastAPI(
    title="Portfolio API",
    description="Backend do portfólio — integra com a GitHub API e serve dados ao frontend React",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — permite que o frontend (rodando em porta diferente) acesse a API
# Em produção, substitua "*" pelo domínio real do seu site
import os

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    # Domínio do GitHub Pages — substitua pelo seu usuário
    "https://joaovitorsh.github.io",
    # Se usar domínio customizado no futuro, adicione aqui
]

# Permite origem extra via variável de ambiente (útil para domínio customizado)
extra_origin = os.getenv("ALLOWED_ORIGIN")
if extra_origin:
    ALLOWED_ORIGINS.append(extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra os grupos de rotas com o prefixo /api
app.include_router(repos.router, prefix="/api")
app.include_router(profile.router, prefix="/api")


@app.get("/health")
async def health_check():
    """Endpoint simples para verificar se a API está no ar (usado pelo Docker)."""
    return {"status": "ok"}
