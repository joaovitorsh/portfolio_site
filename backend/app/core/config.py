# config.py — lê as variáveis de ambiente do arquivo .env
# Pydantic Settings valida e tipifica automaticamente cada variável
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Usuário público do GitHub cujos repos serão exibidos
    github_username: str = "joaovitorsh"
    # Token do GitHub: eleva o rate limit de 60 para 5000 req/hora
    github_token: str = ""
    # URL de conexão com o PostgreSQL (host "db" é o nome do serviço no Docker Compose)
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/portfolio"
    # Por quantas horas os dados de repos ficam em cache antes de buscar novamente no GitHub
    cache_expiry_hours: int = 1

    class Config:
        env_file = ".env"


# Instância global — importada pelos outros módulos
settings = Settings()
