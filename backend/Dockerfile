# Dockerfile do backend FastAPI
# Imagem base oficial do Python — "slim" é menor que a completa (sem ferramentas extras)
FROM python:3.12-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia só o requirements.txt primeiro — aproveitando o cache de camadas do Docker.
# Se o requirements.txt não mudar, o Docker não reinstala as dependências no próximo build.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código
COPY . .

# Expõe a porta que o uvicorn vai escutar (documentação — não publica a porta sozinho)
EXPOSE 8000

# Comando que roda quando o container inicia
# --host 0.0.0.0 faz o servidor aceitar conexões de fora do container (não só localhost)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
