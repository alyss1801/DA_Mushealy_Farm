import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const expected = process.env.INTERNAL_API_KEY;
  return Boolean(expected && authHeader === `Bearer ${expected}`);
}

export async function GET(request: Request, context: { params: { deviceCode: string } }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deviceCode = context.params.deviceCode;
  const supabase = createServiceRoleClient();

  const { data: device } = await supabase
    .from("devices")
    .select("device_id")
    .eq("device_code", deviceCode)
    .maybeSingle();

  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  const deviceId = String((device as { device_id: string }).device_id);

  const { data: command } = await supabase
    .from("device_commands")
    .select("command_id,command_type,parameters")
    .eq("device_id", deviceId)
    .eq("status", "pending")
    .order("issued_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!command) {
    return NextResponse.json({ command: null });
  }

  const commandId = String((command as { command_id: string }).command_id);
  await supabase
    .from("device_commands")
    .update({ status: "sent", executed_at: new Date().toISOString() })
    .eq("command_id", commandId);

  return NextResponse.json({
    command_id: commandId,
    command_type: (command as { command_type: string }).command_type,
    parameters: (command as { parameters: Record<string, unknown> | null }).parameters ?? {},
  });
}
