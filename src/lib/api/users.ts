import { supabase } from "@/lib/supabase";
import type { Role, User, UserSession } from "@/lib/api/types";

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as User[];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
  if (error) throw error;
  return (data as User | null) ?? null;
}

export async function getRoles(): Promise<Role[]> {
  const { data, error } = await supabase.from("roles").select("*").order("role_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Role[];
}

export async function getUserSessions(userId: string): Promise<UserSession[]> {
  const { data, error } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("login_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as UserSession[];
}
