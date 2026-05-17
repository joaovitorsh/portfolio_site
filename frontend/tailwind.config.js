// tailwind.config.js — diz ao Tailwind quais arquivos escanear para gerar só o CSS usado
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // Adicione customizações de cores, fontes, etc. aqui se quiser
    },
  },
  plugins: [],
}
