import { supabase } from "@/lib/supabase";
import type { Farm, FarmUserAccess } from "@/lib/api/types";

export async function getFarms(): Promise<Farm[]> {
  const { data, error } = await supabase.from("farms").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Farm[];
}

export async function getFarmById(farmId: string): Promise<Farm | null> {
  const { data, error } = await supabase.from("farms").select("*").eq("farm_id", farmId).maybeSingle();
  if (error) throw error;
  return (data as Farm | null) ?? null;
}

export async function getFarmUserAccess(farmId: string): Promise<FarmUserAccess[]> {
  const { data, error } = await supabase.from("farm_user_access").select("*").eq("farm_id", farmId);
  if (error) throw error;
  return (data ?? []) as FarmUserAccess[];
}
