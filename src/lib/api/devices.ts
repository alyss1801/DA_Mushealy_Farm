import { supabase } from "@/lib/supabase";
import type { Device, DeviceCommand, DeviceType } from "@/lib/api/types";

export async function getDevicesByZone(zoneId: string): Promise<Device[]> {
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("zone_id", zoneId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Device[];
}

export async function getDeviceByCode(deviceCode: string): Promise<Device | null> {
  const { data, error } = await supabase.from("devices").select("*").eq("device_code", deviceCode).maybeSingle();
  if (error) throw error;
  return (data as Device | null) ?? null;
}

export async function getDeviceTypes(): Promise<DeviceType[]> {
  const { data, error } = await supabase.from("device_types").select("*").order("type_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DeviceType[];
}

export async function getPendingCommandByDevice(deviceId: string): Promise<DeviceCommand | null> {
  const { data, error } = await supabase
    .from("device_commands")
    .select("*")
    .eq("device_id", deviceId)
    .eq("status", "pending")
    .order("issued_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as DeviceCommand | null) ?? null;
}
