# Roadmap Super Scatter — `concepto.md` (documento vivo)

**Dashboard visual de proyectos de mejora · Chamberí Brothers / Paletos**
Última actualización: 2026-06-21 · Mantenido por León (con Claude)

> Este `concepto.md` es la **única fuente de verdad** del concepto. Sustituye a los
> documentos previos de Google Drive (`00 · CONTEXTO`, `01 · DECISIONES`,
> `CONCEPTO …`). Cualquier cambio de concepto que acordemos se refleja aquí.

## Changelog
- **2026-06-21 · v3** — El documento vivo pasa a ser este `concepto.md` dentro del
  repo. Web alojada en el propio repo (GitHub Pages). Primera versión inicial del
  dashboard (timeline-scatter + detalle). Diario de desarrollo: **más reciente
  arriba**. Tareas asociadas: **vista embebida** (a probar). Completados: atenuados.
- **2026-06-21 · v2** — Nuevo esqueleto de página; Diario de desarrollo; hosting en repo.
- **2026-06-21 · v1** — Contexto inicial y primeras decisiones.

---

## 1. Visión
Dashboard web muy visual y gráfico que lee Notion (workspace Chamberí) y permite
trackear los proyectos de mejora en marcha, con barra de progreso.

- **Página principal** — titulares de cada proyecto ordenados por **Fecha Objetivo**
  (vista *Super Scatter*: cada proyecto posicionado en una línea temporal), cada uno
  con su barra de % de avance.
- **Detalle por proyecto** — al hacer clic: objetivo + resultados esperados,
  checkpoints, y tareas hechas/por hacer del tramo actual, recursos y diario.

Repo: <https://github.com/tweakeo/Roadmap-Super-Scatter>

## 2. Alcance
Exclusivamente las **Tareas de Proyectos**. Quedan **fuera** (no se tocan ni se
muestran): tareas recurrentes, `TAREAS EMERGENTES` y `REGISTRO DE TAREAS EJECUTADAS`.

## 3. Modelo de datos en Notion
Acceso: MCP/token **notion-chamberi** · `Notion-Version: 2025-09-03`.

| Base de datos | `data_source_id` | Propiedades clave |
|---|---|---|
| **PROYECTOS & MEJORA CONTINUA** | `356e4f0f-ad19-8097-afd8-000bec128d2a` | PROYECTO (title), TAREAS ASOCIADAS (relation), RESPONSABLE, ÚLTIMA ACTUALIZACIÓN, FECHA OBJETIVO, **+ Estado (a crear)** |
| **TAREAS DE PROYECTOS** | `361e4f0f-ad19-81fb-b6c6-000bc5e713ea` | TAREA ESPECÍFICA (title), PROYECTO (relation), Checkbox (hecho), RESPONSABLE, DEADLINE TAREA |

## 4. Reglas del modelo
### 4.1 Emparejamiento 100% (tareas ⇄ proyectos)
1. **Ninguna** tarea de proyecto puede existir sin proyecto asociado. *(Hoy: 31 de 87 sin asignar → corregir.)*
2. Un proyecto **puede** no tener tareas (p. ej. mientras está *En espera*).

### 4.2 Propiedad `Estado` (select)
- **En espera** — puede no tener tareas.
- **En desarrollo** — **debe** tener tareas asociadas (regla dura).
- **Completado** — se muestra **atenuado** en el dashboard.

> No se inventan datos: si un proyecto *En desarrollo* no tiene tareas, el dashboard
> lo marca con **alerta roja**.

### 4.3 Orden y visibilidad en la home
- Gráfico principal ordenado por **Fecha Objetivo**.
- Sin fecha objetivo → **no** en el gráfico principal; sí en el apartado **"Proyectos sin fecha"**.
- *Completado* → atenuado.

## 5. Checkpoints y progreso
Los checkpoints **no** son un `select`: viven en el **cuerpo** de la página como una
lista de *to-do* (`□`/`☑`) — editable, reordenable e insertable (para meter un hito
intermedio nuevo cuando el camino se alarga). El dashboard los lee vía la API de
bloques de Notion.

```
OBJETIVO (meta final)
  └─ CHECKPOINTS (hitos macro, definidos al inicio)
       └─ TAREAS (elemento más pequeño, definidas tramo a tramo "just-in-time")
```

