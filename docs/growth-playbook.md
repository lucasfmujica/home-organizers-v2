# Growth playbook — Home Organizers Long Island

Estado al **28 de octubre de 2026**. Documento vivo: qué está armado en SEO, medición y conversión, cómo lo mantenemos, y qué sigue. Lo técnico del sitio está en el [README](../README.md); el mapa de keywords con datos de Search Console, en [keywords.md](../keywords.md).

> `/docs/*` y `/keywords.md` están bloqueados en Netlify (404): viven en el repo pero no se publican.

---

## 1. Punto de partida (antes del 27/10)

- **Search Console (jun–oct 2026):** 958 impresiones, 7 clics, posición promedio 35,8. Google ya mostraba el sitio para las búsquedas correctas, pero en página 3–6.
- **Sin medición:** GA4 y Clarity tenían el ID vacío y `analytics.js` ni siquiera estaba publicado.
- **Imágenes:** ~50 MB de fotos de iPhone sin optimizar (2–5 MB cada una), varias con la rotación EXIF invertida.
- **Sin Google Business Profile**, teléfono con código 415 (San Francisco), 6 páginas indexables.

## 2. Qué quedó armado

### SEO on-page
| Página | Qué se hizo |
| --- | --- |
| Home | Title y H1 con "professional organizer"; alt texts de la galería corregidos (4 de 6 describían otra foto). |
| Nassau | Title con Hempstead y Massapequa + sección propia (Hempstead estaba en posición 10–12). |
| Decluttering | Sección "Downsizing on Long Island". |
| **Closet organizing** (nueva) | ~125 impresiones sin página; posicionada como *organizing, not carpentry* para no competir con instaladores de closets. |
| **Hamptons** (nueva) | Casas de verano: abrir para la temporada / cerrar para el invierno + casas de todo el año; reseña de Monika (Water Mill). Pendiente: fotos de Water Mill. |
| Todas las internas | Foto en el hero, antes/después real con su pueblo, testimonio en tarjeta, margen lateral en mobile. |

- Fotos en **WebP** (~5,6 MB en total) con rotación corregida; imágenes OG de 1200×630.
- Sitemap actualizado; indexación pedida en Search Console para home, Nassau, decluttering, closets y Hamptons.
- **Regla para páginas por zona:** nada de páginas "programáticas" con el pueblo cambiado (Google las trata como *doorway pages*). Una zona tiene página solo si hay demanda en GSC + trabajos reales + algo propio que contar.

### Contacto: quiz de 3 pasos + modal
Diseñado en Claude Design e implementado en `contact-form.js` / `contact-form.css`.
1. **¿Qué espacio?** — tarjetas (Closet, Pantry & kitchen, Playroom, Garage & basement, Whole home, Moving & downsizing, Digital workspace, Other). Tocar una avanza solo.
2. **¿Dónde y cuándo?** — pueblo/ZIP con **autocompletado de todo NY** (Long Island primero, después NYC, después el resto; datos GeoNames CC BY 4.0, acreditado en privacy) + ASAP / This month / Just exploring.
3. **¿Cómo contactarte?** — nombre, Text / Call / Email (pide teléfono o email según lo elegido), hasta 3 fotos opcionales ("no tidying first!"), mensaje.

- En las **páginas internas** se abre como modal (hoja inferior en mobile) con el espacio preseleccionado: closets → Closet, decluttering → Moving & downsizing, Hamptons → Whole home.
- Llega a **Netlify Forms** → mail a `homeorganizerslongisland@gmail.com` y `lucasfmujica@gmail.com`; las fotos quedan como archivo en el panel de Netlify.
- Sin JavaScript se ve el formulario completo y redirige a `thank-you.html`.
- **Pendiente:** que Carolina apruebe los textos que escribió Claude Design (mensajes de error, el de éxito, "Choose one to continue").

### Medición
| Herramienta | Estado | Dónde mirar |
| --- | --- | --- |
| **GA4** `G-E7NLV3QNG0` | Activo. Consent Mode v2: pings sin cookies hasta que aceptan el banner. | analytics.google.com |
| **Microsoft Clarity** `z4kt20itio` | Activo, solo después de aceptar cookies. Conectado a GA4. | clarity.microsoft.com → Recordings / Heatmaps |
| **Search Console** | Propiedad de dominio. hello@lucasmujica.dev tiene acceso restringido. | search.google.com/search-console |
| **Bing Webmaster Tools** | Importado desde GSC. IndexNow activo. | bing.com/webmasters |

