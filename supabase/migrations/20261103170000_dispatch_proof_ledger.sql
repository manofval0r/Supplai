create function public.prepare_dispatch_v1(p_request_reference text, p_proof_hash text, p_proof_expires_at timestamptz, p_now timestamptz)
returns table (transfer_id uuid, transfer_reference text, pickup_facility_id uuid, delivery_facility_id uuid, transfer_quantity integer)
language plpgsql security invoker set search_path = '' as $$
declare r public.request; m public.match; t public.transfer;
begin
  select * into r from public.request where reference=p_request_reference for update;
  if not found or r.status <> 'confirmed' then return; end if;
  select * into m from public.match where request_id=r.id and status='reserved' for update;
  if not found then return; end if;
  insert into public.transfer(reference,request_id,match_id,from_facility_id,to_facility_id,drug_id,quantity,dispatch_code_hash,proof_expires_at,status,created_at)
  values ('TRF-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),r.id,m.id,m.facility_id,r.facility_id,r.drug_id,r.quantity,p_proof_hash,p_proof_expires_at,'pending',p_now)
  returning * into t;
  return query select t.id,t.reference,t.from_facility_id,t.to_facility_id,t.quantity;
end $$;

create function public.mark_dispatched_v1(p_transfer_reference text,p_external_dispatch_id text,p_now timestamptz)
returns void language plpgsql security invoker set search_path='' as $$
begin
  update public.transfer set external_dispatch_id=p_external_dispatch_id,status='dispatched',dispatched_at=p_now where reference=p_transfer_reference and status='pending';
  if not found then raise exception 'transfer_not_pending'; end if;
  update public.request r set status='dispatched' from public.transfer t where t.reference=p_transfer_reference and r.id=t.request_id;
end $$;

create function public.verify_delivery_v1(p_transfer_reference text,p_proof_hash text,p_verifier_phone text,p_now timestamptz)
returns table (result_status text, attempts_remaining integer)
language plpgsql security invoker set search_path='' as $$
declare t public.transfer; receiver_phone text; rider_phone text; updated_count integer;
begin
  select * into t from public.transfer where reference=p_transfer_reference for update;
  if not found then return query select 'not_found',0; return; end if;
  if t.status='delivered' then return query select 'already_closed',greatest(0,2-t.proof_attempts::integer); return; end if;
  if t.status='locked' then return query select 'locked',0; return; end if;
  select phone_primary into receiver_phone from public.facility where id=t.to_facility_id;
  if t.rider_id is not null then select phone into rider_phone from public.rider where id=t.rider_id; end if;
  if p_verifier_phone <> receiver_phone or p_verifier_phone=coalesce(rider_phone,'') then return query select 'unauthorized',greatest(0,2-t.proof_attempts::integer); return; end if;
  if p_now >= t.proof_expires_at then return query select 'expired',greatest(0,2-t.proof_attempts::integer); return; end if;
  if t.dispatch_code_hash <> p_proof_hash then
    update public.transfer set proof_attempts=proof_attempts+1,status=case when proof_attempts+1>=2 then 'locked'::public.transfer_status else status end where id=t.id returning proof_attempts into t.proof_attempts;
    return query select case when t.proof_attempts>=2 then 'locked' else 'invalid_proof' end,greatest(0,2-t.proof_attempts::integer); return;
  end if;
  update public.stock_level set quantity=quantity-t.quantity,as_of=p_now,source='transfer',updated_at=p_now where facility_id=t.from_facility_id and drug_id=t.drug_id and quantity>=t.quantity;
  get diagnostics updated_count=row_count;
  if updated_count<>1 then raise exception 'insufficient_supplier_stock'; end if;
  update public.stock_level set quantity=quantity+t.quantity,as_of=p_now,source='transfer',updated_at=p_now where facility_id=t.to_facility_id and drug_id=t.drug_id;
  if not found then raise exception 'receiver_stock_row_missing'; end if;
  insert into public.stock_movement(transfer_id,facility_id,drug_id,delta,reason,recorded_at,recorded_by)
  values (t.id,t.from_facility_id,t.drug_id,-t.quantity,'transfer_out',p_now,'verify_delivery_v1'),(t.id,t.to_facility_id,t.drug_id,t.quantity,'transfer_in',p_now,'verify_delivery_v1');
  update public.transfer set status='delivered',delivered_at=p_now,proof_verified_at=p_now,dispatch_code_hash=null where id=t.id;
  update public.request set status='delivered',closed_at=p_now where id=t.request_id;
  update public.match set status='consumed' where id=t.match_id;
  return query select 'delivered',greatest(0,2-t.proof_attempts::integer);
end $$;

create function public.rebuild_stock_cache_v1(p_now timestamptz)
returns integer language plpgsql security invoker set search_path='' as $$
declare changed integer;
begin
  update public.stock_level s set quantity=x.quantity,as_of=p_now,updated_at=p_now
  from (select facility_id,drug_id,sum(delta)::integer quantity from public.stock_movement group by facility_id,drug_id) x
  where s.facility_id=x.facility_id and s.drug_id=x.drug_id;
  get diagnostics changed=row_count; return changed;
end $$;

revoke execute on function public.prepare_dispatch_v1(text,text,timestamptz,timestamptz) from public,anon,authenticated;
revoke execute on function public.mark_dispatched_v1(text,text,timestamptz) from public,anon,authenticated;
revoke execute on function public.verify_delivery_v1(text,text,text,timestamptz) from public,anon,authenticated;
revoke execute on function public.rebuild_stock_cache_v1(timestamptz) from public,anon,authenticated;
grant execute on function public.prepare_dispatch_v1(text,text,timestamptz,timestamptz) to service_role;
grant execute on function public.mark_dispatched_v1(text,text,timestamptz) to service_role;
grant execute on function public.verify_delivery_v1(text,text,text,timestamptz) to service_role;
grant execute on function public.rebuild_stock_cache_v1(timestamptz) to service_role;
