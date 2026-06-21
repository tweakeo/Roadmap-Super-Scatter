# Roadmap Super Scatter

Dashboard visual de los **proyectos de mejora** de **Chamberí Brothers / Paletos**.
Vista principal tipo *timeline-scatter* por **Fecha Objetivo**, con barra de progreso
por **checkpoints** y detalle por proyecto (objetivo, checkpoints, tareas, recursos y
diario de desarrollo).

→ Concepto completo y decisiones: **[`concepto.md`](concepto.md)** (documento vivo).

## Estructura
```
index.html            · dashboard (una sola página)
assets/styles.css     · estética arcade/scoreboard Paletos
assets/app.js         · render del scatter + detalle + alertas + botón Actualizar
data/projects.json    · datos SEED (se sustituirá por el proxy/Notion)
concepto.md           · documento vivo del proyecto
```

## Desarrollo local
Sirve la carpeta con cualquier servidor estático (necesario por el `fetch` del JSON):
```bash
python3 -m http.server 8080
# abre http://localhost:8080
```

## Publicar en GitHub Pages
Settings → Pages → *Deploy from a branch* → `main` / `root`. La web queda en
`https://tweakeo.github.io/Roadmap-Super-Scatter/`.

## Datos (estado actual y plan)
- **v1 (actual):** lee `data/projects.json` (datos *seed* basados en Notion).
- **Producción:** un **proxy serverless** (Cloudflare Worker) leerá Notion con el token
  guardado del lado servidor y servirá el mismo formato JSON. El botón **"Actualizar"**
  refresca en vivo. El token **nunca** llega al navegador.

Para conectar el Worker, basta cambiar `DATA_URL` en `assets/app.js`.

## Identidad
Rojo `#D72638` · rosa `#F0DADA` · papel/negro/amarillo · display *Anton* (placeholder de
Druk Wide Bold) + cuerpo *Archivo*. Tono Paletos: *"Smash… or nah?"*
