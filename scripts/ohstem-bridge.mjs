import mqtt from "mqtt";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OHSTEM_USERNAME",
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`[bridge] Missing env: ${key}`);
    process.exit(1);
  }
}

if (process.env.OHSTEM_PASSWORD === undefined) {
  console.error("[bridge] Missing env: OHSTEM_PASSWORD (set empty string if account has no password)");
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let mapping = new Map();

async function refreshMapping() {
  const { data, error } = await supabase
    .from("devices")
    .select("device_id,ohstem_feed_key")
    .not("ohstem_feed_key", "is", null);

  if (error) {
    console.error("[bridge] mapping refresh failed", error.message);
    return;
  }

  const next = new Map();
  for (const row of data ?? []) {
    next.set(String(row.ohstem_feed_key).toLowerCase(), row.device_id);
  }

  mapping = next;
  console.log(`[bridge] mapping loaded: ${mapping.size} feeds`);
}

function normalizeFeed(topic) {
  const parts = topic.split("/feeds/");
  return parts[1] ? parts[1].toLowerCase() : null;
}

async function ingest(feedKey, payload) {
  const deviceId = mapping.get(feedKey);
  if (!deviceId) return;

  const value = Number(payload);
  if (Number.isNaN(value)) return;

  const { error: insertError } = await supabase.from("sensor_data").insert({
    device_id: deviceId,
    value,
    recorded_at: new Date().toISOString(),
    synced: true,
  });

  if (insertError) {
    console.error("[bridge] insert sensor_data failed", insertError.message);
    return;
  }

  await supabase
    .from("devices")
    .update({ status: "online", last_updated: new Date().toISOString() })
    .eq("device_id", deviceId);

  console.log(`[bridge] saved ${feedKey} => ${value}`);
}

await refreshMapping();
setInterval(() => {
  refreshMapping().catch((error) => {
    console.error("[bridge] periodic refresh error", error.message);
  });
}, 5 * 60 * 1000);

const broker = process.env.OHSTEM_BROKER_URL || "mqtt://mqtt.ohstem.vn";
const username = process.env.OHSTEM_USERNAME;
const password = process.env.OHSTEM_PASSWORD;

const client = mqtt.connect(broker, {
  username,
  password,
  reconnectPeriod: 5000,
  keepalive: 60,
});

client.on("connect", () => {
  const topic = `${username}/feeds/+`;
  client.subscribe(topic, (error) => {
    if (error) {
      console.error("[bridge] subscribe failed", error.message);
      return;
    }
    console.log(`[bridge] subscribed ${topic}`);
  });
});

client.on("message", (topic, message) => {
  const feedKey = normalizeFeed(topic);
  if (!feedKey) return;

  ingest(feedKey, message.toString()).catch((error) => {
    console.error("[bridge] ingest failed", error.message);
  });
});

client.on("error", (error) => {
  console.error("[bridge] mqtt error", error.message);
});
