# models.py — define a estrutura das tabelas do banco de dados
# Cada classe Python aqui vira uma tabela no PostgreSQL
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class Repository(Base):
    """
    Tabela que armazena os repositórios buscados da API do GitHub.
    Funciona como cache: evita chamar o GitHub a cada request do frontend.
    """
    __tablename__ = "repositories"

    # Chave primária — identificador único interno no nosso banco
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # ID que o próprio GitHub usa para identificar o repositório (único e imutável)
    github_id: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)

    # Informações básicas do repositório
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(511), nullable=False)  # ex: "joaovitorsh/projeto"
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    html_url: Mapped[str] = mapped_column(String(511), nullable=False)   # link no GitHub
    homepage: Mapped[str | None] = mapped_column(String(511), nullable=True)  # site do projeto

    # Metadados técnicos
    language: Mapped[str | None] = mapped_column(String(100), nullable=True)
    topics: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON serializado como string
    stargazers_count: Mapped[int] = mapped_column(Integer, default=0)
    forks_count: Mapped[int] = mapped_column(Integer, default=0)
    open_issues_count: Mapped[int] = mapped_column(Integer, default=0)

    # Flags booleanos do GitHub
    fork: Mapped[bool] = mapped_column(Boolean, default=False)
    archived: Mapped[bool] = mapped_column(Boolean, default=False)
    has_readme: Mapped[bool] = mapped_column(Boolean, default=False)

    # Datas do ciclo de vida do repo no GitHub
    pushed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Quando salvamos esse registro — usado para decidir se o cache expirou
    cached_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
