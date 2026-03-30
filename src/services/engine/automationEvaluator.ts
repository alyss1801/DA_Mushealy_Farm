import { createServiceRoleClient } from "@/lib/supabase";
import type { AutomationAction, AutomationCondition, AutomationRule, Device, FarmZone } from "@/lib/api/types";
import { evaluateConditions, type SensorSnapshot } from "@/services/engine/ruleEngine";
import { publishCommand } from "@/services/ohstem/mqttClient";

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
  const { data } = await supabase
    .from("devices")
    .select("ohstem_feed_key,device_id")
    .eq("zone_id", zoneId);

  const snapshot: SensorSnapshot = {};

  for (const device of data ?? []) {
    const row = device as Device;
    const metric = deviceMetricFromFeed(row.ohstem_feed_key);
    if (!metric) continue;

    const { data: reading } = await supabase
      .from("sensor_data")
      .select("value")
      .eq("device_id", row.device_id)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reading) snapshot[metric] = Number((reading as { value: number }).value);
  }

  return snapshot;
}

export async function evaluateAutomationRules(deviceId: string, newValue: number) {
  const supabase = createServiceRoleClient();

  const { data: deviceData } = await supabase.from("devices").select("*").eq("device_id", deviceId).maybeSingle();
  const device = (deviceData ?? null) as Device | null;
  if (!device?.zone_id) return;

  const { data: zoneData } = await supabase.from("farm_zones").select("*").eq("zone_id", device.zone_id).maybeSingle();
  const zone = (zoneData ?? null) as FarmZone | null;

  const snapshot = await buildSnapshot(device.zone_id);

  let rulesQuery = supabase
    .from("automation_rules")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: true });

  rulesQuery = rulesQuery.or(`zone_id.eq.${device.zone_id}${zone?.plant_type_id ? `,plant_type_id.eq.${zone.plant_type_id}` : ""}`);

  const { data: rules } = await rulesQuery;
  if (!rules) return;

  for (const rule of rules as AutomationRule[]) {
    if (rule.last_triggered_at) {
      const elapsedMs = Date.now() - new Date(rule.last_triggered_at).getTime();
      const cooldownMs = Math.max(rule.cooldown_minutes, 0) * 60 * 1000;
      if (elapsedMs < cooldownMs) continue;
    }

    const [{ data: conditions }, { data: actions }] = await Promise.all([
      supabase.from("automation_rule_conditions").select("*").eq("automation_rule_id", rule.automation_rule_id),
      supabase.from("automation_rule_actions").select("*").eq("automation_rule_id", rule.automation_rule_id).order("execution_order"),
    ]);

    const pass = evaluateConditions((conditions ?? []) as AutomationCondition[], snapshot);
    if (!pass) continue;

    await supabase
      .from("automation_rules")
      .update({ last_triggered_at: new Date().toISOString() })
      .eq("automation_rule_id", rule.automation_rule_id);

    await supabase.from("system_logs").insert({
      action_type: "AUTOMATION_TRIGGERED",
      entity_type: "automation_rule",
      entity_id: rule.automation_rule_id,
      description: `Automation ${rule.rule_name} triggered at value ${newValue}`,
      value_after: snapshot,
    });

    for (const action of (actions ?? []) as AutomationAction[]) {
      await supabase.from("device_commands").insert({
        device_id: action.device_id,
        command_type: action.command_type,
        parameters: action.parameters,
        status: "pending",
      });

      if (!action.device_id) continue;

      const { data: targetDevice } = await supabase
        .from("devices")
        .select("ohstem_feed_key")
        .eq("device_id", action.device_id)
        .maybeSingle();

      const feedKey = (targetDevice as { ohstem_feed_key?: string } | null)?.ohstem_feed_key;
      if (!feedKey) continue;

      const value = typeof action.parameters?.value === "number" || typeof action.parameters?.value === "string"
        ? action.parameters.value
        : action.command_type ?? "1";

      publishCommand(feedKey, String(value));
    }
  }
}
