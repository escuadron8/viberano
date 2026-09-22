# Historial del proyecto

Registro de hitos, decisiones técnicas y problemas resueltos que no quedan del todo reflejados en el historial de git. Entradas en orden cronológico inverso (la más reciente arriba).

---

## 2026-09-23 — El chat deja de fingir: pantalla conectada a `/api/consulta` (T-21)

**Contexto**: el motor de respuesta llevaba cerrado desde T-20, pero la pantalla de chat seguía siendo la de T-08 — dos guiones de datos falsos, uno genérico con los cuatro casos de fuente y la secuencia guionizada de n8n que se grabó para el vídeo de pitch. T-21 es lo que une las dos mitades del producto.

**Decisión — fuera los dos guiones, incluido el de n8n**. La alternativa era conservar la secuencia de n8n como demo (el vídeo la usa), pero eso deja código de mentira dentro de la pantalla de verdad y, sobre todo, enseña una conversación que el producto no puede tener. **Consecuencia que hay que tener presente: n8n y Claude no tienen corpus cargado, así que responden siempre con la abstención de FR-008.** Es el comportamiento correcto — es literalmente el caso que la demo debe enseñar — pero la demo de verdad es con Salesforce.

**Decisión — conversación nueva en cada entrada al chat, creada con la primera pregunta**. T-21 decía "crear/reutilizar" la fila de `conversacion`; se optó por no reutilizar, porque la persistencia existe para auditar SC-002/SC-003, no para rehidratar la pantalla: reutilizar una conversación cuyos mensajes no se pintan deja un historial invisible y confuso. Y se crea con la primera pregunta, no al montar la pantalla, para no dejar una fila vacía cada vez que alguien abre el chat y se va sin preguntar. Cuando T-22 traiga el reenvío de los últimos turnos, tendrá una conversación con la que trabajar.

**Tres cosas que el chat real destapó y el chat falso escondía**:

1. **El nombre de la herramienta no casaba con el corpus.** La UI enseña "Salesforce" y el corpus guarda `salesforce`; `buscar()` compara con un `=` exacto, así que *todas* las preguntas del chat se habrían ido por el camino de abstención con el corpus lleno delante. Se normaliza en el servidor (`normalizarHerramienta()` en `lib/buscar.ts`, junto a la consulta que depende de ello), no en la pantalla: el cliente manda lo que quiera y el servidor decide cómo se llama una herramienta.
2. **La herramienta elegida no sobrevivía a una recarga.** Vivía solo en el estado de React de `HerramientaProvider`; con datos falsos eso solo cambiaba un nombre en el saludo, pero ahora es lo que se manda a `/api/consulta` — recargar `/chat` habría dejado la pantalla mandando 400. Se guarda en `sessionStorage`, leído con `useSyncExternalStore` (no con un `useEffect` que llame a `setState`: eso es un error de lint en esta versión, `react-hooks/set-state-in-effect`, y además provoca renders en cascada). El hook sirve dos instantáneas, `null` en el servidor y el valor real tras la hidratación, que es justo lo que hace falta para no romper la hidratación.
3. **Un fallo de Gemini no es una abstención.** Si `generarRespuesta()` revienta (sin API key, proveedor caído), responder "no dispongo de información fiable" sería mentir sobre el corpus: los fragmentos estaban ahí. Ahora eso devuelve **502** con un mensaje de reintento, y la pantalla lo pinta como error, no como respuesta del tutor.

**Persistencia (movida aquí desde T-20)**: `/api/consulta` acepta `conversacion_id` y escribe los dos mensajes del turno en `mensaje`, con las `fuentes` citadas. Si el insert falla, se registra en el log del servidor y **la respuesta se devuelve igualmente**: perder una fila de auditoría es molesto, tragarse una respuesta ya generada delante del usuario lo es mucho más. El dueño de la conversación sale siempre de la sesión (`user.id`), nunca del cuerpo de la petición, y las políticas RLS de T-12 rechazan en la base de datos cualquier `conversacion_id` ajeno que llegue en el cuerpo.