**Eventos** (`analytics.js` → GA4 y, con consentimiento, también Clarity):
`page_view`, `cta_click`, `view_contact_form`, `form_start`, `form_step` (→ `form_step_2` / `form_step_3` en Clarity), `contact_modal_open`, `generate_lead`, `contact_phone`, `contact_email`, `instagram_click`.
Parámetros / tags de Clarity: `need`, `timeline`, `contact_pref`, `photos`, `form_location` (home / modal), `preset`, `cta_location`, `lead=yes`. **Nunca** nombre, email, teléfono ni pueblo.

**Pendientes de medición:**
- GA4: marcar `generate_lead` como **Key event** (Admin → Events) y definir tráfico interno.
- Clarity: cuando deje de mostrar "Almost there", crear el **funnel** `form_start → form_step_2 → form_step_3 → generate_lead` y bloquear las IPs de Lucas y Carolina.
- MCP de Clarity: configurado en Claude Code con alcance local (el token no va al repo). La API solo da los últimos 1–3 días y 10 consultas por día. Regenerar el token si quedó expuesto.

### Claude Design
| Pieza | Link |
| --- | --- |
| Posts de Instagram (carruseles, testimonios, tips, CTA, portadas de destacadas, orden del grid, captions) | https://claude.ai/artifact/Y4KjV3ddqnfnxgPQdm9uDU |
| Contacto de la home (versión implementada) | https://claude.ai/artifact/F27fynPZ5CcrxP3Xee2Si3 |
| Modal de contacto para páginas internas | https://claude.ai/artifact/2F1e1YFTv1SLf3b6c9Mbg6 |

Reglas que le dimos y conviene repetir en cada pedido: mismos colores y tipografías de la web, **no inventar lugares, nombres ni citas** (solo lo que está en la web), marcar como borrador todo texto propio, zonas seguras de Instagram en reels (220 px arriba, 420 px abajo, 140 px a la derecha).

---

## 3. Instagram

**Perfil** (lo hace Carolina):
- Name: se queda "Carolina | Professional Home Organizers Long Island" (es lo que Instagram usa para buscar).
- Bio:
  ```
  Judgment-free home organizing ✦ Long Island, NYC & beyond
  Closets · pantries · playrooms · offices
  Free 20-min consultation ↓
  ```
- Links nativos (sin Linktree), en este orden:
  1. *Book a free consultation* → `https://homeorganizersli.com/?utm_source=instagram&utm_medium=social&utm_campaign=bio_consultation#contact`
  2. *Website* → `https://homeorganizersli.com/?utm_source=instagram&utm_medium=social&utm_campaign=bio_website`
- Botones de contacto: Call, Text, Email. Archivar el post del logo y los collages de 4 fotos; destacadas con íconos + "About" y "Reviews".

**Contenido:**
- Siempre mostrar primero el **después** (o antes/después juntos); una foto por slide.
- Primera línea de cada caption = espacio + pueblo ("Playroom organizing in Islip, Long Island"), firma "— Caro", CTA, 5–8 hashtags locales y de nicho, alt text, ubicación del pueblo.
- Ritmo semanal: lunes carrusel antes/después · miércoles reel (10–15 s) · viernes post de marca (testimonio, tip o CTA).
- Reels: gancho en el primer segundo, antes ≤1,5 s, texto ≥48 px, cierre de 2–3 s, audio en tendencia agregado desde la app, portada aparte con recorte 4:5.

**En cada trabajo** (Carolina): fotos y video vertical del antes y del después **desde los mismos ángulos**, anotar espacio y pueblo, pedir permiso para publicar y pedir la reseña.

**Medición:** visitas con `utm_source=instagram` y `generate_lead` en GA4; alcance a no seguidores y clics al link en Instagram (Meta Business Suite).

---

## 4. Próximos pasos (en orden)

### Semanas 1–2 — mayor impacto
1. **Google Business Profile** (business.google.com, con la cuenta del negocio):
   - Negocio de **área de servicio** (dirección oculta) con hasta 20 zonas: Nassau, Suffolk, los Hamptons, pueblos con demanda (Garden City, Hempstead, Massapequa, Huntington, Islip, Smithtown…) y los boroughs de NYC donde trabaje.
   - Categoría principal: **Professional organizer**. Verificación: suele ser por video.
   - Descripción, servicios, horario, 15–20 fotos, link con UTM `?utm_source=google&utm_medium=organic&utm_campaign=gbp`.
   - Publicaciones semanales (las mismas de Instagram).
   - Cuando esté verificado: sumar el link al footer, a los datos estructurados (`sameAs`) y al mensaje de éxito del formulario para pedir reseñas.
