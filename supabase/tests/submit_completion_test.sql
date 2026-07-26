begin;

create extension if not exists pgtap with schema extensions;
set search_path to public, extensions;

select plan(9);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'explorer-one@example.test',
    crypt('test-password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'explorer-two@example.test',
    crypt('test-password', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  );

insert into public.profiles (id, display_name)
values
  ('10000000-0000-0000-0000-000000000001', 'Explorer One'),
  ('20000000-0000-0000-0000-000000000002', 'Explorer Two');

insert into public.challenges (
  id, title, description, city, category, latitude, longitude, points,
  difficulty, radius_meters, photo_prompt, estimated_minutes
)
values (
  '30000000-0000-0000-0000-000000000003',
  'Deterministic completion fixture',
  'A deterministic challenge used only by the completion database contract.',
  'Ciudad de México', 'Landmark', 19.432608, -99.133209, 50,
  'easy', 80, 'Photograph the landmark.', 15
);

insert into storage.objects (bucket_id, name)
values
  ('evidence', '10000000-0000-0000-0000-000000000001/valid-radius.jpg'),
  ('evidence', '10000000-0000-0000-0000-000000000001/outside-radius.jpg'),
  ('evidence', '10000000-0000-0000-0000-000000000001/inaccurate-gps.jpg'),
  ('evidence', '10000000-0000-0000-0000-000000000001/forged-reward.jpg'),
  ('evidence', '20000000-0000-0000-0000-000000000002/private.jpg');

insert into public.completions (
  id, user_id, challenge_id, evidence_path, validation_status
)
values (
  '40000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000002/private.jpg',
  'pending'
);

select has_function(
  'public', 'submit_completion', array['jsonb'],
  'exposes submit_completion(jsonb) as the validated database boundary'
);

select set_config('role', 'anon', true);
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
  $$ select public.submit_completion('{"challengeId":"30000000-0000-0000-0000-000000000003","latitude":19.432608,"longitude":-99.133209,"accuracyMeters":20,"evidencePath":"10000000-0000-0000-0000-000000000001/valid-radius.jpg"}'::jsonb) $$,
  '28000', 'Authentication required',
  'rejects an unauthenticated completion'
);

select set_config('role', 'authenticated', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select throws_ok(
  $$ select public.submit_completion('{"challengeId":"30000000-0000-0000-0000-000000000003","latitude":19.442608,"longitude":-99.133209,"accuracyMeters":20,"evidencePath":"10000000-0000-0000-0000-000000000001/outside-radius.jpg"}'::jsonb) $$,
  'P0001', 'Outside challenge radius',
  'rejects a completion outside 80 meters'
);

select throws_ok(
  $$ select public.submit_completion('{"challengeId":"30000000-0000-0000-0000-000000000003","latitude":19.432608,"longitude":-99.133209,"accuracyMeters":101,"evidencePath":"10000000-0000-0000-0000-000000000001/inaccurate-gps.jpg"}'::jsonb) $$,
  'P0001', 'GPS accuracy exceeds 100 meters',
  'rejects GPS accuracy above 100 meters'
);

select throws_ok(
  $$ select public.submit_completion('{"challengeId":"30000000-0000-0000-0000-000000000003","latitude":19.432608,"longitude":-99.133209,"accuracyMeters":20}'::jsonb) $$,
  'P0001', 'Evidence is required and must belong to the authenticated user',
  'rejects missing evidence'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);

select throws_ok(
  $$ select public.submit_completion('{"challengeId":"30000000-0000-0000-0000-000000000003","latitude":19.432608,"longitude":-99.133209,"accuracyMeters":20,"evidencePath":"20000000-0000-0000-0000-000000000002/private.jpg"}'::jsonb) $$,
  '23505', 'Challenge already completed',
  'rejects a duplicate user and challenge completion'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select throws_ok(
  $$ select public.submit_completion('{"challengeId":"30000000-0000-0000-0000-000000000003","latitude":19.432608,"longitude":-99.133209,"accuracyMeters":20,"evidencePath":"10000000-0000-0000-0000-000000000001/forged-reward.jpg","points":999999,"badges":["Urban Legend"]}'::jsonb) $$,
  '22023', 'Reward fields are not accepted',
  'rejects forged client rewards'
);

select results_eq(
  $$ select count(*) from public.completions where user_id = '20000000-0000-0000-0000-000000000002'::uuid $$,
  array[0::bigint],
  'RLS hides another user completion'
);

select throws_ok(
  $$ update public.completions set evidence_path = 'tampered.jpg' where user_id = '20000000-0000-0000-0000-000000000002'::uuid $$,
  '42501', 'permission denied for table completions',
  'denies cross-user completion writes'
);

select * from finish();
rollback;
