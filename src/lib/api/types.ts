export type Uuid = string;

export interface Role {
  role_id: Uuid;
  role_name: string;
  description: string | null;
  created_at: string;
}

export interface User {
  user_id: Uuid;
  username: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  phone: string | null;
  role_id: Uuid | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  session_id: Uuid;
  user_id: Uuid;
  token: string;
  login_at: string;
  expires_at: string;
  is_active: boolean;
  ip_address: string | null;
  user_agent: string | null;
}

export interface Farm {
  farm_id: Uuid;
  farm_code: string;
  farm_name: string;
  owner_name: string | null;
  location_desc: string | null;
  area_m2: number | null;
  status: "active" | "inactive" | "maintenance";
  created_at: string;
  updated_at: string;
}

export interface FarmUserAccess {
  user_id: Uuid;
  farm_id: Uuid;
  granted_at: string;
  granted_by: Uuid | null;
}

export interface PlantType {
  plant_type_id: Uuid;
  plant_name: string;
  description: string | null;
  temp_min: number | null;
  temp_max: number | null;
  humidity_air_min: number | null;
  humidity_air_max: number | null;
  humidity_soil_min: number | null;
  humidity_soil_max: number | null;
  light_min_seconds: number | null;
  light_max_seconds: number | null;
  watering_cycle_hours: number | null;
  watering_duration_minutes: number | null;
  harvest_days_min: number | null;
  harvest_days_max: number | null;
  created_at: string;
}

export interface FarmZone {
  zone_id: Uuid;
  farm_id: Uuid;
  zone_name: string;
  plant_type_id: Uuid | null;
  area_m2: number | null;
  location_desc: string | null;
  status: "active" | "inactive" | "maintenance";
  created_at: string;
  updated_at: string;
}

export interface UserZoneAccess {
  user_id: Uuid;
  zone_id: Uuid;
  granted_at: string;
  granted_by: Uuid | null;
}

export interface DeviceType {
  device_type_id: Uuid;
  type_name: string;
  category: "sensor" | "actuator";
  unit: string | null;
  description: string | null;
  created_at: string;
}

export interface DeviceCapability {
  capability_id: Uuid;
  device_type_id: Uuid;
  capability_name: string;
  description: string | null;
}

export interface Device {
  device_id: Uuid;
  device_code: string;
  device_name: string;
  device_type_id: Uuid | null;
  zone_id: Uuid | null;
  ohstem_feed_key: string | null;
  install_location: string | null;
  is_controllable: boolean;
  status: "online" | "offline" | "error";
  last_updated: string;
  created_at: string;
}

export interface SensorData {
  sensor_data_id: Uuid;
  device_id: Uuid;
  value: number;
  recorded_at: string;
  synced: boolean;
}

export interface SensorDailyStats {
  stat_id: Uuid;
  device_id: Uuid;
  stat_date: string;
  min_value: number | null;
  max_value: number | null;
  avg_value: number | null;
  total_records: number;
  created_at: string;
}

export interface ZoneThreshold {
  threshold_id: Uuid;
  zone_id: Uuid;
  metric_type: "temperature" | "humidity_air" | "humidity_soil" | "light";
  min_value: number | null;
  max_value: number | null;
  updated_at: string;
}

export interface AlertRule {
  alert_rule_id: Uuid;
  rule_name: string;
  plant_type_id: Uuid | null;
  zone_id: Uuid | null;
  severity: "info" | "warning" | "critical";
  message_template: string | null;
  is_active: boolean;
  created_by: Uuid | null;
  created_at: string;
}

export interface AlertRuleCondition {
  condition_id: Uuid;
  alert_rule_id: Uuid;
  metric_type: string;
  operator: "<" | ">" | "<=" | ">=" | "==";
  threshold_value: number;
  logic_group: "AND" | "OR";
}

export interface AlertAction {
  action_id: Uuid;
  alert_rule_id: Uuid;
  device_id: Uuid | null;
  command_type: string | null;
  parameters: Record<string, unknown> | null;
  execution_order: number;
}

export interface Alert {
  alert_id: Uuid;
  alert_rule_id: Uuid | null;
  zone_id: Uuid | null;
  status: "detected" | "processing" | "resolved";
  sensor_snapshot: Record<string, unknown> | null;
  triggered_at: string;
  resolved_at: string | null;
  resolved_by: Uuid | null;
}

