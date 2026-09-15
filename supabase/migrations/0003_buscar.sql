-- T-16: función buscar() — FTS en español sobre `conocimiento`, aislada a
-- propósito (ver specs/plan.md §8): es lo único que cambiará si hay que
-- migrar a pgvector. Sin threshold ni orden por tipo todavía — eso es T-17.
--
-- SECURITY INVOKER (el valor por defecto, no se declara aparte): se ejecuta
-- con los permisos de quien llama, así que cuando la llama el cliente de
-- servidor ligado a la sesión del usuario, las políticas RLS de T-12 se
-- aplican igual que en cualquier consulta normal — el conocimiento personal
-- ajeno no aparece.
--
-- p_usuario_id es una segunda barrera, no la única: si esta función se
-- llamara alguna vez con un cliente que sí puede saltarse RLS (p. ej. el
-- service_role, como hace scripts/cargar-corpus.mts), el filtro explícito
-- de abajo sigue impidiendo que aparezca conocimiento "personal" de otra
-- persona. FR-010 es el requisito más delicado del proyecto y no debe
-- depender de una sola capa de defensa.
--
-- La consulta se construye con las palabras separadas por "|" (equivalente
-- a "o") en vez de "&" ("y"). websearch_to_tsquery las une con "y" por
-- defecto, así que una pregunta como "¿cómo fusiono dos cuentas
-- duplicadas?" exigiría que el documento contuviera literalmente "dos" para
-- devolver algo — una palabra irrelevante para la intención de la pregunta
-- bastaba para no encontrar nada. Con "o" alcanza con que coincida alguna
-- palabra, y ts_rank ya premia a los documentos que coinciden en más.

create or replace function public.buscar(
  consulta text,
  p_herramienta text,
  p_usuario_id uuid default null
)
returns table (
  id uuid,
  tipo tipo_conocimiento,
  herramienta text,
  titulo text,
  contenido text,
  rank real
)
language sql
stable
as $$
  with consulta_tsquery as (
    select to_tsquery('spanish', string_agg(lexeme, ' | ')) as tsquery
    from unnest(tsvector_to_array(to_tsvector('spanish', consulta))) as lexeme
  )
  select
    conocimiento.id,
    conocimiento.tipo,
    conocimiento.herramienta,
    conocimiento.titulo,
    conocimiento.contenido,
    ts_rank(conocimiento.busqueda, consulta_tsquery.tsquery) as rank
  from conocimiento, consulta_tsquery
  where conocimiento.herramienta = p_herramienta
    and conocimiento.estado = 'activo'
    and consulta_tsquery.tsquery is not null
    and conocimiento.busqueda @@ consulta_tsquery.tsquery
    and (
      conocimiento.tipo <> 'personal'
      or conocimiento.autor_id = p_usuario_id
    )
  order by rank desc
  limit 5;
$$;

grant execute on function public.buscar(text, text, uuid) to authenticated;
