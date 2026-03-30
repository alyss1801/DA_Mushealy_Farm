import { supabase } from "@/lib/supabase";
import type { AutomationAction, AutomationCondition, AutomationRule } from "@/lib/api/types";

export async function getAutomationRules(zoneId?: string): Promise<AutomationRule[]> {
  let query = supabase
    .from("automation_rules")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: true });

  if (zoneId) query = query.eq("zone_id", zoneId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AutomationRule[];
}

export async function getAutomationConditions(ruleId: string): Promise<AutomationCondition[]> {
  const { data, error } = await supabase
    .from("automation_rule_conditions")
    .select("*")
    .eq("automation_rule_id", ruleId)
    .order("condition_id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AutomationCondition[];
}

export async function getAutomationActions(ruleId: string): Promise<AutomationAction[]> {
  const { data, error } = await supabase
    .from("automation_rule_actions")
    .select("*")
    .eq("automation_rule_id", ruleId)
    .order("execution_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AutomationAction[];
}
