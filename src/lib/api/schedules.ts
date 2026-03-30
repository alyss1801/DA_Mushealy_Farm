import { supabase } from "@/lib/supabase";
import type { Schedule } from "@/lib/api/types";

export async function getSchedules(zoneId?: string): Promise<Schedule[]> {
  let query = supabase.from("schedules").select("*").order("created_at", { ascending: false });
  if (zoneId) query = query.eq("zone_id", zoneId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Schedule[];
}
