import { supabase } from "@/lib/supabase";
import type { Alert, AlertAction, AlertRule, AlertRuleCondition } from "@/lib/api/types";

export async function getAlerts(zoneId?: string): Promise<Alert[]> {
  let query = supabase.from("alerts").select("*").order("triggered_at", { ascending: false });
  if (zoneId) query = query.eq("zone_id", zoneId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Alert[];
}

export async function getActiveAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase.from("vw_active_alerts").select("*");
  if (error) throw error;
  return (data ?? []) as Alert[];
}

export async function getAlertRules(zoneId?: string): Promise<AlertRule[]> {
  let query = supabase.from("alert_rules").select("*").eq("is_active", true).order("created_at", { ascending: false });
  if (zoneId) query = query.eq("zone_id", zoneId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AlertRule[];
}

export async function getAlertRuleConditions(alertRuleId: string): Promise<AlertRuleCondition[]> {
  const { data, error } = await supabase
    .from("alert_rule_conditions")
    .select("*")
    .eq("alert_rule_id", alertRuleId)
    .order("condition_id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AlertRuleCondition[];
}

export async function getAlertActions(alertRuleId: string): Promise<AlertAction[]> {
  const { data, error } = await supabase
    .from("alert_actions")
    .select("*")
    .eq("alert_rule_id", alertRuleId)
    .order("execution_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AlertAction[];
}
