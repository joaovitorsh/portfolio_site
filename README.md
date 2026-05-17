# Portfolio Site

Site de portfólio pessoal com integração dinâmica ao GitHub. Exibe automaticamente todos os repositórios públicos, permite filtrar por linguagem, buscar por nome/descrição e visualizar o README de cada projeto em um modal.

## Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Backend | FastAPI + Python | Alto desempenho, async nativo, docs automáticas |
| Banco de dados | PostgreSQL | Cache dos repos para não depender do rate limit do GitHub |
| ORM | SQLAlchemy (async) | Abstração de SQL com suporte a operações assíncronas |
| HTTP client | httpx | Equivalente ao `requests`, mas com suporte a `async/await` |
| Frontend | React 18 + Vite | SPA moderna, build rápido |
| Estilo | Tailwind CSS | Utilitário CSS sem sair do JSX |
| Markdown | react-markdown | Renderiza o README dos repos como HTML |
| Orquestração | Docker Compose | Um comando sobe tudo: banco, backend e frontend |

---

## Arquitetura

```
browser
  │
  ├── GET /           → frontend (Nginx, porta 3000)
  ├── GET /projects   → frontend (React Router, SPA)
  ├── GET /about      → frontend (React Router, SPA)
  │
  └── GET /api/*      → Nginx faz proxy → backend (FastAPI, porta 8001)
                                              │
                                              ├── /api/profile/
                                              ├── /api/repos/         → PostgreSQL (cache)
                                              └── /api/repos/{name}/readme → GitHub API
```

### Fluxo de cache dos repositórios

```
Frontend pede GET /api/repos/
        │
        ▼
Backend verifica se há dados no banco com menos de 1 hora
        │
   ┌────┴────────────────────────────────┐
   │ Cache válido                        │ Cache expirado ou banco vazio
   ▼                                     ▼
Retorna do banco                  Busca na GitHub API
(rápido, sem req. externa)        → Salva no PostgreSQL
                                  → Retorna os dados
```

Isso garante:
- Velocidade (dados do banco são muito mais rápidos que uma API externa)
- Resiliência (se o GitHub estiver fora, os dados em cache ainda funcionam)
- Rate limit seguro (com token: 5000 req/hora; sem token: 60 req/hora)

---

## Estrutura de arquivos

```
portfolio_site/
│
├── docker-compose.yml          # orquestra os 3 serviços
├── .env                        # variáveis de ambiente (NÃO commitar)
├── .env.example                # template do .env para novos devs
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # ponto de entrada: FastAPI, CORS, registro de rotas
│       │
│       ├── core/
│       │   ├── config.py       # lê o .env via Pydantic Settings
│       │   └── github.py       # cliente httpx para a GitHub API
│       │
│       ├── db/
│       │   ├── database.py     # engine async, sessão, função create_tables
│       │   └── models.py       # modelo SQLAlchemy da tabela `repositories`
│       │
│       ├── schemas/
│       │   └── repos.py        # schemas Pydantic (formato de entrada/saída da API)
│       │
│       └── api/routes/
│           ├── repos.py        # GET /api/repos/ e GET /api/repos/{name}/readme
│           └── profile.py      # GET /api/profile/ — edite aqui seus dados pessoais
│
└── frontend/
    ├── Dockerfile              # build multi-stage: Node (build) → Nginx (serve)
    ├── nginx.conf              # proxy /api → backend, fallback para index.html
    ├── package.json
    ├── vite.config.js          # proxy de dev e configuração do bundler
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx            # monta o React no <div id="root">
        ├── App.jsx             # rotas (React Router) e layout global
        ├── index.css           # @tailwind + estilos para markdown
        │
        ├── api/
        │   └── github.js       # funções axios que chamam o backend
        │
        ├── components/
        │   ├── Header.jsx      # barra de navegação
        │   ├── RepoCard.jsx    # card de repositório na listagem
        │   ├── ReadmeModal.jsx # popup com README renderizado em Markdown
        │   └── LanguageBadge.jsx # bolinha colorida por linguagem
        │
        └── pages/
            ├── Home.jsx        # hero + 6 repos mais recentes
            ├── Projects.jsx    # listagem completa com filtros e busca
            └── About.jsx       # apresentação pessoal detalhada
```

