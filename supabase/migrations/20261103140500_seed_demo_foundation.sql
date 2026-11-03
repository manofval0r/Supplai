insert into public.lga (code, name, state_code)
values ('DEMO-LGA', 'Aiyetoro Demo LGA', 'LA');

insert into public.facility (
  lga_id, code, name, type, ledger, ward, phone_primary, latitude, longitude, verified_at
)
select
  lga.id,
  seed.code,
  seed.name,
  'phc'::public.facility_type,
  'public'::public.ledger_type,
  seed.ward,
  seed.phone,
  seed.latitude,
  seed.longitude,
  now()
from public.lga lga
cross join (
  values
    ('PHC-A', 'Aiyetoro Central PHC', 'Central', '+2348010000001', 6.601100::numeric, 3.351500::numeric),
    ('PHC-B', 'Oke-Aro PHC', 'Oke-Aro', '+2348010000002', 6.607800::numeric, 3.360100::numeric),
    ('PHC-C', 'Ita-Oluwo PHC', 'Ita-Oluwo', '+2348010000003', 6.594400::numeric, 3.344900::numeric),
    ('PHC-D', 'Agbele PHC', 'Agbele', '+2348010000004', 6.615200::numeric, 3.338700::numeric),
    ('PHC-E', 'Ajegunle PHC', 'Ajegunle', '+2348010000005', 6.589600::numeric, 3.367300::numeric),
    ('PHC-F', 'Igbogbo PHC', 'Igbogbo', '+2348010000006', 6.620400::numeric, 3.372200::numeric),
    ('PHC-G', 'Owode PHC', 'Owode', '+2348010000007', 6.583200::numeric, 3.355600::numeric),
    ('PHC-H', 'Isheri PHC', 'Isheri', '+2348010000008', 6.612100::numeric, 3.381800::numeric)
) as seed(code, name, ward, phone, latitude, longitude)
where lga.code = 'DEMO-LGA';

insert into public.rider (lga_id, code, display_name, phone)
select lga.id, seed.code, seed.display_name, seed.phone
from public.lga lga
cross join (
  values
    ('RIDER-01', 'Tunde A.', '+2348020000001'),
    ('RIDER-02', 'Amina K.', '+2348020000002')
) as seed(code, display_name, phone)
where lga.code = 'DEMO-LGA';

insert into public.drug (canonical_name, strength, form, cold_chain)
values
  ('Oral Rehydration Salts', 'WHO reduced-osmolarity', 'sachet', false),
  ('Zinc Sulfate', '20 mg', 'dispersible tablet', false);

insert into public.drug_alias (drug_id, alias, source)
select drug.id, alias.value, 'seed'
from public.drug drug
cross join lateral (
  select value
  from unnest(
    case drug.canonical_name
      when 'Oral Rehydration Salts' then array[
        'ors', 'oral rehydration salts', 'oral rehydration salt',
        'oral salt', 'rehydration sachet', 'rehidration salt'
      ]
      when 'Zinc Sulfate' then array[
        'zinc', 'zinc 20', 'zinc 20mg', 'zinc tablet', 'zinc dispersible'
      ]
      else array[]::text[]
    end
  ) as value
) alias;

insert into public.stock_level (facility_id, drug_id, quantity, as_of, source)
select
  facility.id,
  drug.id,
  case
    when facility.code = 'PHC-A' and drug.canonical_name = 'Oral Rehydration Salts' then 0
    when facility.code = 'PHC-B' and drug.canonical_name = 'Oral Rehydration Salts' then 80
    when facility.code = 'PHC-C' and drug.canonical_name = 'Oral Rehydration Salts' then 35
    when drug.canonical_name = 'Oral Rehydration Salts' then 15
    when facility.code = 'PHC-A' and drug.canonical_name = 'Zinc Sulfate' then 4
    when facility.code = 'PHC-B' and drug.canonical_name = 'Zinc Sulfate' then 60
    else 20
  end,
  now(),
  'import'::public.stock_source
from public.facility facility
cross join public.drug drug
where facility.code like 'PHC-%';

insert into public.stock_movement (
  facility_id, drug_id, delta, reason, recorded_by
)
select
  stock.facility_id,
  stock.drug_id,
  stock.quantity,
  'import'::public.movement_reason,
  'seed_demo_foundation'
from public.stock_level stock
where stock.quantity > 0;
