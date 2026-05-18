# Portfolio — João Vítor

Site de portfólio pessoal com integração dinâmica ao GitHub. Exibe automaticamente todos os repositórios públicos com filtro por linguagem, busca e visualização de README.

**Acesse:** https://joaovitorsh.github.io/portfolio_site/

## Stack

- **React 18 + Vite** — SPA moderna com build otimizado
- **Tailwind CSS** — estilização utilitária
- **GitHub API** — busca de repositórios e READMEs em tempo real
- **GitHub Pages** — hospedagem estática gratuita

## Rodando localmente

```bash
cd frontend
npm install
npm run dev
```

Acesse em `http://localhost:3000`.

## Deploy

O deploy é automático via GitHub Actions a cada push na branch `main` que altere arquivos em `frontend/`.

## Estrutura

```
frontend/
├── src/
│   ├── api/github.js        # chamadas à GitHub API
│   ├── config/profile.js    # dados pessoais (edite aqui)
│   ├── components/          # Header, RepoCard, ReadmeModal...
│   └── pages/               # Home, Projects, About
└── public/
    └── avatar.jpg           # foto de perfil
```

## Personalizando

Edite `frontend/src/config/profile.js` com seus dados e faça push — o site atualiza automaticamente.