**Tests**: 19 en total (antes 7). Los nuevos cubren la persistencia del turno, que las abstenciones también se persisten, la normalización del nombre de la herramienta, que un fallo de guardado no se come la respuesta, el 502 del proveedor y el alta de conversación (`tests/api-conversacion.test.ts`). Como en T-20, se comprobó que detectan el fallo de verdad: quitando la normalización y la persistencia de `route.ts` fallan exactamente esos 4 tests y los otros 15 siguen pasando.

**Sin tests de componente todavía**: `vitest.config.mts` anticipaba que T-21 traería jsdom y React Testing Library. No se han añadido — la prueba que pide T-21 es el recorrido en un móvil real, y montar el entorno de componentes para afirmar que un chip se pinta habría sido más andamiaje que valor. Queda para cuando haya un componente con lógica propia que merezca test.

**T-21 cerrada el mismo día**: Alex probó el chat en su móvil contra el despliegue de Vercel y pasaron las dos mitades de la prueba — (a) una pregunta cubierta por el corpus responde con su chip de origen visible, (b) una pregunta fuera del corpus da la abstención. Los caminos sin sesión se habían comprobado antes contra `next dev` (401 en ambos endpoints, 400 sin `herramienta`, y `/chat` redirigiendo a `/login`). **Con esto el hito de la Fase 3b está cumplido: el chat real funciona de punta a punta.**

**Configuración que hizo falta en Vercel**: `GEMINI_API_KEY` no estaba en las variables de entorno de producción, solo en el `.env.local` de cada uno. Se añadió en Settings → Environment Variables (sin prefijo `NEXT_PUBLIC_`, que la habría expuesto en el bundle del navegador) y hubo que **volver a desplegar**: las variables solo entran en despliegues nuevos. Si alguna vez la app responde "El tutor no está disponible ahora mismo" en producción, el log de Vercel distingue el caso: `Falta GEMINI_API_KEY` es configuración, un 503 de Gemini es el free tier saturado (pasó durante esta sesión al correr `npm run probar-ia`).

**Falso negativo detectado al preparar las preguntas de prueba**: "¿Cómo restablezco mi contraseña?" se abstiene **aunque existe `corpus/salesforce/restablecer-contrasena.md`** — la pregunta solo aporta 2 lexemas significativos y `MINIMO_COINCIDENCIAS` exige 3. La variante "¿Cómo cambio la contraseña si la he olvidado?" sí pasa (rank 0.0739). Es otro caso para la recalibración pendiente de T-17 con el corpus real: bajar `MINIMO_COINCIDENCIAS` a 2 es el candidato obvio, comprobando que no reabre los falsos positivos que motivaron subirlo.

**Archivos tocados**: `app/(shell)/chat/page.tsx`, `app/api/consulta/route.ts`, `app/api/conversacion/route.ts` (nuevo), `components/HerramientaProvider.tsx`, `lib/buscar.ts`, `tests/api-consulta.test.ts`, `tests/api-conversacion.test.ts` (nuevo), `README.md`, `specs/tasks.md`, `specs/plan.md`.

---

## 2026-09-22 — Primera suite de tests: Vitest y el test que sostiene SC-002 (T-20)

**Contexto**: el endpoint `/api/consulta` con verificación de citas (FR-007) estaba construido y verificado a mano desde el commit `d0111da`, pero T-20 seguía en 🟡 porque su prueba — "inyectar una respuesta del modelo con un id de fuente inventado y comprobar que el endpoint la rechaza" — no existía como test automatizado. El repo no tenía suite de tests de ningún tipo.

**Por qué no se puede probar esto contra el modelo real**: no hay forma fiable de conseguir que Gemini invente un id a propósito. Lo que hay que probar no es el comportamiento del modelo (eso ya lo mira `npm run probar-ia`, y es no determinista por naturaleza), sino la defensa determinista del servidor: qué hace el endpoint cuando le llega una respuesta con una cita falsa. Por eso el test sustituye `generarRespuesta()` por un doble que devuelve exactamente la respuesta que queremos.

