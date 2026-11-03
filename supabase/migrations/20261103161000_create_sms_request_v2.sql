create function public.create_sms_request_v2(p_phone text, p_medicine text, p_quantity integer, p_raw_text text, p_now timestamptz)
returns table (request_reference text, match_id uuid, facility_name text, quantity_offered integer, expires_at timestamptz)
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
  select d.* into selected_drug from public.drug_alias a
  join public.drug d on d.id = a.drug_id and d.active
  where extensions.similarity(lower(a.alias), lower(p_medicine)) >= 0.35
  order by extensions.similarity(lower(a.alias), lower(p_medicine)) desc limit 1;
  if not found then return; end if;
  select f.* into supplier from public.stock_level s join public.facility f on f.id = s.facility_id
  where s.drug_id = selected_drug.id and s.quantity >= p_quantity and f.id <> requester.id and f.ledger = requester.ledger
  order by s.quantity desc, f.code limit 1;
  if not found then return; end if;
  insert into public.request (reference, facility_id, drug_id, quantity, raw_text, status, created_at, expires_at)
  values ('REQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)), requester.id, selected_drug.id, p_quantity, p_raw_text, 'matched', p_now, p_now + interval '10 minutes')
  returning * into created_request;
  insert into public.match (request_id, facility_id, drug_id, quantity_offered, status, offered_at, confirmation_expires_at)
  values (created_request.id, supplier.id, selected_drug.id, p_quantity, 'offered', p_now, created_request.expires_at)
  returning * into created_match;
  return query select created_request.reference, created_match.id, supplier.name, created_match.quantity_offered, created_request.expires_at;
end;
$$;
revoke execute on function public.create_sms_request_v2(text, text, integer, text, timestamptz) from public, anon, authenticated;
grant execute on function public.create_sms_request_v2(text, text, integer, text, timestamptz) to service_role;
