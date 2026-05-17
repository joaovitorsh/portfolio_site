# database.py — configura a conexão assíncrona com o PostgreSQL
# SQLAlchemy é o ORM mais usado em Python: abstrai SQL em objetos Python
import ssl
from urllib.parse import urlparse, urlunparse
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# asyncpg não aceita parâmetros como sslmode/channel_binding na URL
# Remove todos os query params e passa SSL via connect_args quando necessário
parsed = urlparse(settings.database_url)
db_url = urlunparse(parsed._replace(query=""))

connect_args = {}
if parsed.hostname and ("neon.tech" in parsed.hostname or "amazonaws.com" in parsed.hostname):
    connect_args["ssl"] = ssl.create_default_context()

engine = create_async_engine(db_url, connect_args=connect_args, pool_pre_ping=True)

# "Session" é a unidade de trabalho com o banco — cada request HTTP recebe uma sessão
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    """Classe base que todos os modelos (tabelas) devem herdar."""
    pass


async def get_db():
    """
    Dependency do FastAPI — injeta uma sessão de banco em cada endpoint.
    O 'yield' faz o FastAPI fechar a sessão automaticamente ao fim do request.
    """
    async with AsyncSessionLocal() as session:
        yield session


async def create_tables():
    """Cria todas as tabelas no banco se ainda não existirem."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
