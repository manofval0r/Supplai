-- Round 5: let the rider record pickup and in-transit progress, and let the
-- receiving facility refuse a handover with a reason. Both write the existing
-- transfer_event spine so the order timeline stays canonical.

alter table public.transfer_event
  drop constraint if exists transfer_event_event_type_check;

alter table public.transfer_event
  add constraint transfer_event_event_type_check check (
    event_type in (
      'source_released',
      'rider_assigned',
      'picked_up',
      'in_transit',
      'receiving_inspected',
      'received',
      'exception_raised'
    )
  );

alter table public.transfer_event
  drop constraint if exists transfer_event_actor_role_check;

alter table public.transfer_event
  add constraint transfer_event_actor_role_check check (
    actor_role in (
      'source_custodian',
      'receiving_facility',
      'rider',
      'lga',
      'system'
    )
  );

create or replace function public.record_transfer_event_v1(
  p_transfer_reference text,
  p_event_type text,
  p_actor_role text,
  p_detail text,
  p_now timestamptz
)
returns table (result_status text, transfer_status text)
language plpgsql security invoker set search_path = ''
as $$
declare
  current_transfer public.transfer;
  next_sequence integer;
begin
  select t.* into current_transfer
  from public.transfer t
  where t.reference = p_transfer_reference
  for update;
  if not found then
    return query select 'not_found', null::text;
    return;
  end if;
  if current_transfer.status not in ('dispatched', 'in_transit') then
    return query select 'already_closed', current_transfer.status::text;
    return;
  end if;

  select coalesce(max(e.sequence), 0) + 1 into next_sequence
  from public.transfer_event e
  where e.transfer_id = current_transfer.id;

  insert into public.transfer_event
    (transfer_id, sequence, event_type, actor_role, detail, occurred_at)
  values
    (current_transfer.id, next_sequence, p_event_type, p_actor_role, p_detail, p_now);

  if p_event_type = 'in_transit' and current_transfer.status = 'dispatched' then
    update public.transfer
    set status = 'in_transit'
    where id = current_transfer.id;
    current_transfer.status := 'in_transit';
  end if;

  return query select 'recorded', current_transfer.status::text;
end $$;

revoke execute on function public.record_transfer_event_v1(text, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.record_transfer_event_v1(text, text, text, text, timestamptz) to service_role;

create or replace function public.refuse_receipt_v1(
  p_transfer_reference text,
  p_actor_phone text,
  p_reason text,
  p_now timestamptz
)
returns table (result_status text)
language plpgsql security invoker set search_path = ''
as $$
declare
  current_transfer public.transfer;
  receiver_phone text;
  next_sequence integer;
begin
  select t.* into current_transfer
  from public.transfer t
  where t.reference = p_transfer_reference
  for update;
  if not found then
    return query select 'not_found';
    return;
  end if;

  select f.phone_primary into receiver_phone
  from public.facility f
  where f.id = current_transfer.to_facility_id;
  if receiver_phone is distinct from p_actor_phone then
    return query select 'unauthorized';
    return;
  end if;
  if current_transfer.status not in ('dispatched', 'in_transit') then
    return query select 'already_closed';
    return;
  end if;

  update public.transfer
  set status = 'failed',
      receiving_decision = 'refused'
  where id = current_transfer.id;

  select coalesce(max(e.sequence), 0) + 1 into next_sequence
  from public.transfer_event e
  where e.transfer_id = current_transfer.id;

  insert into public.transfer_event
    (transfer_id, sequence, event_type, actor_role, detail, occurred_at)
  values
    (current_transfer.id, next_sequence, 'exception_raised', 'receiving_facility', p_reason, p_now);

  return query select 'refused';
end $$;

revoke execute on function public.refuse_receipt_v1(text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.refuse_receipt_v1(text, text, text, timestamptz) to service_role;