**Decisión — Vitest**: es el camino que documenta el propio Next 16.3.1 (`node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`). La alternativa era `node:test` con `--experimental-strip-types`, siguiendo el estilo de los scripts `.mts` y sin añadir dependencias, pero necesitaba dos flags experimentales (`--experimental-test-module-mocks`) y un hook de resolución propio para el alias `@/` que usa `route.ts` — más andamiaje y más frágil. Vitest resuelve el alias y mockea módulos sin nada de eso, y sirve igual para los tests de componentes que pedirá T-21.

**Dos detalles del montaje**:
- El doc de Next todavía manda instalar `vite-tsconfig-paths`; esta versión de Vite avisa de que ya resuelve los `paths` de tsconfig nativamente. Se usa `resolve.tsconfigPaths: true` y el plugin se desinstaló.
- `npm install vitest` chocaba con `@types/node@^20` (Vitest 5 pide `^22 || >=24`). Se subió a `@types/node@^22`, que además es lo correcto: el proyecto se ejecuta en Node 22.15.

**Qué cubre `tests/api-consulta.test.ts`** (7 tests, sin red ni base de datos):
- Cita inventada → se descarta la respuesta y se cae a la abstención (**la prueba de SC-002**).
- Cita parcialmente inventada (una válida + una falsa) → se descarta la respuesta **entera**, no se devuelve "la parte buena".
- Caso de control: con todas las citas válidas, la respuesta se devuelve tal cual. Sin este, un endpoint que se abstuviera siempre pasaría los dos tests de arriba.
- Sin fragmentos por encima del umbral → abstención **sin llamar al modelo** (FR-008, la prueba de T-18, ahora automatizada).
- Entrada inválida (400) y sin sesión (401), comprobando además que no se toca el corpus ni la IA.

**Verificado que el test detecta el fallo de verdad**: desactivando la comprobación de citas en `route.ts` (`if (false && !citasValidas)`), fallan exactamente los 2 tests de citas y los otros 5 siguen pasando. El endpoint se restauró después.

**Nota**: el mensaje de abstención está copiado literalmente en el test en vez de importado de `route.ts`, porque un route handler de App Router solo puede exportar los métodos HTTP y sus opciones de configuración — exportar la constante rompería el build.

**Archivos tocados**: `tests/api-consulta.test.ts` (nuevo), `vitest.config.mts` (nuevo), `package.json`, `README.md`, `specs/tasks.md`.

---

## 2026-09-22 — Modelo `gemini-2.5-flash` descontinuado + build roto por extensiones `.ts` en imports (T-19)

**Contexto**: Alex retomó T-19 en paralelo, sin saber que ya estaba cerrado en `main`. Al comparar ambas versiones (esencialmente el mismo diseño, `lib/gemini/` vs `lib/ia.ts`) se descartó la suya a favor de la ya integrada con `lib/buscar.ts`, y se usó el hallazgo de su sesión para arreglar dos problemas reales en la de `main`:

1. **`gemini-2.5-flash` ya no está disponible.** La API devuelve 404 y recomienda `gemini-3.6-flash`. Cambiado en `lib/ia.ts` y en las menciones de `plan.md`/`tasks.md`. Verificado en vivo: cita bien la fuente oficial cuando hay fragmentos relevantes, y se abstiene (`suficiente: false`, `fuentes: []`) cuando no los hay.
2. **`npm run build` fallaba de verdad** (no solo `tsc --noEmit` suelto): `next build` incluye `scripts/*.mts` en el type-check porque `tsconfig.json` los lista en `include`, y esos scripts importan módulos con extensión `.ts` explícita (`"../lib/ia.ts"`) — necesaria para que `node --experimental-strip-types` los resuelva en tiempo de ejecución, pero rechazada por `moduleResolution: "bundler"` sin más. Solución: `allowImportingTsExtensions: true` en `tsconfig.json` (compatible con `noEmit: true`, que ya estaba puesto). Esto no cambia nada en tiempo de ejecución, solo relaja el type-check.
3. `npm run probar-ia` (y el resto de scripts `.mts`) fallaban en Node 22.15 con `ERR_UNKNOWN_FILE_EXTENSION` porque el type-stripping de `.mts` todavía necesita el flag `--experimental-strip-types` en esa versión de Node (se vuelve innecesario en versiones más nuevas, pero el flag no hace daño si ya no hace falta). Añadido a los cuatro scripts en `package.json`.

