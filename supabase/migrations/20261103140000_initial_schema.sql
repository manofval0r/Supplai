create schema if not exists private;

create type public.facility_type as enum ('phc', 'pharmacy', 'lga_store');
create type public.ledger_type as enum ('public', 'private');
create type public.stock_source as enum ('import', 'transfer', 'manual');
create type public.request_status as enum (
  'open', 'matched', 'confirmed', 'dispatched', 'delivered', 'failed', 'expired'
);
create type public.match_status as enum (
  'offered', 'confirmed', 'declined', 'expired', 'reserved', 'consumed'
);
create type public.transfer_status as enum (
  'pending', 'dispatched', 'in_transit', 'delivered', 'failed', 'locked'
);
create type public.movement_reason as enum (
  'transfer_out', 'transfer_in', 'adjustment', 'import'
);
create type public.message_direction as enum ('inbound', 'outbound');

create table public.lga (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  state_code text not null,
  created_at timestamptz not null default now(),
  constraint lga_code_not_blank check (btrim(code) <> ''),
  constraint lga_name_not_blank check (btrim(name) <> '')
);

create table public.facility (
  id uuid primary key default gen_random_uuid(),
  lga_id uuid not null references public.lga(id),
  code text not null unique,
  name text not null,
  type public.facility_type not null,
  ledger public.ledger_type not null,
  ward text not null,
  phone_primary text not null unique,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  pcn_licence text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint facility_code_not_blank check (btrim(code) <> ''),
  constraint facility_name_not_blank check (btrim(name) <> ''),
  constraint facility_phone_e164 check (phone_primary ~ '^\+[1-9][0-9]{7,14}$'),
  constraint facility_latitude_range check (latitude between -90 and 90),
  constraint facility_longitude_range check (longitude between -180 and 180),
  constraint pharmacy_requires_licence check (
    type <> 'pharmacy' or pcn_licence is not null
  )
);

create table public.drug (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  strength text not null,
  form text not null,
  rxnorm_cui text,
  cold_chain boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (canonical_name, strength, form),
  constraint drug_name_not_blank check (btrim(canonical_name) <> '')
);

create table public.drug_alias (
  id uuid primary key default gen_random_uuid(),
  drug_id uuid not null references public.drug(id) on delete cascade,
  alias text not null,
  source text not null default 'seed',
  created_at timestamptz not null default now(),
  unique (alias),
  constraint drug_alias_not_blank check (btrim(alias) <> ''),
  constraint drug_alias_source check (source in ('seed', 'learned'))
);

create index drug_alias_trgm_idx
  on public.drug_alias using gin (alias extensions.gin_trgm_ops);

create table public.rider (
  id uuid primary key default gen_random_uuid(),
  lga_id uuid not null references public.lga(id),
  code text not null unique,
  display_name text not null,
  phone text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint rider_phone_e164 check (phone ~ '^\+[1-9][0-9]{7,14}$')
);

create table public.stock_level (
  facility_id uuid not null references public.facility(id),
  drug_id uuid not null references public.drug(id),
  quantity integer not null,
  as_of timestamptz not null,
  source public.stock_source not null,
  updated_at timestamptz not null default now(),
  primary key (facility_id, drug_id),
  constraint stock_quantity_nonnegative check (quantity >= 0)
);

create table public.request (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  facility_id uuid not null references public.facility(id),
  drug_id uuid not null references public.drug(id),
  quantity integer not null,
  raw_text text not null,
  status public.request_status not null default 'open',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  closed_at timestamptz,
  constraint request_quantity_positive check (quantity > 0),
  constraint request_expiry_after_creation check (expires_at > created_at),
  constraint request_raw_text_not_blank check (btrim(raw_text) <> '')
);

create index request_facility_status_idx
  on public.request (facility_id, status, created_at desc);

