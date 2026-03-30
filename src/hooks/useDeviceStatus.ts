"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { USE_MOCK } from "@/lib/api";

interface DeviceStatusState {
  deviceId: string;
  status: "online" | "offline" | "error";
  lastUpdated: string;
}

export function useDeviceStatus(zoneId?: string) {
  const [statuses, setStatuses] = useState<Record<string, DeviceStatusState>>({});

  useEffect(() => {
    if (USE_MOCK) return;

    let active = true;

    const channel = supabase
      .channel(`device_status_${zoneId ?? "all"}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "devices" }, async (payload) => {
        const row = payload.new as {
          device_id?: string;
          zone_id?: string;
          status?: "online" | "offline" | "error";
          last_updated?: string;
        };

        if (!row.device_id || !row.status) return;

        if (zoneId && row.zone_id !== zoneId) {
          return;
        }

        if (!active) return;

        setStatuses((current) => ({
          ...current,
          [row.device_id as string]: {
            deviceId: row.device_id as string,
            status: row.status as "online" | "offline" | "error",
            lastUpdated: row.last_updated ?? new Date().toISOString(),
          },
        }));
      })
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [zoneId]);

  return {
    statuses: useMemo(() => Object.values(statuses), [statuses]),
    byDeviceId: statuses,
  };
}
