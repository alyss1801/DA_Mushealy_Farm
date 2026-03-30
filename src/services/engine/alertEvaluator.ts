import { createServiceRoleClient } from "@/lib/supabase";
import type { AlertAction, AlertRule, AlertRuleCondition, Device, FarmZone, Notification } from "@/lib/api/types";
import { evaluateConditions, type SensorSnapshot } from "@/services/engine/ruleEngine";

function deviceMetricFromFeed(feedKey: string | null): keyof SensorSnapshot | null {
  const normalized = (feedKey ?? "").toUpperCase();
  if (normalized === "V1") return "temperature";
  if (normalized === "V2") return "humidity_air";
  if (normalized === "V3") return "humidity_soil";
  if (normalized === "V4") return "light";
  return null;
}

async function buildSnapshot(zoneId: string): Promise<SensorSnapshot> {
  const supabase = createServiceRoleClient();
  const { data: rows, error } = await supabase
    .from("vw_zone_current_sensor_values")
    .select("device_code,current_value")
    .eq("zone_id", zoneId);

  if (error) throw error;

  const snapshot: SensorSnapshot = {};
  for (const row of rows ?? []) {
    const code = String((row as Record<string, unknown>).device_code ?? "");
    const value = Number((row as Record<string, unknown>).current_value);
    const feed = code.split("_")[0] ?? code;
    const metric = deviceMetricFromFeed(feed);
    if (metric) snapshot[metric] = value;
  }

  return snapshot;
}

export async function evaluateAlertRules(deviceId: string, newValue: number) {
  const supabase = createServiceRoleClient();

  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select("*")
    .eq("device_id", deviceId)
    .maybeSingle();

  if (deviceError || !device) return;

  const typedDevice = device as Device;
  if (!typedDevice.zone_id) return;

  const { data: zoneData } = await supabase
    .from("farm_zones")
    .select("*")
    .eq("zone_id", typedDevice.zone_id)
    .maybeSingle();

  const zone = (zoneData ?? null) as FarmZone | null;
  const snapshot = await buildSnapshot(typedDevice.zone_id);

  let rulesQuery = supabase.from("alert_rules").select("*").eq("is_active", true);
  rulesQuery = rulesQuery.or(`zone_id.eq.${typedDevice.zone_id}${zone?.plant_type_id ? `,plant_type_id.eq.${zone.plant_type_id}` : ""}`);

  const { data: rules, error: rulesError } = await rulesQuery;
  if (rulesError || !rules) return;

  for (const rule of rules as AlertRule[]) {
    const [{ data: conditions }, { data: actions }] = await Promise.all([
      supabase.from("alert_rule_conditions").select("*").eq("alert_rule_id", rule.alert_rule_id),
      supabase.from("alert_actions").select("*").eq("alert_rule_id", rule.alert_rule_id).order("execution_order"),
    ]);

    const pass = evaluateConditions((conditions ?? []) as AlertRuleCondition[], snapshot);
    if (!pass) continue;

    const { data: existing } = await supabase
      .from("alerts")
      .select("alert_id")
      .eq("alert_rule_id", rule.alert_rule_id)
      .eq("zone_id", typedDevice.zone_id)
      .in("status", ["detected", "processing"])
      .limit(1);

    if ((existing ?? []).length > 0) continue;

    const { data: insertedAlert } = await supabase
      .from("alerts")
      .insert({
        alert_rule_id: rule.alert_rule_id,
        zone_id: typedDevice.zone_id,
        status: "detected",
        sensor_snapshot: snapshot,
      })
      .select("*")
      .single();

    if (!insertedAlert) continue;

    const { data: users } = await supabase
      .from("user_zone_access")
      .select("user_id")
      .eq("zone_id", typedDevice.zone_id);

    const notifications: Partial<Notification>[] = (users ?? []).map((u) => ({
      user_id: String((u as { user_id: string }).user_id),
      alert_id: String((insertedAlert as { alert_id: string }).alert_id),
      channel: "dashboard",
      title: `Alert: ${rule.rule_name}`,
      body: rule.message_template ?? "Threshold exceeded",
    }));

    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications);
    }

    for (const action of (actions ?? []) as AlertAction[]) {
      await supabase.from("device_commands").insert({
        device_id: action.device_id,
        command_type: action.command_type,
        parameters: action.parameters,
        status: "pending",
      });
    }

    await supabase.from("system_logs").insert({
      action_type: "ALERT_TRIGGERED",
      entity_type: "alert",
      entity_id: String((insertedAlert as { alert_id: string }).alert_id),
      description: `Alert ${rule.rule_name} triggered for zone ${typedDevice.zone_id} at value ${newValue}`,
      value_after: snapshot,
    });
  }
}
