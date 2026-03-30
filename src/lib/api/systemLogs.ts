import { supabase } from "@/lib/supabase";
import type { Notification, SystemLog } from "@/lib/api/types";

export async function getSystemLogs(limit = 100): Promise<SystemLog[]> {
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
  const { data, error } = await supabase
    .from("system_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) throw error;
  return (data ?? []) as SystemLog[];
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("sent_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Notification[];
}