export interface AlertHandlingLog {
  handling_log_id: Uuid;
  alert_id: Uuid;
  handled_by: Uuid | null;
  action_taken: string | null;
  notes: string | null;
  created_at: string;
}

export interface DeviceCommand {
  command_id: Uuid;
  device_id: Uuid;
  command_type: string;
  parameters: Record<string, unknown> | null;
  status: "pending" | "sent" | "executed" | "failed";
  issued_by: Uuid | null;
  issued_at: string;
  executed_at: string | null;
}

export interface Schedule {
  schedule_id: Uuid;
  zone_id: Uuid;
  device_id: Uuid | null;
  schedule_name: string | null;
  execution_mode: "manual" | "automatic" | "threshold_based";
  schedule_type: "once" | "hourly" | "daily" | "weekly" | null;
  start_time: string | null;
  end_time: string | null;
  day_of_week: number | null;
  duration_seconds: number | null;
  is_active: boolean;
  created_by: Uuid | null;
  created_at: string;
  updated_at: string;
}

export interface WateringMode {
  watering_mode_id: Uuid;
  zone_id: Uuid;
  mode: "auto_sensor" | "scheduled" | "manual";
  trigger_threshold_soil_moisture: number | null;
  updated_at: string;
}

export interface AutomationRule {
  automation_rule_id: Uuid;
  rule_name: string;
  zone_id: Uuid | null;
  plant_type_id: Uuid | null;
  is_active: boolean;
  priority: number;
  cooldown_minutes: number;
  last_triggered_at: string | null;
  created_by: Uuid | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationCondition {
  condition_id: Uuid;
  automation_rule_id: Uuid;
  metric_type: string;
  operator: "<" | ">" | "<=" | ">=" | "==";
  threshold_value: number;
  logic_group: "AND" | "OR";
}

export interface AutomationAction {
  action_id: Uuid;
  automation_rule_id: Uuid;
  device_id: Uuid | null;
  command_type: string | null;
  parameters: Record<string, unknown> | null;
  execution_order: number;
}

export interface AiDetectionEvent {
  event_id: Uuid;
  zone_id: Uuid | null;
  detection_type: "plant_anomaly" | "fruit_classification" | null;
  image_path: string | null;
  result_label: string | null;
  confidence: number | null;
  details: Record<string, unknown> | null;
  alert_id: Uuid | null;
  detected_by_user: Uuid | null;
  created_at: string;
}

export interface AgriculturalReport {
  report_id: Uuid;
  zone_id: Uuid | null;
  report_type: string | null;
  date_from: string | null;
  date_to: string | null;
  content: Record<string, unknown> | null;
  export_file_path: string | null;
  generated_by: Uuid | null;
  created_at: string;
}

export interface SystemLog {
  log_id: Uuid;
  user_id: Uuid | null;
  action_type: string;
  entity_type: string | null;
  entity_id: Uuid | null;
  description: string | null;
  value_before: Record<string, unknown> | null;
  value_after: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface Notification {
  notification_id: Uuid;
  user_id: Uuid;
  alert_id: Uuid | null;
  channel: "dashboard" | "web_push" | "mobile_push";
  title: string | null;
  body: string | null;
  is_read: boolean;
  sent_at: string;
  read_at: string | null;
}

export interface DataBackup {
  backup_id: Uuid;
  backup_type: "manual" | "automatic" | null;
  schedule_type: string | null;
  file_path: string | null;
  file_size_bytes: number | null;
  status: "pending" | "running" | "completed" | "failed";
  created_by: Uuid | null;
  created_at: string;
  completed_at: string | null;
  notes: string | null;
}

export interface DataRestoration {
  restore_id: Uuid;
  backup_id: Uuid | null;
  restored_by: Uuid | null;
  status: "running" | "completed" | "failed";
  started_at: string;
  completed_at: string | null;
  notes: string | null;
}

export interface GatewaySyncQueue {
  sync_id: Uuid;
  device_id: Uuid;
  payload: Record<string, unknown>;
  recorded_at: string;
  synced: boolean;
  synced_at: string | null;
}

export interface ZoneCurrentSensorValue {
  zone_id: Uuid;
  zone_name: string;
  farm_id: Uuid;
  device_id: Uuid;
  device_name: string;
  device_code: string;
  sensor_type: string;
  unit: string | null;
  current_value: number;
  recorded_at: string;
}
