import { createServiceRoleClient } from "@/lib/supabase";
import { evaluateAlertRules } from "@/services/engine/alertEvaluator";
import { evaluateAutomationRules } from "@/services/engine/automationEvaluator";
import { getDeviceByFeed } from "@/services/ohstem/topicMapper";

const RANGE_BY_FEED: Record<string, { min: number; max: number }> = {
  v1: { min: -20, max: 80 },
  v2: { min: 0, max: 100 },
  v3: { min: 0, max: 100 },
  v4: { min: 0, max: 200000 },
  v5: { min: 0, max: 5000 },
};

function normalizeFeedKey(feedKey: string) {
  return feedKey.trim().toLowerCase();
}

function isValidValue(feedKey: string, value: number) {
  if (!Number.isFinite(value)) return false;
  const range = RANGE_BY_FEED[normalizeFeedKey(feedKey)];
  if (!range) return true;
  return value >= range.min && value <= range.max;
}

export async function ingestSensorData(feedKey: string, rawValue: string, recordedAt?: string) {
  const device = getDeviceByFeed(feedKey);
  if (!device) {
    throw new Error(`No mapped device for feed ${feedKey}`);
  }

  const value = Number(rawValue);
  if (!isValidValue(feedKey, value)) {
    throw new Error(`Invalid sensor value for ${feedKey}: ${rawValue}`);
  }

  const supabase = createServiceRoleClient();

  const { data: inserted, error: insertError } = await supabase
    .from("sensor_data")
    .insert({
      device_id: device.device_id,
      value,
      recorded_at: recordedAt ?? new Date().toISOString(),
      synced: true,
    })
    .select("sensor_data_id")
    .single();

  if (insertError) {
    throw insertError;
  }

  await supabase
    .from("devices")
    .update({ status: "online", last_updated: new Date().toISOString() })
    .eq("device_id", device.device_id);

  void evaluateAlertRules(device.device_id, value).catch((error) => {
    console.error("[ingest] evaluateAlertRules failed", error);
  });

  void evaluateAutomationRules(device.device_id, value).catch((error) => {
    console.error("[ingest] evaluateAutomationRules failed", error);
  });

  return inserted;
}