**Por qué importa el punto 2**: sin este fix, cualquier push a `main` habría roto el build de Vercel — no se había detectado porque nadie había corrido `npm run build` completo después de añadir los scripts `.mts` al repo.

**Archivos tocados**: `lib/ia.ts`, `tsconfig.json`, `package.json`, `specs/plan.md`, `specs/tasks.md`, `README.md`.

---

## 2026-09-22 — Cambio de proveedor de IA: Gemini en vez de Claude (T-19)

**Contexto**: `plan.md` y `tasks.md` (escritos antes de T-14) daban por hecho la API de Claude para T-19, bloqueada por "API key de Anthropic con facturación activa". Al retomar el desarrollo esa key seguía sin existir — el equipo no tiene presupuesto para una API de pago ahora mismo.

**Decisión**: usar Google Gemini (`gemini-2.5-flash` vía `@google/genai`) en su free tier, que no pide tarjeta. Soporta salida estructurada nativa (`responseSchema`), que es exactamente lo que necesita el contrato `{suficiente, respuesta, fuentes[], multiples_fuentes}` de `plan.md` §3 — el cambio de proveedor no afecta al contrato ni al resto del pipeline, solo a `lib/ia.ts`.

**Diferencias frente al diseño original pensado para Claude**:
- Sin `temperature`/`top_p`/`top_k` especiales ni `output_config.effort` — no aplican a Gemini.
- Sin prompt caching explícito (`cache_control`): el caching de contexto de Gemini es de pago; con un system prompt corto el ahorro no compensa la complejidad en el MVP.
- Reglas de abstención (FR-008) y citación (FR-007) viven en `systemInstruction` en vez de en el bloque `system` de Anthropic — mismo rol, sintaxis distinta.

**Alcance de T-20 recortado**: la persistencia de `mensaje` (pregunta, respuesta, `fuentes`) se movió a T-21 porque `/api/consulta` todavía no recibe `conversacion_id` — esa pantalla (T-21) es la que decide cómo se crea y reutiliza una `conversacion`. Implementar la persistencia antes habría significado inventar ese ciclo de vida sin que la UI lo hubiera definido.

