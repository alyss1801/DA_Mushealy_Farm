-- Demo bootstrap data for end-to-end IoT flow

insert into public.users (
  user_id,
  username,
  email,
  password_hash,
  full_name,
  role_id,
  is_active
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    'admin_demo',
    'admin@nongtech.vn',
    '123456',
    'Admin Demo',
    '00000000-0000-0000-0000-000000000001',
    true
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'farmer_demo',
    'farmer@nongtech.vn',
    '123456',
    'Farmer Demo',
    '00000000-0000-0000-0000-000000000002',
    true
  )
on conflict (user_id) do nothing;

insert into public.farms (
  farm_id,
  farm_code,
  farm_name,
  owner_name,
  location_desc,
  area_m2,
  status
)
values (
  '40000000-0000-0000-0000-000000000001',
  'FARM_NONGTECH_DEMO',
  'NongTech Demo Farm',
  'Farmer Demo',
  'Demo greenhouse',
  1200,
  'active'
)
on conflict (farm_id) do nothing;

insert into public.farm_user_access (user_id, farm_id, granted_by)
values
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001')
on conflict (user_id, farm_id) do nothing;

insert into public.farm_zones (
  zone_id,
  farm_id,
  zone_name,
  plant_type_id,
  area_m2,
  location_desc,
  status
)
values (
  '50000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  'Zone A',
  '20000000-0000-0000-0000-000000000001',
  300,
  'Main test zone',
  'active'
)
on conflict (zone_id) do nothing;

insert into public.user_zone_access (user_id, zone_id, granted_by)
values
  ('30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001')
on conflict (user_id, zone_id) do nothing;

insert into public.devices (
  device_id,
  device_code,
  device_name,
  device_type_id,
  zone_id,
  ohstem_feed_key,
  install_location,
  is_controllable,
  status
)
values
  ('60000000-0000-0000-0000-000000000001', 'V1_smartfarm', 'Temperature Sensor V1', '10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'V1', 'Zone A - pole 1', false, 'offline'),
  ('60000000-0000-0000-0000-000000000002', 'V2_smartfarm', 'Air Humidity Sensor V2', '10000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'V2', 'Zone A - pole 1', false, 'offline'),
  ('60000000-0000-0000-0000-000000000003', 'V3_smartfarm', 'Soil Moisture Sensor V3', '10000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'V3', 'Zone A - bed 1', false, 'offline'),
  ('60000000-0000-0000-0000-000000000004', 'V4_smartfarm', 'Light Sensor V4', '10000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', 'V4', 'Zone A - roof', false, 'offline'),
  ('60000000-0000-0000-0000-000000000005', 'V5_smartfarm', 'GDD Sensor V5', '10000000-0000-0000-0000-000000000011', '50000000-0000-0000-0000-000000000001', 'V5', 'Zone A - control box', false, 'offline'),
  ('60000000-0000-0000-0000-000000000006', 'V10_smartfarm', 'Pump 1 V10', '10000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000001', 'V10', 'Zone A - water line', true, 'offline'),
  ('60000000-0000-0000-0000-000000000007', 'V11_smartfarm', 'Pump 2 V11', '10000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000001', 'V11', 'Zone A - backup line', true, 'offline')
on conflict (device_id) do nothing;

insert into public.zone_thresholds (threshold_id, zone_id, metric_type, min_value, max_value)
values
  ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'temperature', 20, 30),
  ('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'humidity_air', 55, 90),
  ('70000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'humidity_soil', 60, 90),
  ('70000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', 'light', 10000, 80000)
on conflict (zone_id, metric_type) do update
set min_value = excluded.min_value,
    max_value = excluded.max_value,
    updated_at = now();
