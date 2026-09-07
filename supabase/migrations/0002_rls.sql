-- T-12: políticas RLS sobre `conocimiento` (FR-010, FR-011) — ver specs/plan.md §4.
--
-- | tipo        | quién lee                    | quién escribe |
-- |-------------|-------------------------------|---------------|
-- | oficial     | todos los autenticados        | solo admin    |
-- | compartido  | todos los autenticados        | su autor      |
-- | personal    | solo autor_id = auth.uid()    | su autor      |
--
-- "admin" se determina por app_metadata.rol = 'admin'. app_metadata solo lo puede
-- escribir el service_role (no el propio usuario), así que es seguro usarlo en una
-- política. La asignación del rol admin es tarea de la Fase 5; aquí solo se deja
-- la política lista para cuando exista.

alter table conocimiento enable row level security;

create policy "oficial: lectura para autenticados"
  on conocimiento for select
  to authenticated
  using (tipo = 'oficial');

create policy "oficial: escritura solo admin"
  on conocimiento for all
  to authenticated
  using (tipo = 'oficial' and (auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  with check (tipo = 'oficial' and (auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

create policy "compartido: lectura para autenticados"
  on conocimiento for select
  to authenticated
  using (tipo = 'compartido');

create policy "compartido: escritura por su autor"
  on conocimiento for all
  to authenticated
  using (tipo = 'compartido' and autor_id = auth.uid())
  with check (tipo = 'compartido' and autor_id = auth.uid());

create policy "personal: lectura y escritura solo por su autor"
  on conocimiento for all
  to authenticated
  using (tipo = 'personal' and autor_id = auth.uid())
  with check (tipo = 'personal' and autor_id = auth.uid());

-- `conversacion` y `mensaje` no están en plan.md §4, pero guardan el historial de
-- chat de cada usuario: sin RLS, cualquiera con la clave anon podría leer las
-- conversaciones de todos. Se aísla por el mismo criterio (auth.uid()).

alter table conversacion enable row level security;

create policy "conversacion: solo su dueño"
  on conversacion for all
  to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

alter table mensaje enable row level security;

create policy "mensaje: solo de conversaciones propias"
  on mensaje for all
  to authenticated
  using (
    exists (
      select 1 from conversacion
      where conversacion.id = mensaje.conversacion_id
        and conversacion.usuario_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from conversacion
      where conversacion.id = mensaje.conversacion_id
        and conversacion.usuario_id = auth.uid()
    )
  );
