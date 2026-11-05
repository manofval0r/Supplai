create or replace function public.prepare_dispatch_v1(p_request_reference text, p_proof_hash text, p_proof_expires_at timestamptz, p_now timestamptz)
returns table (transfer_id uuid, transfer_reference text, pickup_facility_id uuid, delivery_facility_id uuid, transfer_quantity integer)
language plpgsql security invoker set search_path = '' as $$
declare r public.request; m public.match; t public.transfer; lot public.stock_lot;
begin
  select * into r from public.request where reference = p_request_reference for update;
  if not found or r.status <> 'confirmed' then return; end if;
  select * into m from public.match where request_id = r.id and status = 'reserved' for update;
  if not found then return; end if;
  select * into lot from public.stock_lot
  where facility_id = m.facility_id and drug_id = r.drug_id and quantity >= r.quantity
    and condition = 'usable' and ambient_only and expires_on > p_now::date
  order by expires_on, id limit 1 for update;
  if not found then raise exception 'no_releasable_lot'; end if;
  insert into public.transfer(reference,request_id,match_id,from_facility_id,to_facility_id,drug_id,quantity,dispatch_code_hash,proof_expires_at,status,created_at,source_released_at,received_lot_id)
  values ('TRF-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),r.id,m.id,m.facility_id,r.facility_id,r.drug_id,r.quantity,p_proof_hash,p_proof_expires_at,'pending',p_now,p_now,lot.id)
  returning * into t;
  insert into public.transfer_event(transfer_id,sequence,event_type,actor_role,detail,occurred_at)
  values(t.id,1,'source_released','source_custodian','Ambient usable batch ' || lot.batch_number || ' released above safety floor',p_now);
  return query select t.id,t.reference,t.from_facility_id,t.to_facility_id,t.quantity;
end $$;

create or replace function public.verify_delivery_v1(p_transfer_reference text,p_proof_hash text,p_verifier_phone text,p_now timestamptz)
returns table (result_status text, attempts_remaining integer)
language plpgsql security invoker set search_path='' as $$
declare t public.transfer; receiver_phone text; rider_phone text; updated_count integer; source_lot public.stock_lot; received_lot uuid;
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
  select * into source_lot from public.stock_lot where id=t.received_lot_id for update;
  if not found or source_lot.quantity < t.quantity then raise exception 'source_lot_not_releasable'; end if;
  update public.stock_level set quantity=quantity-t.quantity,as_of=p_now,source='transfer',updated_at=p_now
  where facility_id=t.from_facility_id and drug_id=t.drug_id and quantity-t.quantity>=safety_floor;
  get diagnostics updated_count=row_count;
  if updated_count<>1 then raise exception 'source_safety_floor_breach'; end if;
  update public.stock_lot set quantity=quantity-t.quantity where id=source_lot.id;
  insert into public.stock_lot(facility_id,drug_id,batch_number,expires_on,quantity,condition,ambient_only)
  values(t.to_facility_id,t.drug_id,source_lot.batch_number,source_lot.expires_on,t.quantity,'usable',true) returning id into received_lot;
  update public.stock_level set quantity=quantity+t.quantity,as_of=p_now,source='transfer',updated_at=p_now where facility_id=t.to_facility_id and drug_id=t.drug_id;
  if not found then raise exception 'receiver_stock_row_missing'; end if;
  insert into public.stock_movement(transfer_id,facility_id,drug_id,delta,reason,recorded_at,recorded_by)
  values(t.id,t.from_facility_id,t.drug_id,-t.quantity,'transfer_out',p_now,'verify_delivery_v3'),(t.id,t.to_facility_id,t.drug_id,t.quantity,'transfer_in',p_now,'verify_delivery_v3');
  update public.transfer set status='delivered',delivered_at=p_now,proof_verified_at=p_now,dispatch_code_hash=null,receiving_decision='accepted',received_lot_id=received_lot where id=t.id;
  update public.request set status='delivered',closed_at=p_now where id=t.request_id;
  update public.match set status='consumed' where id=t.match_id;
  insert into public.transfer_event(transfer_id,sequence,event_type,actor_role,detail,occurred_at)
  values(t.id,2,'receiving_inspected','receiving_facility','Batch and expiry inspected at handover',p_now),(t.id,3,'received','receiving_facility','Handover accepted and ledger updated',p_now);
  return query select 'delivered',greatest(0,2-t.proof_attempts::integer);
end $$;