---

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- Conta no GitHub com um [Personal Access Token](#gerando-o-token-do-github)

---

## Instalação e uso

### 1. Clone o repositório

```bash
git clone https://github.com/joaovitorsh/portfolio_site.git
cd portfolio_site
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env`:

```env
GITHUB_USERNAME=seu_username_aqui
GITHUB_TOKEN=ghp_seu_token_aqui
CACHE_EXPIRY_HOURS=1
```

### 3. Suba tudo com Docker Compose

```bash
docker compose up -d --build
```

O primeiro `--build` compila as imagens. Nos próximos usos, pode omitir se não mudou código:

```bash
docker compose up -d
```

### 4. Acesse o site

| Endereço | O que é |
|---|---|
| http://localhost:3000 | Site (frontend React) |
| http://localhost:8001/docs | Documentação interativa da API (Swagger UI) |
| http://localhost:8001/api/repos/ | Endpoint de repos (JSON bruto) |
| http://localhost:8001/api/profile/ | Endpoint de perfil (JSON bruto) |

---

## Modos de execução

O projeto tem dois modos: **produção** (padrão) e **desenvolvimento** (com hot reload).

### Modo produção

Serve o frontend como arquivos estáticos compilados via Nginx. Para ver uma mudança no frontend é necessário reconstruir a imagem.

```bash
# Subir
docker compose up -d

# Acesse: http://localhost:3000

# Ver uma mudança no frontend
docker compose up -d --build frontend
```

### Modo desenvolvimento (hot reload)

Usa o servidor Vite diretamente. Qualquer arquivo salvo em `frontend/src/` atualiza o browser automaticamente, sem nenhum comando.

```bash
# Subir no modo dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Acesse: http://localhost:3001  ← porta diferente no modo dev
```

Edite qualquer arquivo em `frontend/src/` e o browser atualiza na hora.

Para voltar para produção:

```bash
docker compose down
docker compose up -d
```

> **Como funciona o hot reload:** o arquivo `docker-compose.dev.yml` sobrescreve o serviço `frontend` — em vez de Nginx servindo o build estático, sobe o servidor Vite com o código local montado como volume dentro do container. O Vite observa as mudanças nos arquivos e envia uma atualização ao browser via WebSocket.

---

## Comandos úteis

```bash
# Ver status dos containers
docker compose ps

# Acompanhar logs em tempo real
docker compose logs -f

# Logs só do backend
docker compose logs -f backend

# Parar todos os containers
docker compose down

# Parar e apagar os dados do banco (volume)
docker compose down -v

# Reconstruir após mudanças no código
docker compose up -d --build
```

---

## Personalizando seus dados

Edite o arquivo `backend/app/api/routes/profile.py`:

```python
PROFILE_DATA = {
    "name": "Seu Nome",
    "role": "Backend Developer",
    "bio": "Sua bio aqui...",
    "location": "Cidade, País",
    "github": "https://github.com/seu_username",
    "linkedin": "https://linkedin.com/in/seu_perfil",
    "email": "seu@email.com",
    "skills": ["Python", "FastAPI", "PostgreSQL", ...],
    "experience_years": 3,
}
```

Após editar, reconstrua o backend:

```bash
docker compose up -d --build backend
```

---

## Gerando o Token do GitHub

O token é gratuito e aumenta o rate limit de **60 → 5000 requisições/hora**.

1. Acesse: **GitHub → foto de perfil → Settings**
2. No menu lateral: **Developer settings**
3. **Personal access tokens → Tokens (classic)**
4. **Generate new token (classic)**
5. Dê um nome (ex: `portfolio-site`), escolha a expiração
6. **Não precisa marcar nenhum escopo** para repos públicos
7. Clique em **Generate token** e copie o valor

> O token aparece só uma vez — guarde-o no `.env` imediatamente.

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `GITHUB_USERNAME` | `joaovitorsh` | Username do GitHub cujos repos serão exibidos |
| `GITHUB_TOKEN` | _(vazio)_ | Personal Access Token para aumentar o rate limit |
| `CACHE_EXPIRY_HOURS` | `1` | Quantas horas os dados ficam em cache antes de atualizar |

---

## Endpoints da API

### `GET /api/repos/`
Retorna todos os repositórios públicos. Usa cache do banco por padrão.

```json
[
  {
    "github_id": 123456,
    "name": "meu-projeto",
    "description": "Descrição do projeto",
    "html_url": "https://github.com/usuario/meu-projeto",
    "language": "Python",
    "topics": ["fastapi", "python", "api"],
    "stargazers_count": 5,
    "has_readme": true,
    "pushed_at": "2024-06-01T12:00:00"
  }
]
```

### `GET /api/repos/{repo_name}/readme`
Retorna o conteúdo Markdown do README de um repositório.

```json
{
  "repo_name": "meu-projeto",
  "content": "# Meu Projeto\n\nDescrição em Markdown..."
}
```

### `GET /api/profile/`
Retorna as informações pessoais configuradas em `profile.py`.

### `GET /health`
Verifica se a API está no ar. Retorna `{"status": "ok"}`.

---

## Features do frontend

- **Home** — hero com apresentação, skills e preview dos 6 repos mais recentes
- **Projetos** — listagem completa com:
  - Busca por nome, descrição ou tag
  - Filtro por linguagem de programação
  - Toggle para mostrar/ocultar forks
  - Modal com README renderizado em Markdown (tabelas, código, imagens)
- **Sobre** — página de apresentação com stack, bio e links de contato

---

## Deploy (produção gratuita)

```
Frontend  → GitHub Pages  (grátis, automático via GitHub Actions)
Backend   → Render.com    (grátis, dorme após 15 min sem visitas)
Banco     → Neon          (PostgreSQL serverless, grátis para sempre)
```

### 1. Banco de dados — Neon

1. Crie conta em **neon.tech**
2. Crie um projeto e copie a **Connection String**
3. Troque `postgresql://` por `postgresql+asyncpg://` na string copiada

### 2. Backend — Render.com

1. Crie conta em **render.com** (não precisa de cartão)
2. **New → Web Service → Connect a repository**
3. Selecione o repositório e aponte o **Root Directory** para `backend/`
4. O Render detecta o `render.yaml` automaticamente
5. Em **Environment Variables**, adicione:
   - `GITHUB_TOKEN` → seu token do GitHub
   - `DATABASE_URL` → string do Neon com `postgresql+asyncpg://`
6. Clique em **Deploy** — a URL será algo como `https://portfolio-api.onrender.com`

### 3. Frontend — GitHub Pages

1. No repositório GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Nome: `VITE_API_URL` → Valor: URL do Render (ex: `https://portfolio-api.onrender.com`)
2. Ative o Pages: **Settings → Pages → Source: Deploy from branch → gh-pages**
3. Faça push na branch `main` — o GitHub Actions faz o build e publica automaticamente

O site ficará em: `https://joaovitorsh.github.io/portfolio_site`

> O backend no Render "dorme" após 15 min sem requisições. A primeira visita pode demorar ~30 segundos para acordar, mas depois responde normalmente.

---

## Segurança

- O arquivo `.env` está no `.gitignore` — **nunca** suba seu token para o Git
- O CORS do backend já está configurado para aceitar apenas `joaovitorsh.github.io`
- O token do GitHub configurado tem acesso somente leitura a repos públicos
