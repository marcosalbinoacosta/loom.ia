# LOOM.IA — Contexto del proyecto para Claude Code

## Stack y deploy
- HTML + CSS + Vanilla JS (sin frameworks, sin build step)
- Deploy en **Vercel** (`vercel.json` en raíz)
- Repo en GitHub, rama principal: `main`

## Archivos principales
```
index.html          → landing page completa (hero, servicios, portfolio, testimonios, contacto)
blog.html           → listado de posts del blog
article.html        → vista de artículo individual
styles.css          → todos los estilos (no hay preprocesador)
main.js             → lógica JS (menú móvil, blog, artículos, formulario, tiempo de lectura)
vercel.json         → config de deploy
data/posts.js       → FUENTE DE VERDAD del blog (array BLOG_POSTS)
data/posts.json     → fallback del blog (mantener sincronizado con posts.js)
```

## Assets
```
assets/img/logo.png          → favicon y logo en navbar (usado en los 3 HTML)
assets/img/logo.svg          → fuente vectorial del logo
assets/img/looma.png         → og:image para redes sociales
assets/img/portfolio-*.png   → capturas de casos de portfolio (crm, ticket, wazuh)
assets/img/DEMOCRATIZAR.webp → imagen del post id=1
assets/img/HYPE.webp         → imagen del post id=2
assets/img/PHISHING.webp     → imagen del post id=3
assets/video/video.mp4       → video de fondo del hero
```

## Blog — cómo funciona
- `data/posts.js` exporta `const BLOG_POSTS = [...]`
- Cada post tiene: `id`, `slug`, `title`, `subtitle`, `description`, `content` (HTML), `image`, `author`, `authorRole`, `authorImage`, `date`, `category`
- Las rutas de imagen son relativas: `assets/img/NOMBRE.webp`
- `main.js` carga los posts dinámicamente en `blog.html` y `article.html`
- Al agregar un post: editar `posts.js` y reflejar el cambio en `posts.json`

## Posts actuales
| id | slug | título | categoría |
|----|------|--------|-----------|
| 1 | `ia-en-pymes` | La Democratización de la Capacidad | Tecnología |
| 2 | `ia-automatizaciones-pymes` | Arquitectura vs. Hype | IA - Automatizaciones |
| 3 | `el-arte-de-hackear-al-humano` | El arte de hackear al humano | Ciberseguridad |

## Clases CSS personalizadas (no borrar)
- `.accordion-impact` — línea de beneficio en cada servicio (fondo verde suave, borde izquierdo)
- `.article-cta-block` — bloque CTA al final de artículos (fondo azul oscuro, centrado)
- `.article-divider` — separador horizontal en artículos

## SEO — keywords objetivo
- "IA aplicada a empresas"
- "ciberseguridad para PYMES"
- "automatización de procesos empresariales"
- "agentes IA para PYMES"
- "ISO 27001 Argentina"
- "soporte IT PYMES Argentina"

## Redes sociales (URLs reales)
- WhatsApp: `https://api.whatsapp.com/send/?phone=543517738029`
- Instagram: `https://www.instagram.com/loomia.ok?igsh=ZWlhemJ2NnN3Mm9j`
- LinkedIn: `https://www.linkedin.com/in/albino-marcos-acosta-667ba8206/`

## Convenciones
- No usar frameworks ni librerías externas salvo las ya incluidas (Font Awesome via CDN)
- Imágenes nuevas del blog: formato WebP, guardar en `assets/img/`
- No duplicar CSS: revisar que la clase no exista antes de agregar
- El formulario de contacto usa Cloudflare Turnstile (validación solo client-side por ahora)
- Evitar `alert()` — usar feedback inline en el formulario
