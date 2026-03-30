import { NextResponse } from "next/server";
import { hasServiceRoleConfig, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    ok: true,
    now: new Date().toISOString(),
    useMock: process.env.NEXT_PUBLIC_USE_MOCK === "true",
    hasBrowserSupabase: isSupabaseConfigured(),
    hasServiceRole: hasServiceRoleConfig(),
    hasIoTEnv: Boolean(process.env.OHSTEM_USERNAME && process.env.OHSTEM_PASSWORD !== undefined),
  });
}
