# database.py — configura a conexão assíncrona com o PostgreSQL
# SQLAlchemy é o ORM mais usado em Python: abstrai SQL em objetos Python
import ssl
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# asyncpg não aceita sslmode= na URL — remove e passa ssl via connect_args
db_url = settings.database_url.replace("?sslmode=require", "").replace("&sslmode=require", "")

connect_args = {}
if "neon.tech" in db_url or "amazonaws.com" in db_url:
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