create table public.match (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.request(id) on delete cascade,
  facility_id uuid not null references public.facility(id),
  drug_id uuid not null references public.drug(id),
  quantity_offered integer not null,
  status public.match_status not null default 'offered',
  offered_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmation_expires_at timestamptz,
  reserved_at timestamptz,
  unique (request_id, facility_id),
  constraint match_quantity_positive check (quantity_offered > 0)
);

create index match_request_status_idx on public.match (request_id, status);

create table public.transfer (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  request_id uuid not null unique references public.request(id),
  match_id uuid not null unique references public.match(id),
  from_facility_id uuid not null references public.facility(id),
  to_facility_id uuid not null references public.facility(id),
  drug_id uuid not null references public.drug(id),
  quantity integer not null,
  rider_id uuid references public.rider(id),
  external_dispatch_id text,
  dispatch_code_hash text,
  proof_attempts smallint not null default 0,
  proof_expires_at timestamptz,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  proof_verified_at timestamptz,
  status public.transfer_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint transfer_quantity_positive check (quantity > 0),
  constraint transfer_distinct_facilities check (from_facility_id <> to_facility_id),
  constraint transfer_proof_attempt_range check (proof_attempts between 0 and 2)
);

create index transfer_status_created_idx
  on public.transfer (status, created_at desc);

create table public.stock_movement (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid references public.transfer(id),
  facility_id uuid not null references public.facility(id),
  drug_id uuid not null references public.drug(id),
  delta integer not null,
  reason public.movement_reason not null,
  recorded_at timestamptz not null default now(),
  recorded_by text not null,
  constraint movement_delta_nonzero check (delta <> 0),
  constraint transfer_movement_requires_transfer check (
    reason not in ('transfer_out', 'transfer_in') or transfer_id is not null
  ),
  unique (transfer_id, facility_id, reason)
);

create index stock_movement_facility_drug_idx
  on public.stock_movement (facility_id, drug_id, recorded_at);

create table public.message_log (
  id uuid primary key default gen_random_uuid(),
  direction public.message_direction not null,
  phone text not null,
  body text not null,
  provider text not null,
  provider_id text,
  request_id uuid references public.request(id),
  received_at timestamptz,
  sent_at timestamptz,
  processed_at timestamptz,
  error_code text,
  error_detail text,
  created_at timestamptz not null default now(),
  constraint message_phone_e164 check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  constraint message_body_not_blank check (btrim(body) <> '')
);

create unique index message_provider_id_unique_idx
  on public.message_log (provider, provider_id)
  where provider_id is not null;

create or replace function private.enforce_same_transfer_ledger()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  from_ledger public.ledger_type;
  to_ledger public.ledger_type;
begin
  select ledger into from_ledger
  from public.facility
  where id = new.from_facility_id;

  select ledger into to_ledger
  from public.facility
  where id = new.to_facility_id;

  if from_ledger is null or to_ledger is null then
    raise exception 'Transfer facilities must exist';
  end if;

  if from_ledger <> to_ledger then
    raise exception 'Cross-ledger transfers are forbidden';
  end if;

  return new;
end;
$$;

create trigger enforce_same_transfer_ledger
before insert or update of from_facility_id, to_facility_id
on public.transfer
for each row execute function private.enforce_same_transfer_ledger();

create or replace function private.prevent_stock_movement_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Stock movements are append-only';
end;
$$;

create trigger stock_movement_append_only
before update or delete on public.stock_movement
for each row execute function private.prevent_stock_movement_mutation();

alter table public.lga enable row level security;
alter table public.facility enable row level security;
alter table public.drug enable row level security;
alter table public.drug_alias enable row level security;
alter table public.rider enable row level security;
alter table public.stock_level enable row level security;
alter table public.request enable row level security;
alter table public.match enable row level security;
alter table public.transfer enable row level security;
alter table public.stock_movement enable row level security;
alter table public.message_log enable row level security;

revoke all on schema public from anon, authenticated;
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
