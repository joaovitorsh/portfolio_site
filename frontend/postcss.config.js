// postcss.config.js — pipeline de processamento de CSS
// O Tailwind usa PostCSS para transformar as classes utilitárias em CSS real
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},  // adiciona prefixos de browser automaticamente (-webkit-, etc.)
  },
}
