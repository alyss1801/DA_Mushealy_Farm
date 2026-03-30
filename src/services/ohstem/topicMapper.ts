import { createServiceRoleClient } from "@/lib/supabase";
import type { Device } from "@/lib/api/types";

let cache = new Map<string, Device>();
let refreshTimer: NodeJS.Timeout | null = null;

function normalizeFeedKey(feedKey: string) {
  return feedKey.trim().toLowerCase();
}

async function refreshMappings() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .not("ohstem_feed_key", "is", null);

  if (error) {
    console.error("[topicMapper] failed to refresh mappings", error);
    return;
  }

  const next = new Map<string, Device>();
  for (const row of (data ?? []) as Device[]) {
    if (!row.ohstem_feed_key) continue;
    next.set(normalizeFeedKey(row.ohstem_feed_key), row);
  }

  cache = next;
}

export async function loadFeedMappings() {
  await refreshMappings();

  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  refreshTimer = setInterval(() => {
    refreshMappings().catch((error) => {
      console.error("[topicMapper] periodic refresh error", error);
    });
  }, 5 * 60 * 1000);
}

export function getDeviceByFeed(feedKey: string): Device | null {
  const key = normalizeFeedKey(feedKey);
  return cache.get(key) ?? null;
}
