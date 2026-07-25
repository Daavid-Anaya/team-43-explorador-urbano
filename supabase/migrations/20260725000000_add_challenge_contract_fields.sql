-- Agrega las columnas del contrato MVP que faltaban en public.challenges:
-- radiusMeters, photoPrompt, estimatedMinutes, y limita category a los valores aceptados.

alter table public.challenges
  add column if not exists radius_meters integer not null default 80 check (radius_meters > 0),
  add column if not exists photo_prompt text check (photo_prompt is null or char_length(photo_prompt) between 5 and 300),
  add column if not exists estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0);

do $$
begin
  if not exists (
    select 1 from information_schema.check_constraints
    where constraint_schema = 'public'
      and constraint_name = 'challenges_category_allowed_check'
  ) then
    alter table public.challenges
      add constraint challenges_category_allowed_check
      check (category in ('Art', 'History', 'Nature', 'Landmark', 'Hidden Gem'));
  end if;
end;
$$;
