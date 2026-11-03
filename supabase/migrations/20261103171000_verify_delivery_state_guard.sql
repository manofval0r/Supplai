create function public.verify_delivery_v2(p_transfer_reference text,p_proof_hash text,p_verifier_phone text,p_now timestamptz)
returns table (result_status text, attempts_remaining integer)
language plpgsql security invoker set search_path='' as $$
declare current_status public.transfer_status; current_attempts integer;
begin
  select status,proof_attempts into current_status,current_attempts from public.transfer where reference=p_transfer_reference;
  if not found then return query select 'not_found',0; return; end if;
  if current_status not in ('dispatched','in_transit','delivered','locked') then
    return query select 'already_closed',greatest(0,2-current_attempts); return;
  end if;
  return query select * from public.verify_delivery_v1(p_transfer_reference,p_proof_hash,p_verifier_phone,p_now);
end $$;
revoke execute on function public.verify_delivery_v2(text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.verify_delivery_v2(text,text,text,timestamptz) to service_role;
