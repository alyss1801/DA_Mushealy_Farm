"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { USE_MOCK } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import type { Alert } from "@/types";

interface AlertRow {
  alert_id: string;
  zone_id?: string;
  status: "detected" | "processing" | "resolved";
  triggered_at: string;
}

export function useRealtimeAlerts(zoneId?: string) {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const addToast = useAppStore((state) => state.addToast);

  useEffect(() => {
    if (USE_MOCK) return;

    const channel = supabase
      .channel(`alerts_${zoneId ?? "all"}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, (payload) => {
        const row = payload.new as AlertRow;
        if (zoneId && row.zone_id !== zoneId) return;

        setAlerts((current) => [row, ...current]);

        addToast({
          type: "warning",
          message: `New alert detected (${row.status})`,
        });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [zoneId, addToast]);

  const unreadCount = useMemo(
    () => alerts.filter((item) => item.status === "detected" || item.status === "processing").length,
    [alerts],
  );

  const mappedAlerts: Alert[] = alerts.map((item) => ({
    id: item.alert_id,
    gardenId: item.zone_id ?? "",
    gardenName: "Realtime zone",
    severity: item.status === "detected" ? "high" : "medium",
    status: item.status === "resolved" ? "RESOLVED" : item.status === "processing" ? "PROCESSING" : "DETECTED",
    message: "Realtime alert",
    detectedAt: item.triggered_at,
  }));

  return {
    alerts: mappedAlerts,
    unreadCount,
  };
}
