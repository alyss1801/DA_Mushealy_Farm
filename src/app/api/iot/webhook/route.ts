import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { ingestSensorData } from "@/services/ohstem/dataIngester";

type WebhookBody = {
  device_code?: string;
  value?: number | string;
  recorded_at?: string;
};

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected) return false;
  return authHeader === `Bearer ${expected}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as WebhookBody;
  if (!body.device_code || body.value === undefined) {
    return NextResponse.json({ error: "device_code and value are required" }, { status: 422 });
  }

  const supabase = createServiceRoleClient();
  const { data: device, error } = await supabase
    .from("devices")
    .select("ohstem_feed_key")
    .eq("device_code", body.device_code)
    .maybeSingle();

  if (error || !device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  const feedKey = (device as { ohstem_feed_key?: string }).ohstem_feed_key;
  if (!feedKey) {
    return NextResponse.json({ error: "Device does not have ohstem_feed_key" }, { status: 422 });
  }

  try {
    const payload = await ingestSensorData(feedKey, String(body.value), body.recorded_at);
    return NextResponse.json({ success: true, payload }, { status: 201 });
  } catch (ingestError) {
    console.error("[iot/webhook] failed", ingestError);
    return NextResponse.json({ error: "Unable to ingest sensor payload" }, { status: 500 });
  }
}