**Pendiente**: falta pegar una `GEMINI_API_KEY` real en `.env.local` (gratis en https://aistudio.google.com/apikey) para poder correr `npm run probar-ia` y cerrar T-19 de verdad.

**Archivos tocados**: `lib/ia.ts` (nuevo), `scripts/probar-ia.mts` (nuevo), `app/api/consulta/route.ts`, `.env.example`, `.env.local`, `package.json`, `specs/plan.md`, `specs/tasks.md`.

---

## 2026-09-17 — Umbral de relevancia: el FTS no separa perfectamente con un corpus pequeño y genérico (T-17)

**Contexto**: al fijar el umbral que decide si hay "suficiente" conocimiento para responder (FR-008), se probó contra las 10 preguntas conocidas de T-16 más 5 preguntas deliberadamente fuera del corpus. El corpus usado era el de relleno de 15 documentos genéricos de Salesforce (no el corpus real de T-15).

**Problema**: con `websearch_to_tsquery` (AND implícito entre palabras) muchas preguntas fuera de tema no encontraban nada — pero también fallaban preguntas legítimas si traían alguna palabra incidental ("dos", "para") ausente del documento correcto. Cambiar a una consulta con OR entre palabras (`buscar()`, ver comentarios en `supabase/migrations/0003_buscar.sql`) arregló eso, pero abrió el problema contrario: con un corpus tan pequeño y de vocabulario administrativo genérico ("organización", "configuración", "campo"), una sola palabra compartida bastaba para que apareciera un resultado sin relación real con la pregunta.

**Mitigación aplicada**: `buscar()` ahora también devuelve `coincidencias` (cuántas palabras distintas de la pregunta aparecen en el documento) y exige al menos 2 como filtro estructural. `lib/buscar.ts` añade `recuperar()`, que exige además `rank >= 0.042` y `coincidencias >= 3` antes de considerar un resultado suficiente.

**Resultado de la prueba**: 10/10 preguntas cubiertas pasan el umbral; 4/5 preguntas fuera de corpus quedan correctamente por debajo. La quinta ("¿Cómo activo las recomendaciones de Einstein para oportunidades?") empata *exactamente* en rank y en coincidencias con una pregunta cubierta legítima ("¿Cómo actualizo muchos registros al mismo tiempo?", que coincide por "registro"/"oportunidad" con el doc de conversión de leads). Es un empate numérico real, no un umbral mal puesto — ninguna combinación de estas dos señales los separa.

**Decisión**: no se activa `pgvector` (plan B de `plan.md` §8) por este único caso. El corpus de prueba es contenido genérico generado por Claude, no el corpus real de T-15; con 20-30 documentos reales y más específicos de una sola herramienta, la superposición de vocabulario genérico debería pesar menos. **Recalibrar `UMBRAL_RELEVANCIA` y `MINIMO_COINCIDENCIAS` en `lib/buscar.ts` en cuanto se cargue el corpus real**, repitiendo `npm run probar-umbral` con preguntas propias de ese corpus.

**Archivos tocados**: `supabase/migrations/0003_buscar.sql`, `lib/buscar.ts`, `scripts/probar-umbral.mts`.

---

## 2026-09-11 — Enlace mágico: fix del prefetch de escáneres de correo (T-13)

**Problema**: los escáneres de seguridad de los clientes de correo (Gmail, Outlook Safe Links, etc.) hacen una petición GET de comprobación al enlace del magic link antes de que el usuario haga clic. Con la plantilla por defecto de Supabase, esa petición llega al endpoint `/auth/v1/verify` del propio Supabase, que consume ahí mismo el token de un solo uso — así que cuando el usuario real hacía clic, el enlace ya estaba gastado.

**Solución validada** (spike en la rama `spike/magic-link-confirmation`):

1. La plantilla de Magic Link en Supabase (Authentication → Email Templates) ya no usa `{{ .ConfirmationURL }}` (que apunta al endpoint de verificación de Supabase). Ahora enlaza directo a la propia app: `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=magiclink`.
2. `app/auth/confirm/page.tsx` recibe `token_hash`, `type`, `next` y `email` como query params y se los pasa a `components/ConfirmarAcceso.tsx`.
3. `ConfirmarAcceso` ya no consume el token al montarse (antes lo hacía en un `useEffect`, que es justo lo que un prefetch automático dispara). Ahora solo lee los parámetros de la URL al cargar; la llamada real a Supabase (`setSession` o `verifyOtp`, según el token venga en el fragmento `#access_token` o como `token_hash`) queda detrás del clic explícito del usuario en el botón "Confirmar e iniciar sesión".
4. Si el token ya estaba invalidado, se reutiliza el flujo de reenvío que ya existía de una iteración anterior de T-13 (commit `69b4e25`).

**Configuración de Supabase que acompaña el cambio de código**:
- Site URL → dominio de producción (`https://tutor-rose-six.vercel.app`), ya no `localhost`.
- Redirect URLs → añadido `http://localhost:3000/**` junto al ya existente `https://tutor-rose-six.vercel.app/**`, para poder probar el flujo completo en local.

**Archivos tocados**: `components/ConfirmarAcceso.tsx`.

**Validado manualmente**: enlace generado desde `/login` en local, abierto desde un cliente de correo real, confirmado en devtools que no hay petición a `*.supabase.co/auth/v1/verify` hasta pulsar el botón, y que el clic manual completa el login y redirige a `/software`.
