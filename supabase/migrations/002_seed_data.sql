insert into public.roles (role_id, role_name, description)
values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'System administrator'),
  ('00000000-0000-0000-0000-000000000002', 'farmer', 'Farmer with scoped access')
on conflict (role_id) do update
set role_name = excluded.role_name,
    description = excluded.description;

insert into public.device_types (device_type_id, type_name, category, unit, description)
values
  ('10000000-0000-0000-0000-000000000001', 'Temperature Sensor', 'sensor', 'C', 'Air temperature'),
  ('10000000-0000-0000-0000-000000000002', 'Air Humidity Sensor', 'sensor', '%', 'Air humidity'),
  ('10000000-0000-0000-0000-000000000003', 'Soil Moisture Sensor', 'sensor', '%', 'Soil moisture'),
  ('10000000-0000-0000-0000-000000000004', 'Light Sensor', 'sensor', 'lux', 'Light intensity'),
  ('10000000-0000-0000-0000-000000000011', 'GDD Index Sensor', 'sensor', 'gdd', 'Growing degree day index'),
  ('10000000-0000-0000-0000-000000000005', 'Water Pump', 'actuator', null, 'Main pump'),
  ('10000000-0000-0000-0000-000000000006', 'Misting System', 'actuator', null, 'Automatic misting'),
  ('10000000-0000-0000-0000-000000000007', 'RGB Warning Light', 'actuator', null, 'RGB status light'),
  ('10000000-0000-0000-0000-000000000008', 'Grow Light', 'actuator', null, 'Grow light'),
  ('10000000-0000-0000-0000-000000000009', 'Cooling Fan', 'actuator', null, 'Ventilation fan'),
  ('10000000-0000-0000-0000-000000000010', 'Water Valve', 'actuator', null, 'Solenoid valve')
on conflict (device_type_id) do update
set type_name = excluded.type_name,
    category = excluded.category,
    unit = excluded.unit,
    description = excluded.description;

insert into public.device_capabilities (device_type_id, capability_name, description)
values
  ('10000000-0000-0000-0000-000000000005', 'power_on_off', 'Toggle pump'),
  ('10000000-0000-0000-0000-000000000006', 'power_on_off', 'Toggle misting'),
  ('10000000-0000-0000-0000-000000000007', 'power_on_off', 'Toggle RGB light'),
  ('10000000-0000-0000-0000-000000000007', 'set_color', 'Set RGB hex color'),
  ('10000000-0000-0000-0000-000000000008', 'light_on_off', 'Toggle grow light'),
  ('10000000-0000-0000-0000-000000000009', 'power_on_off', 'Toggle fan'),
  ('10000000-0000-0000-0000-000000000010', 'open_close', 'Open or close valve')
on conflict do nothing;

insert into public.plant_types (
  plant_type_id,
  plant_name,
  description,
  temp_min,
  temp_max,
  humidity_air_min,
  humidity_air_max,
  humidity_soil_min,
  humidity_soil_max,
  light_min_seconds,
  light_max_seconds,
  watering_cycle_hours,
  watering_duration_minutes,
  harvest_days_min,
  harvest_days_max,
  created_at
)
values
(
  '20000000-0000-0000-0000-000000000001',
  'Ca chua',
  'Tomato profile for smart farm.',
  15, 35,
  50, 90,
  50, 95,
  21600, null,
  12, 30, 50, 90,
  now()
),
(
  '20000000-0000-0000-0000-000000000002',
  'Cai xanh',
  'Leafy green profile for cool environment.',
  5, 27,
  60, 85,
  50, 70,
  14400, 21600,
  12, 15, 35, 40,
  now()
),
(
  '20000000-0000-0000-0000-000000000003',
  'Nha dam',
  'Aloe vera profile with drought tolerance.',
  5, 30,
  40, 70,
  30, 60,
  21600, null,
  72, 120, 730, 1095,
  now()
)
on conflict (plant_type_id) do update
set plant_name = excluded.plant_name,
    description = excluded.description,
    temp_min = excluded.temp_min,
    temp_max = excluded.temp_max,
    humidity_air_min = excluded.humidity_air_min,
    humidity_air_max = excluded.humidity_air_max,
    humidity_soil_min = excluded.humidity_soil_min,
    humidity_soil_max = excluded.humidity_soil_max,
    light_min_seconds = excluded.light_min_seconds,
    light_max_seconds = excluded.light_max_seconds,
    watering_cycle_hours = excluded.watering_cycle_hours,
    watering_duration_minutes = excluded.watering_duration_minutes,
    harvest_days_min = excluded.harvest_days_min,
    harvest_days_max = excluded.harvest_days_max;
