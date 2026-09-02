-- T-10: función mínima para comprobar que la app llega a la base de datos.
-- PostgREST solo expone funciones del schema `public`, así que envolvemos now().
create or replace function public.hora_servidor()
returns timestamptz
language sql
stable
as $$
  select now();
$$;

grant execute on function public.hora_servidor() to anon, authenticated;
