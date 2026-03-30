import { supabase } from "@/lib/supabase";
import type { FarmZone, PlantType, ZoneThreshold } from "@/lib/api/types";

export async function getGardensByFarm(farmId: string): Promise<FarmZone[]> {
  const { data, error } = await supabase
    .from("farm_zones")
    .select("*")
    .eq("farm_id", farmId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as FarmZone[];
}

export async function getGardenById(zoneId: string): Promise<FarmZone | null> {
  const { data, error } = await supabase.from("farm_zones").select("*").eq("zone_id", zoneId).maybeSingle();
  if (error) throw error;
  return (data as FarmZone | null) ?? null;
}

export async function getPlantTypes(): Promise<PlantType[]> {
  const { data, error } = await supabase.from("plant_types").select("*").order("plant_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PlantType[];
}

export async function getZoneThresholds(zoneId: string): Promise<ZoneThreshold[]> {
  const { data, error } = await supabase.from("zone_thresholds").select("*").eq("zone_id", zoneId);
  if (error) throw error;
  return (data ?? []) as ZoneThreshold[];
}
