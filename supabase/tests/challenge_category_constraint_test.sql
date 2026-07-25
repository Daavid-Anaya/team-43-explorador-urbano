begin;

create extension if not exists pgtap with schema extensions;
set search_path to public, extensions;

select plan(1);

select throws_ok(
  $$
    insert into public.challenges (title, description, city, category)
    values (
      'Invalid category test',
      'This row must be rejected by the database constraint.',
      'Buenos Aires',
      'InvalidCategory'
    );
  $$,
  '23514',
  'new row for relation "challenges" violates check constraint "challenges_category_allowed_check"',
  'rejects challenge categories outside the allowed set'
);

select * from finish();

rollback;