**Flujo de un proyecto:** (1) crear → (2) definir Objetivo final → (3) checkpoints
iniciales → (4) tareas hasta el próximo checkpoint → (5) al alcanzar el hito, definir
las tareas del siguiente tramo.

> **Barra principal = checkpoints alcanzados (`☑`) / total de checkpoints.**
> El % de tareas engaña porque se definen tramo a tramo; las tareas son el **detalle**
> del tramo en curso, no la barra principal.

## 6. Esqueleto estándar de página de proyecto (Toggle Headings)
1. 🎯 **Objetivo del proyecto y resultados esperados** *(obligatorio)*
2. 🧭 **Checkpoints** *(lista to-do `□`/`☑`)*
3. ✅ **Tareas asociadas** *(vista embebida de TAREAS DE PROYECTOS filtrada; a probar)*
4. 🧰 **Recursos a utilizar**
   - (a) **Stack tecnológico** — plataformas, servicios, lenguajes, etc.
   - (b) **Stack de skills** — habilidades (skills de IA) a usar y el porqué de cada una.

Fuera de esa jerarquía, un desplegable independiente:

5. 🗓️ **Diario de desarrollo** — toggles anidados cuyo título es la **fecha** del día;
   dentro, *bullets* de lo avanzado. **Orden: más reciente arriba.**

## 7. Alertas que muestra el dashboard
El dashboard **no** corrige datos: los refleja y avisa.

| Nivel | Condición |
|---|---|
| 🔴 ROJO | Proyecto *En desarrollo* **sin tareas** asociadas |
| 🔴 ROJO | Tarea de proyecto **sin proyecto** asignado |
| 🟡 AVISO | Proyecto **sin objetivo** definido en el cuerpo |
| 🟡 AVISO | Proyecto *En desarrollo* **sin checkpoints** |
| ⚪ INFO | Proyecto **sin fecha objetivo** → "Proyectos sin fecha" |
| 🌫️ ATENUADO | Proyecto *Completado* |

## 8. Arquitectura y hosting
- La **web vive en este repo** `tweakeo/Roadmap-Super-Scatter` → **GitHub Pages** (front estático).
- Datos: en v1, un `data/projects.json` *(seed)* para que el front funcione solo.
  En producción, un **proxy serverless** (Cloudflare Worker) que guarda el token de
  Notion del lado servidor y devuelve el JSON. **El token nunca llega al navegador.**
- El dashboard pide datos al cargar **+ botón "Actualizar"** para refrescar en vivo.
- GitHub Actions queda como respaldo opcional (cacheo/programado).

## 9. Estructura del repo
```
.
├── index.html         · dashboard (una sola página)
├── assets/
│   ├── styles.css     · estética arcade/scoreboard Paletos
│   └── app.js         · render del timeline-scatter + detalle + alertas
├── data/
│   └── projects.json  · datos SEED (se sustituirá por el Worker/Notion)
├── concepto.md        · este documento vivo
└── README.md
```

## 10. Identidad visual (Paletos)
- Rojo primario `#D72638`, rosa pálido `#F0DADA`, más tokens black/paper/yellow.
- Display tipo **Druk Wide Bold** (placeholder libre: *Anton*); cuerpo **Archivo**.
- Tono gamberro ("Smash… or nah?", "Madriz est. 2025").

## 11. Próximos pasos (en Notion, cuando se dé luz verde)
- [ ] Crear propiedad `Estado` (select) en PROYECTOS & MEJORA CONTINUA.
- [ ] Re-vincular las 31 tareas sin proyecto (o archivarlas).
- [ ] Aplicar el esqueleto (§6) a los 11 proyectos.
- [ ] Por proyecto: redactar Objetivo + resultados y la lista de Checkpoints (`□`/`☑`).
- [ ] Revisar Fecha Objetivo de cada proyecto (define el orden de la home).
- [ ] Construir el Worker (proxy Notion) y conectar el botón "Actualizar".

## 12. Decisiones pendientes / a afinar
- Vista embebida de tareas: validar y, si no convence, pasar a rollup (conteo/%).
- Dominio del front sobre GitHub Pages (¿`roadmap.…`?).
- Tratamiento fino de *Completado* en la home (sección propia vs. solo atenuado).
