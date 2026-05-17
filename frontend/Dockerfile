# Dockerfile do frontend React — build multi-stage
# Stage 1: compila o React em arquivos HTML/CSS/JS estáticos
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package.json e instala dependências antes do código (aproveita cache)
COPY package.json package-lock.json* ./
RUN npm install

# Copia o restante e faz o build de produção
COPY . .
RUN npm run build
# O resultado fica em /app/dist — arquivos estáticos otimizados

# Stage 2: serve os arquivos estáticos com Nginx (muito mais leve que Node em produção)
FROM nginx:alpine

# Copia os arquivos compilados do stage anterior para o diretório do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do Nginx: todas as rotas desconhecidas vão para index.html
# Isso é necessário para que o React Router funcione ao acessar /projects diretamente
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