2. **Reseñas en Google:** pedírselas a Danielle, Marlo, Monika y a todos los clientes anteriores; desde ahora, a cada cliente al terminar. Responder todas.
3. **Número local:** Google Voice (gratis, uso personal) con código 516 o 631 que desvía al celular de Carolina. Si se hace, cambiar el 415 en todos lados a la vez: web (links, footer, formulario, JSON-LD), Instagram, GBP y directorios.
4. **Instagram:** aplicar el perfil de arriba y arrancar el calendario.

### Mes 1–2 — contenido y presencia
5. **Páginas nuevas:**
   - Pantry & kitchen (ya en posición 11 sin página).
   - Playroom (trabajos en Islip y Smithtown + reseña de Marlo).
   - Digital organizing — falta saber si Carolina trabaja solo con empresas (Slack, calendarios) o también con personas (fotos, mail, archivos).
6. **Fotos de Water Mill** y otros trabajos en los Hamptons para esa página.
7. **Directorios** con nombre, teléfono y web idénticos: Yelp, Nextdoor, Houzz, Thumbtack, Angi/HomeAdvisor, NAPO.
8. **Alianzas que derivan clientes:** inmobiliarias y home stagers, empresas de mudanza, residencias para mayores (downsizing), administradores de casas de verano en los Hamptons.
9. **Home:** cambiar "2 Counties served" por algo verdadero y más fuerte (5★ reviews o "Long Island, NYC & beyond"); evaluar mover la sección de Slack/espacios digitales a su propia página.
10. **NYC:** una sola página "New York City" recién cuando haya al menos un trabajo ahí para mostrar.

### Calendario de temporadas
| Momento | Tema |
| --- | --- |
| Primavera | Limpieza y orden de primavera |
| Mayo | Abrir casas de verano (Hamptons) |
| Agosto | Vuelta a clases: playrooms y cuartos de chicos |
| Septiembre–octubre | Cerrar casas de verano |
| Noviembre–diciembre | Pantries y espacio para recibir visitas |

### Más adelante (opcional)
Con reseñas y un mes de datos: Google Ads con poco presupuesto para "home organizer near me" en Nassau/Suffolk, o reels de antes/después promocionados en un radio local. No antes: sin reseñas ni medición se pierde plata.

---

## 5. Reportes

Cada 2 semanas (Clarity conviene semanal, porque su API solo guarda 1–3 días):
- **Leads:** cuántos y de dónde (`generate_lead` por fuente: Google orgánico, Instagram, GBP, directo).
- **Embudo:** en qué paso del quiz abandonan (GA4 `form_step` + funnel de Clarity), con 2–3 grabaciones de ejemplo.
- **Google:** impresiones, clics y posición de las búsquedas clave — home organizer Long Island, closet organizer, Hempstead, pantry, Hamptons — y páginas sin indexar.
- **Instagram y GBP:** alcance, clics al link, llamadas y visitas a la web desde el perfil.
- **Qué cambiamos** esas dos semanas y qué hacemos ahora.

---

## 6. Cómo publicar sin romper nada

- Deploy: `netlify deploy --prod --dir .` desde la raíz (no hay build ni conexión con GitHub).
- **Cache busting:** CSS y JS se cachean 1 hora. Al cambiarlos, subir el `?v=` en **todas** las páginas que los cargan (`styles.css`, `script.js`, `contact-form.css/js`, `analytics.js`, `location-autocomplete.js`).
- Después de publicar páginas nuevas o cambios: `scripts/indexnow.sh` (Bing) y "Request indexing" en Search Console (Google).
- **iCloud:** el proyecto vive en Documentos y a veces aparecen copias `archivo 2.ext`. Nunca usar `git add -A`; agregar los archivos por nombre y revisar `git status` antes de commitear.
- Probar formularios sin mandar consultas reales: simular `fetch` o usar un deploy borrador (`netlify deploy --dir .` sin `--prod`). Las notificaciones le llegan a Carolina.
