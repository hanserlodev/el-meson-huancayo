/* Configuración compartida de Tailwind (CDN).
   Paleta cálida "brasa" acorde a pollos y parrillas.
   Se carga en cada página DESPUÉS del CDN y ANTES de usar clases brand/. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: { 50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12',950:'#431407' },
        ink: '#0f172a'
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        display: ['Sora','Inter','sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.06), 0 8px 24px -12px rgba(15,23,42,.18)',
        pop: '0 12px 40px -12px rgba(234,88,12,.45)'
      }
    }
  }
};
