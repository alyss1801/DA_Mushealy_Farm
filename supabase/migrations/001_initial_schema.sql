create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Group 1: Roles and Users
create table if not exists public.roles (
  role_id uuid primary key default gen_random_uuid(),
  role_name varchar(50) unique not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.users (
  user_id uuid primary key default gen_random_uuid(),
  username varchar(100) unique not null,
  email varchar(255) unique not null,
  password_hash text not null,
  full_name varchar(255),
  phone varchar(20),
  role_id uuid references public.roles(role_id),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_sessions (
  session_id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(user_id) on delete cascade,
  token text unique not null,
  login_at timestamptz default now(),
  expires_at timestamptz not null,
  is_active boolean default true,
  ip_address varchar(45),
  user_agent text
);

-- Group 2: Farm and Plants
create table if not exists public.farms (
  farm_id uuid primary key default gen_random_uuid(),
  farm_code varchar(50) unique not null,
  farm_name varchar(255) not null,
  owner_name varchar(255),
  location_desc text,
  area_m2 numeric(10,2),
  status varchar(20) default 'active' check (status in ('active', 'inactive', 'maintenance')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.farm_user_access (
  user_id uuid references public.users(user_id) on delete cascade,
  farm_id uuid references public.farms(farm_id) on delete cascade,
  granted_at timestamptz default now(),
  granted_by uuid references public.users(user_id),
  primary key (user_id, farm_id)
);

create table if not exists public.plant_types (
  plant_type_id uuid primary key default gen_random_uuid(),
  plant_name varchar(100) not null,
  description text,
  temp_min numeric(5,2),
  temp_max numeric(5,2),
  humidity_air_min numeric(5,2),
  humidity_air_max numeric(5,2),
  humidity_soil_min numeric(5,2),
  humidity_soil_max numeric(5,2),
  light_min_seconds int,
  light_max_seconds int,
  watering_cycle_hours int,
  watering_duration_minutes int,
  harvest_days_min int,
  harvest_days_max int,
  created_at timestamptz default now()
);

create table if not exists public.farm_zones (
  zone_id uuid primary key default gen_random_uuid(),
  farm_id uuid references public.farms(farm_id) on delete cascade,
  zone_name varchar(255) not null,
  plant_type_id uuid references public.plant_types(plant_type_id),
  area_m2 numeric(10,2),
  location_desc text,
  status varchar(20) default 'active' check (status in ('active', 'inactive', 'maintenance')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_zone_access (
  user_id uuid references public.users(user_id) on delete cascade,
  zone_id uuid references public.farm_zones(zone_id) on delete cascade,
  granted_at timestamptz default now(),
  granted_by uuid references public.users(user_id),
  primary key (user_id, zone_id)
);

-- Group 3: Devices
create table if not exists public.device_types (
  device_type_id uuid primary key default gen_random_uuid(),
  type_name varchar(100) not null,
  category varchar(20) not null check (category in ('sensor', 'actuator')),
  unit varchar(20),
  description text,
  created_at timestamptz default now()
);

create table if not exists public.device_capabilities (
  capability_id uuid primary key default gen_random_uuid(),
  device_type_id uuid references public.device_types(device_type_id) on delete cascade,
  capability_name varchar(100) not null,
  description text
);

create table if not exists public.devices (
  device_id uuid primary key default gen_random_uuid(),
  device_code varchar(100) unique not null,
  device_name varchar(255) not null,
  device_type_id uuid references public.device_types(device_type_id),
  zone_id uuid references public.farm_zones(zone_id) on delete set null,
  ohstem_feed_key varchar(50),
  install_location text,
  is_controllable boolean default false,
  status varchar(20) default 'offline' check (status in ('online', 'offline', 'error')),
  last_updated timestamptz default now(),
  created_at timestamptz default now()
);

-- Group 4: Sensor data
create table if not exists public.sensor_data (
  sensor_data_id uuid primary key default gen_random_uuid(),
  device_id uuid references public.devices(device_id) on delete cascade,
  value numeric(10,4) not null,
  recorded_at timestamptz default now(),
  synced boolean default true
);
create index if not exists idx_sensor_data_device_time on public.sensor_data(device_id, recorded_at desc);
create index if not exists idx_sensor_data_recorded on public.sensor_data(recorded_at desc);

create table if not exists public.sensor_data_archive (
  sensor_data_id uuid primary key default gen_random_uuid(),
  device_id uuid,
  value numeric(10,4),
  recorded_at timestamptz,
  synced boolean default true
);

create table if not exists public.sensor_daily_statistics (
  stat_id uuid primary key default gen_random_uuid(),
  device_id uuid references public.devices(device_id) on delete cascade,
  stat_date date not null,
  min_value numeric(10,4),
  max_value numeric(10,4),
  avg_value numeric(10,4),
  total_records int default 0,
  created_at timestamptz default now(),
  unique (device_id, stat_date)
);

-- Group 5: Thresholds and Alerts
create table if not exists public.zone_thresholds (
  threshold_id uuid primary key default gen_random_uuid(),
  zone_id uuid references public.farm_zones(zone_id) on delete cascade,
  metric_type varchar(50) not null check (metric_type in ('temperature', 'humidity_air', 'humidity_soil', 'light')),
  min_value numeric(10,4),
  max_value numeric(10,4),
  updated_at timestamptz default now(),
  unique (zone_id, metric_type)
);

create table if not exists public.alert_rules (
  alert_rule_id uuid primary key default gen_random_uuid(),
  rule_name varchar(255) not null,
  plant_type_id uuid references public.plant_types(plant_type_id),
  zone_id uuid references public.farm_zones(zone_id),
  severity varchar(20) default 'warning' check (severity in ('info', 'warning', 'critical')),
  message_template text,
  is_active boolean default true,
  created_by uuid references public.users(user_id),
  created_at timestamptz default now()
);

create table if not exists public.alert_rule_conditions (
  condition_id uuid primary key default gen_random_uuid(),
  alert_rule_id uuid references public.alert_rules(alert_rule_id) on delete cascade,
  metric_type varchar(50) not null,
  operator varchar(10) not null check (operator in ('<', '>', '<=', '>=', '==')),
  threshold_value numeric(10,4) not null,
  logic_group varchar(5) default 'AND' check (logic_group in ('AND', 'OR'))
);

create table if not exists public.alert_actions (
  action_id uuid primary key default gen_random_uuid(),
  alert_rule_id uuid references public.alert_rules(alert_rule_id) on delete cascade,
  device_id uuid references public.devices(device_id),
  command_type varchar(50),
  parameters jsonb,
  execution_order int default 1
);

create table if not exists public.alerts (
  alert_id uuid primary key default gen_random_uuid(),
  alert_rule_id uuid references public.alert_rules(alert_rule_id),
  zone_id uuid references public.farm_zones(zone_id),
  status varchar(20) default 'detected' check (status in ('detected', 'processing', 'resolved')),
  sensor_snapshot jsonb,
  triggered_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.users(user_id)
);

create table if not exists public.alert_handling_logs (
  handling_log_id uuid primary key default gen_random_uuid(),
  alert_id uuid references public.alerts(alert_id) on delete cascade,
  handled_by uuid references public.users(user_id),
  action_taken text,
  notes text,
  created_at timestamptz default now()
);

-- Group 6: Control and automation
create table if not exists public.device_commands (
  command_id uuid primary key default gen_random_uuid(),
  device_id uuid references public.devices(device_id) on delete cascade,
  command_type varchar(50) not null,
  parameters jsonb,
  status varchar(20) default 'pending' check (status in ('pending', 'sent', 'executed', 'failed')),
  issued_by uuid references public.users(user_id),
  issued_at timestamptz default now(),
  executed_at timestamptz
);

create table if not exists public.schedules (
  schedule_id uuid primary key default gen_random_uuid(),
  zone_id uuid references public.farm_zones(zone_id) on delete cascade,
  device_id uuid references public.devices(device_id),
  schedule_name varchar(255),
  execution_mode varchar(20) default 'manual' check (execution_mode in ('manual', 'automatic', 'threshold_based')),
  schedule_type varchar(20) check (schedule_type in ('once', 'hourly', 'daily', 'weekly')),
  start_time time,
  end_time time,
  day_of_week int check (day_of_week between 0 and 6),
  duration_seconds int,
  is_active boolean default true,
  created_by uuid references public.users(user_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.watering_modes (
  watering_mode_id uuid primary key default gen_random_uuid(),
  zone_id uuid references public.farm_zones(zone_id) on delete cascade unique,
  mode varchar(20) default 'manual' check (mode in ('auto_sensor', 'scheduled', 'manual')),
  trigger_threshold_soil_moisture numeric(5,2),
  updated_at timestamptz default now()
);

create table if not exists public.automation_rules (
  automation_rule_id uuid primary key default gen_random_uuid(),
  rule_name varchar(255) not null,
  zone_id uuid references public.farm_zones(zone_id),
  plant_type_id uuid references public.plant_types(plant_type_id),
  is_active boolean default true,
  priority int default 1,
  cooldown_minutes int default 60,
  last_triggered_at timestamptz,
  created_by uuid references public.users(user_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.automation_rule_conditions (
  condition_id uuid primary key default gen_random_uuid(),
  automation_rule_id uuid references public.automation_rules(automation_rule_id) on delete cascade,
  metric_type varchar(50) not null,
  operator varchar(10) not null check (operator in ('<', '>', '<=', '>=', '==')),
  threshold_value numeric(10,4) not null,
  logic_group varchar(5) default 'AND' check (logic_group in ('AND', 'OR'))
);

create table if not exists public.automation_rule_actions (
  action_id uuid primary key default gen_random_uuid(),
  automation_rule_id uuid references public.automation_rules(automation_rule_id) on delete cascade,
  device_id uuid references public.devices(device_id),
  command_type varchar(50),
  parameters jsonb,
  execution_order int default 1
);

-- Group 7: AI and reports
create table if not exists public.ai_detection_events (
  event_id uuid primary key default gen_random_uuid(),
  zone_id uuid references public.farm_zones(zone_id),
  detection_type varchar(50) check (detection_type in ('plant_anomaly', 'fruit_classification')),
  image_path text,
  result_label varchar(100),
  confidence numeric(5,4),
  details jsonb,
  alert_id uuid references public.alerts(alert_id),
  detected_by_user uuid references public.users(user_id),
  created_at timestamptz default now()
);

create table if not exists public.agricultural_reports (
  report_id uuid primary key default gen_random_uuid(),
  zone_id uuid references public.farm_zones(zone_id),
  report_type varchar(100),
  date_from date,
  date_to date,
  content jsonb,
  export_file_path text,
  generated_by uuid references public.users(user_id),
  created_at timestamptz default now()
);

-- Group 8: System management
create table if not exists public.system_logs (
  log_id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(user_id),
  action_type varchar(100) not null,
  entity_type varchar(100),
  entity_id uuid,
  description text,
  value_before jsonb,
  value_after jsonb,
  ip_address varchar(45),
  created_at timestamptz default now()
);
create index if not exists idx_system_logs_created on public.system_logs(created_at desc);

create table if not exists public.notifications (
  notification_id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(user_id) on delete cascade,
  alert_id uuid references public.alerts(alert_id),
  channel varchar(20) default 'dashboard' check (channel in ('dashboard', 'web_push', 'mobile_push')),
  title varchar(255),
  body text,
  is_read boolean default false,
  sent_at timestamptz default now(),
  read_at timestamptz
);

create table if not exists public.data_backups (
  backup_id uuid primary key default gen_random_uuid(),
  backup_type varchar(20) check (backup_type in ('manual', 'automatic')),
  schedule_type varchar(20),
  file_path text,
  file_size_bytes bigint,
  status varchar(20) default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  created_by uuid references public.users(user_id),
  created_at timestamptz default now(),
  completed_at timestamptz,
  notes text
);

create table if not exists public.data_restorations (
  restore_id uuid primary key default gen_random_uuid(),
  backup_id uuid references public.data_backups(backup_id),
  restored_by uuid references public.users(user_id),
  status varchar(20) default 'running' check (status in ('running', 'completed', 'failed')),
  started_at timestamptz default now(),
  completed_at timestamptz,
  notes text
);

create table if not exists public.gateway_sync_queue (
  sync_id uuid primary key default gen_random_uuid(),
  device_id uuid references public.devices(device_id) on delete cascade,
  payload jsonb not null,
  recorded_at timestamptz not null,
  synced boolean default false,
  synced_at timestamptz
);
create index if not exists idx_gateway_sync_unsynced on public.gateway_sync_queue(synced, recorded_at);

-- Views
create or replace view public.vw_zone_current_sensor_values as
select
  fz.zone_id,
  fz.zone_name,
  fz.farm_id,
  d.device_id,
  d.device_name,
  d.device_code,
  dt.type_name as sensor_type,
  dt.unit,
  sd.value as current_value,
  sd.recorded_at
from public.farm_zones fz
join public.devices d on d.zone_id = fz.zone_id
join public.device_types dt on dt.device_type_id = d.device_type_id and dt.category = 'sensor'
join lateral (
  select value, recorded_at
  from public.sensor_data
  where device_id = d.device_id
  order by recorded_at desc
  limit 1
) sd on true;

create or replace view public.vw_active_alerts as
select
  a.alert_id,
  a.zone_id,
  fz.zone_name,
  fz.farm_id,
  ar.rule_name,
  ar.severity,
  a.status,
  a.sensor_snapshot,
  a.triggered_at
from public.alerts a
join public.farm_zones fz on fz.zone_id = a.zone_id
join public.alert_rules ar on ar.alert_rule_id = a.alert_rule_id
where a.status in ('detected', 'processing')
order by a.triggered_at desc;

-- Triggers for updated_at
create trigger set_updated_at_users before update on public.users
for each row execute function public.set_updated_at();

create trigger set_updated_at_farms before update on public.farms
for each row execute function public.set_updated_at();

create trigger set_updated_at_farm_zones before update on public.farm_zones
for each row execute function public.set_updated_at();

create trigger set_updated_at_schedules before update on public.schedules
for each row execute function public.set_updated_at();

create trigger set_updated_at_automation_rules before update on public.automation_rules
for each row execute function public.set_updated_at();

-- RLS
alter table public.farms enable row level security;
alter table public.farm_zones enable row level security;
alter table public.sensor_data enable row level security;
alter table public.alerts enable row level security;

create policy admin_all_farms on public.farms for all
using (
  exists (
    select 1
    from public.users u
    join public.roles r on r.role_id = u.role_id
    where u.user_id = auth.uid() and r.role_name = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.users u
    join public.roles r on r.role_id = u.role_id
    where u.user_id = auth.uid() and r.role_name = 'admin'
  )
);

create policy farmer_farms on public.farms for select
using (
  exists (
    select 1
    from public.farm_user_access fua
    where fua.user_id = auth.uid() and fua.farm_id = farms.farm_id
  )
);

create policy farmer_zones on public.farm_zones for select
using (
  exists (
    select 1
    from public.user_zone_access uza
    where uza.user_id = auth.uid() and uza.zone_id = farm_zones.zone_id
  )
  or exists (
    select 1
    from public.users u
    join public.roles r on r.role_id = u.role_id
    where u.user_id = auth.uid() and r.role_name = 'admin'
  )
);

create policy sensor_data_zone_access on public.sensor_data for select
using (
  exists (
    select 1
    from public.devices d
    join public.user_zone_access uza on uza.zone_id = d.zone_id
    where d.device_id = sensor_data.device_id and uza.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.users u
    join public.roles r on r.role_id = u.role_id
    where u.user_id = auth.uid() and r.role_name = 'admin'
  )
);

create policy alerts_zone_access on public.alerts for select
using (
  exists (
    select 1
    from public.user_zone_access uza
    where uza.zone_id = alerts.zone_id and uza.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.users u
    join public.roles r on r.role_id = u.role_id
    where u.user_id = auth.uid() and r.role_name = 'admin'
  )
);
