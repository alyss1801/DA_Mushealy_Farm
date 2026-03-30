import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { evaluateAlertRules } from "@/services/engine/alertEvaluator";
import { evaluateAutomationRules } from "@/services/engine/automationEvaluator";

type ReadingPayload = {
  device_code?: string;
  value?: number;
  recorded_at?: string;
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

  const body = (await request.json()) as ReadingPayload;
  if (!body.device_code || typeof body.value !== "number" || Number.isNaN(body.value)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const supabase = createServiceRoleClient();
  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select("device_id")
    .eq("device_code", body.device_code)
    .maybeSingle();

  if (deviceError) {
    return NextResponse.json({ error: "Unable to find device" }, { status: 500 });
  }

  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  const deviceId = String((device as { device_id: string }).device_id);

  const { data: inserted, error: insertError } = await supabase
    .from("sensor_data")
    .insert({
      device_id: deviceId,
      value: body.value,
      recorded_at: body.recorded_at ?? new Date().toISOString(),
      synced: true,
    })
    .select("sensor_data_id")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json({ error: "Unable to insert reading" }, { status: 500 });
  }

  await supabase
    .from("devices")
    .update({ status: "online", last_updated: new Date().toISOString() })
    .eq("device_id", deviceId);

  void evaluateAlertRules(deviceId, body.value).catch((error) => {
    console.error("[v1/readings] evaluateAlertRules failed", error);
  });

  void evaluateAutomationRules(deviceId, body.value).catch((error) => {
    console.error("[v1/readings] evaluateAutomationRules failed", error);
  });

  return NextResponse.json(
    {
      success: true,
      sensor_data_id: (inserted as { sensor_data_id: string }).sensor_data_id,
    },
    { status: 201 },
  );
}
