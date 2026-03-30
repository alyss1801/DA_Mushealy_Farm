import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

type StatusPayload = {
  command_id?: string;
  status?: "executed" | "failed";
  executed_at?: string;
};

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const expected = process.env.INTERNAL_API_KEY;
  return Boolean(expected && authHeader === `Bearer ${expected}`);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as StatusPayload;
  if (!body.command_id || (body.status !== "executed" && body.status !== "failed")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("device_commands")
    .update({
      status: body.status,
      executed_at: body.executed_at ?? new Date().toISOString(),
    })
    .eq("command_id", body.command_id);

  if (error) {
    return NextResponse.json({ error: "Unable to update command" }, { status: 500 });
  }

  await supabase.from("system_logs").insert({
    action_type: "DEVICE_COMMAND_STATUS",
    entity_type: "device_command",
    entity_id: body.command_id,
    description: `Command ${body.command_id} marked as ${body.status}`,
  });

  return NextResponse.json({ success: true });
}
