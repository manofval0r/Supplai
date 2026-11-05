alter table public.stock_level
  add column safety_floor integer not null default 0,
  add constraint stock_safety_floor_nonnegative check (safety_floor >= 0);

create table public.stock_lot (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facility(id),
  drug_id uuid not null references public.drug(id),
  batch_number text not null,
  expires_on date not null,
  quantity integer not null,
  condition text not null default 'usable' check (condition in ('usable', 'quarantined', 'damaged')),
  ambient_only boolean not null default true,
  created_at timestamptz not null default now(),
  constraint stock_lot_quantity_positive check (quantity > 0),
  constraint stock_lot_batch_not_blank check (btrim(batch_number) <> '')
);

create index stock_lot_releasable_idx
  on public.stock_lot (facility_id, drug_id, expires_on)
  where condition = 'usable' and ambient_only;

update public.stock_level
set safety_floor = case
  when drug_id = (select id from public.drug where canonical_name = 'Oral Rehydration Salts') then 20
  when drug_id = (select id from public.drug where canonical_name = 'Zinc Sulfate') then 10
  else 0
end;

insert into public.stock_lot (facility_id, drug_id, batch_number, expires_on, quantity)
select
  stock.facility_id,
  stock.drug_id,
  upper(replace(drug.canonical_name, ' ', '-')) || '-DEMO-01',
  date '2027-06-30',
  stock.quantity
from public.stock_level stock
join public.drug drug on drug.id = stock.drug_id
where stock.quantity > 0;

create table public.transfer_event (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references public.transfer(id) on delete cascade,
  sequence integer not null,
  event_type text not null check (event_type in ('source_released', 'receiving_inspected', 'received', 'exception_raised')),
  actor_role text not null check (actor_role in ('source_custodian', 'receiving_facility', 'lga', 'system')),
  detail text not null,
  occurred_at timestamptz not null default now(),
  unique (transfer_id, sequence)
);

alter table public.transfer
  add column source_released_at timestamptz,
  add column receiving_decision text check (receiving_decision in ('accepted', 'refused')),
  add column received_lot_id uuid references public.stock_lot(id);

alter table public.stock_lot enable row level security;
alter table public.transfer_event enable row level security;

create or replace function public.create_sms_request_v4(
  p_phone text, p_medicine text, p_quantity integer, p_raw_text text, p_now timestamptz
)
returns table (request_reference text, match_id uuid, facility_name text, source_phone text, quantity_offered integer, expires_at timestamptz)
language plpgsql security invoker set search_path = ''
as $$
declare
  requester public.facility;
  selected_drug public.drug;
  supplier public.facility;
  created_request public.request;
  created_match public.match;
begin
  if p_quantity <= 0 then raise exception 'Quantity must be positive'; end if;
  select * into requester from public.facility where phone_primary = p_phone;
  if not found then return; end if;
  select d.* into selected_drug from public.drug_alias a join public.drug d on d.id = a.drug_id and d.active
  where extensions.similarity(lower(a.alias), lower(p_medicine)) >= 0.35
  order by extensions.similarity(lower(a.alias), lower(p_medicine)) desc limit 1;
  if not found then return; end if;
  select f.* into supplier from public.stock_level s join public.facility f on f.id = s.facility_id
  where s.drug_id = selected_drug.id and s.quantity - p_quantity >= s.safety_floor
    and f.id <> requester.id and f.ledger = requester.ledger
    and exists (select 1 from public.stock_lot lot where lot.facility_id = f.id and lot.drug_id = selected_drug.id
      and lot.quantity >= p_quantity and lot.condition = 'usable' and lot.ambient_only and lot.expires_on > p_now::date)
  order by s.quantity desc, f.code limit 1;
  if not found then return; end if;
  insert into public.request (reference, facility_id, drug_id, quantity, raw_text, status, created_at, expires_at)
  values ('REQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)), requester.id, selected_drug.id, p_quantity, p_raw_text, 'matched', p_now, p_now + interval '10 minutes') returning * into created_request;
  insert into public.match (request_id, facility_id, drug_id, quantity_offered, status, offered_at, confirmation_expires_at)
  values (created_request.id, supplier.id, selected_drug.id, p_quantity, 'offered', p_now, created_request.expires_at) returning * into created_match;
  return query select created_request.reference, created_match.id, supplier.name, supplier.phone_primary, created_match.quantity_offered, created_request.expires_at;
end;
$$;

revoke execute on function public.create_sms_request_v4(text, text, integer, text, timestamptz) from public, anon, authenticated;
grant execute on function public.create_sms_request_v4(text, text, integer, text, timestamptz) to service_role;
