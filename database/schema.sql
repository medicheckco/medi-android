-- MediTrack Neon PostgreSQL schema
-- Run this in the Neon SQL editor or with psql against your Neon DATABASE_URL.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin', 'user');
  end if;

  if not exists (select 1 from pg_type where typname = 'batch_status') then
    create type batch_status as enum ('active', 'expired', 'low-stock');
  end if;
end $$;

create table if not exists users (
  id text primary key,
  email text unique not null,
  display_name text,
  photo_url text,
  role user_role not null default 'user',
  gemini_scan_count integer not null default 0 check (gemini_scan_count >= 0),
  gs1_scan_count integer not null default 0 check (gs1_scan_count >= 0),
  total_input_tokens integer not null default 0 check (total_input_tokens >= 0),
  total_output_tokens integer not null default 0 check (total_output_tokens >= 0),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_at_ms bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  name text not null,
  barcode text,
  item_code text,
  brand_name text,
  supplier_name text,
  category text,
  gtin text,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_at_ms bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  medication_id uuid not null references medications(id) on delete cascade,
  batch_number text not null,
  expiry_date date not null,
  expiry_date_ms bigint not null,
  quantity integer not null check (quantity >= 0),
  status batch_status not null default 'active',
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_at_ms bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at_ms bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create unique index if not exists medications_user_barcode_unique
  on medications(user_id, barcode)
  where barcode is not null and barcode <> '' and is_deleted = false;

create unique index if not exists medications_user_gtin_unique
  on medications(user_id, gtin)
  where gtin is not null and gtin <> '' and is_deleted = false;

create unique index if not exists medications_user_item_code_unique
  on medications(user_id, item_code)
  where item_code is not null and item_code <> '' and is_deleted = false;

create index if not exists medications_user_name_idx
  on medications(user_id, lower(name))
  where is_deleted = false;

create index if not exists medications_user_updated_idx
  on medications(user_id, updated_at_ms);

create unique index if not exists batches_user_medication_batch_unique
  on batches(user_id, medication_id, lower(batch_number))
  where is_deleted = false;

create index if not exists batches_user_expiry_idx
  on batches(user_id, expiry_date)
  where is_deleted = false;

create index if not exists batches_user_updated_idx
  on batches(user_id, updated_at_ms);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  new.updated_at_ms = (extract(epoch from new.updated_at) * 1000)::bigint;
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at
before update on users
for each row
execute function set_updated_at();

drop trigger if exists medications_set_updated_at on medications;
create trigger medications_set_updated_at
before update on medications
for each row
execute function set_updated_at();

drop trigger if exists batches_set_updated_at on batches;
create trigger batches_set_updated_at
before update on batches
for each row
execute function set_updated_at();

create or replace view admin_user_stats as
select
  u.id as uid,
  u.email,
  u.display_name,
  u.role,
  u.gemini_scan_count,
  u.gs1_scan_count,
  u.last_login_at as last_login,
  count(distinct m.id) filter (where m.is_deleted = false) as medication_count,
  count(distinct b.id) filter (where b.is_deleted = false) as batch_count
from users u
left join medications m on m.user_id = u.id
left join batches b on b.user_id = u.id
group by u.id;

create or replace view admin_totals as
select
  count(*)::integer as users,
  coalesce((select count(*) from medications where is_deleted = false), 0)::integer as medications,
  coalesce((select count(*) from batches where is_deleted = false), 0)::integer as batches,
  coalesce(sum(gemini_scan_count), 0)::integer as ai_scans,
  coalesce(sum(gs1_scan_count), 0)::integer as gs1_scans
from users;
