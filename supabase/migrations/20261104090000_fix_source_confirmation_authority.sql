create function public.create_sms_request_v3(
  p_phone text, p_medicine text, p_quantity integer, p_raw_text text, p_now timestamptz
)
returns table (
  request_reference text, match_id uuid, facility_name text, source_phone text,
  quantity_offered integer, expires_at timestamptz
)
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

  select d.* into selected_drug
  from public.drug_alias a join public.drug d on d.id = a.drug_id and d.active
  where extensions.similarity(lower(a.alias), lower(p_medicine)) >= 0.35
  order by extensions.similarity(lower(a.alias), lower(p_medicine)) desc limit 1;
  if not found then return; end if;

  select f.* into supplier
  from public.stock_level s join public.facility f on f.id = s.facility_id
  where s.drug_id = selected_drug.id and s.quantity >= p_quantity
    and f.id <> requester.id and f.ledger = requester.ledger
  order by s.quantity desc, f.code limit 1;
  if not found then return; end if;

  insert into public.request (reference, facility_id, drug_id, quantity, raw_text, status, created_at, expires_at)
  values ('REQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)), requester.id, selected_drug.id, p_quantity, p_raw_text, 'matched', p_now, p_now + interval '10 minutes')
  returning * into created_request;
  insert into public.match (request_id, facility_id, drug_id, quantity_offered, status, offered_at, confirmation_expires_at)
  values (created_request.id, supplier.id, selected_drug.id, p_quantity, 'offered', p_now, created_request.expires_at)
  returning * into created_match;

  return query select created_request.reference, created_match.id, supplier.name,
    supplier.phone_primary, created_match.quantity_offered, created_request.expires_at;
end;
$$;

create or replace function public.respond_to_sms_offer(
  p_phone text, p_reference text, p_accept boolean, p_now timestamptz
)
returns text language plpgsql security invoker set search_path = ''
as $$
declare
  target_request public.request;
  target_match public.match;
begin
  select r.* into target_request
  from public.request r
  join public.match m on m.request_id = r.id and m.status = 'offered'
  join public.facility source on source.id = m.facility_id
  where r.reference = p_reference and source.phone_primary = p_phone
  order by m.offered_at, m.id limit 1 for update of r;
  if not found then return 'not_found'; end if;
  if target_request.status not in ('matched', 'open') then return 'already_closed'; end if;

  select * into target_match from public.match
  where request_id = target_request.id and status = 'offered'
  order by offered_at, id limit 1 for update;
  if not found then return 'already_closed'; end if;

  if p_now >= coalesce(target_match.confirmation_expires_at, target_request.expires_at) then
    update public.match set status = 'expired' where id = target_match.id;
    update public.request set status = 'expired', closed_at = p_now where id = target_request.id;
    return 'expired';
  end if;
  if not p_accept then
    update public.match set status = 'declined', confirmed_at = p_now where id = target_match.id;
    update public.request set status = 'open' where id = target_request.id;
    return 'declined';
  end if;
  update public.match set status = 'reserved', confirmed_at = p_now, reserved_at = p_now where id = target_match.id;
  update public.match set status = 'expired' where request_id = target_request.id and id <> target_match.id and status = 'offered';
  update public.request set status = 'confirmed', closed_at = p_now where id = target_request.id;
  return 'confirmed';
end;
$$;

revoke execute on function public.create_sms_request_v3(text, text, integer, text, timestamptz) from public, anon, authenticated;
grant execute on function public.create_sms_request_v3(text, text, integer, text, timestamptz) to service_role;
