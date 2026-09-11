# Historial del proyecto

Registro de hitos, decisiones técnicas y problemas resueltos que no quedan del todo reflejados en el historial de git. Entradas en orden cronológico inverso (la más reciente arriba).

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
