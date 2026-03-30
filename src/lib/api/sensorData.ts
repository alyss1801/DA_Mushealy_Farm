import { supabase } from "@/lib/supabase";
import type { SensorDailyStats, SensorData, ZoneCurrentSensorValue } from "@/lib/api/types";

export async function getLatestByZone(zoneId: string): Promise<ZoneCurrentSensorValue[]> {
  const { data, error } = await supabase
    .from("vw_zone_current_sensor_values")
    .select("*")
    .eq("zone_id", zoneId)
    .order("recorded_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ZoneCurrentSensorValue[];
}

export async function getReadingsByRange(deviceId: string, from: Date, to: Date): Promise<SensorData[]> {
  const { data, error } = await supabase
    .from("sensor_data")
    .select("*")
    .eq("device_id", deviceId)
    .gte("recorded_at", from.toISOString())
    .lte("recorded_at", to.toISOString())
    .order("recorded_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SensorData[];
}

export async function getDailyStats(deviceId: string, from: Date, to: Date): Promise<SensorDailyStats[]> {
  const { data, error } = await supabase
    .from("sensor_daily_statistics")
    .select("*")
    .eq("device_id", deviceId)
    .gte("stat_date", from.toISOString().slice(0, 10))
    .lte("stat_date", to.toISOString().slice(0, 10))
    .order("stat_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SensorDailyStats[];
}
