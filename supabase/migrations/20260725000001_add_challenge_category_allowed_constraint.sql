do $$
begin
  if not exists (
    select 1
    from information_schema.check_constraints
    where constraint_schema = 'public'
      and constraint_name = 'challenges_category_allowed_check'
  ) then
    alter table public.challenges
      add constraint challenges_category_allowed_check
      check (category in ('Art', 'History', 'Nature', 'Landmark', 'Hidden Gem'));
  end if;
end;
$$;