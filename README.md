# Tweakeo · Roadmaps

Hub multi-proyecto de hojas de ruta de Tweakeo. Sitio **estático** servido por **Cloudflare Pages**.

🌐 **Producción:** https://roadmap.tweakeo.com  ·  (alias: https://roadmap-7je.pages.dev)

## Estructura del repo

```
/index.html        → PANEL selector (hub). Lista los proyectos y enlaza a cada uno.
/hosteleria/       → Roadmap de Hostelería (dashboard "Super Scatter")
    index.html
    assets/        → app.js, styles.css
    data/projects.json
    concepto.md    → documento vivo del proyecto de hostelería
```

Cada proyecto = una carpeta bajo la raíz. Para añadir uno nuevo (p. ej. `invertir-a-largo-plazo`):

1. Crea la carpeta `/invertir-a-largo-plazo/` con su propio `index.html`.
2. Añade una card en `/index.html` (el panel) que enlace a `/invertir-a-largo-plazo/`.

No hace falta tocar DNS ni Cloudflare para una sección nueva: el subdominio ya cubre todas las rutas.

## Despliegue (Cloudflare Pages)

- Proyecto Cloudflare Pages: **roadmap**, conectado a este repo de GitHub.
- **Autodeploy:** cada push a la rama **`main`** publica en producción automáticamente. Otras ramas generan *preview deploys*.
- Build: ninguno (Framework preset = None, sin build command, output directory = raíz). Es HTML/CSS/JS plano.
- Dominio `roadmap.tweakeo.com`: registro **CNAME en DonDominio** → `roadmap-7je.pages.dev` (el DNS de tweakeo.com se gestiona en DonDominio, no en Hetzner ni Webempresa).

## Notas de colaboración (varios agentes / varios PCs)

Este repo lo tocan varias manos. Para no romper nada:

- **`/hosteleria/`** y futuras carpetas de proyecto = desarrollo del roadmap (su contenido/app). Zona del agente de desarrollo.
- **`/index.html`** (panel) + config de Pages/DNS = hub + hosting.
- ⚠️ **Todo push a `main` se publica solo** en https://roadmap.tweakeo.com . Para trabajo en curso usa una rama (genera un preview deploy) y mergea a `main` cuando esté listo.
- Nada de `force-push`, rename del repo ni reescritura de historial. Commits pequeños y atómicos.

> **Historial:** el 2026-06-21 este repo se renombró `Roadmap-Super-Scatter` → `roadmap`, pasó a **privado** y los archivos originales de la raíz se movieron a `/hosteleria/`. Si tienes un clon antiguo, actualiza el `remote` (nuevo nombre, ya privado) y haz `pull` de la nueva estructura antes de seguir.
