# Historial del proyecto

Registro de hitos, decisiones técnicas y problemas resueltos que no quedan del todo reflejados en el historial de git. Entradas en orden cronológico inverso (la más reciente arriba).

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
