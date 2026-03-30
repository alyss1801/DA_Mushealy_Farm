"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { USE_MOCK } from "@/lib/api";

export interface RealtimeReading {
  deviceId: string;
  value: number;
  recordedAt: string;
}

export function useRealtimeSensor(zoneId?: string) {
  const [readings, setReadings] = useState<Record<string, RealtimeReading>>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (USE_MOCK) return;

    let mounted = true;
    const channel = supabase
      .channel(`sensor_data_${zoneId ?? "all"}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sensor_data" }, async (payload) => {
        const row = payload.new as { device_id?: string; value?: number; recorded_at?: string };
        if (!row.device_id) return;

        if (zoneId) {
          const { data } = await supabase
            .from("devices")
            .select("zone_id")
            .eq("device_id", row.device_id)
            .maybeSingle();
          if ((data as { zone_id?: string } | null)?.zone_id !== zoneId) return;
        }

        if (!mounted) return;

        setReadings((current) => ({
          ...current,
          [row.device_id as string]: {
            deviceId: row.device_id as string,
            value: Number(row.value ?? 0),
            recordedAt: row.recorded_at ?? new Date().toISOString(),
          },
        }));
        setLastUpdated(new Date().toISOString());
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [zoneId]);

  const readingsArray = useMemo(() => Object.values(readings), [readings]);

  return {
    readings: readingsArray,
    lastUpdated,
    isConnected,
    connectionStatus: isConnected ? "connected" : "disconnected",
  };
}
