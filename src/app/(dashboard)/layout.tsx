"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastContainer } from "@/components/shared/ToastContainer";
import { FloatingChat } from "@/components/shared/FloatingChat";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeSensor } from "@/hooks/useRealtimeSensor";
import { useAppStore } from "@/lib/store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user: loggedInUser } = useAuth();
  const gardens = useAppStore((state) => state.gardens);
  const currentFarmId = useAppStore((state) => state.currentFarmId);
  const addToast = useAppStore((state) => state.addToast);

  const preferredZoneId = gardens.find((garden) => garden.farmId === currentFarmId)?.id;
  const { isConnected, lastUpdated } = useRealtimeSensor(preferredZoneId);

  useEffect(() => {
    if (isConnected) {
      addToast({ type: "success", message: "Da ket noi lai du lieu realtime" });
    }
  }, [isConnected, addToast]);

  useEffect(() => {
    if (!loggedInUser) {
      router.replace("/login");
    }
  }, [loggedInUser, router]);

  if (!loggedInUser) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F7F8F6] overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-64">
        <div className="h-12 border-b border-[#E2E8E4] bg-white/90 px-5 flex items-center justify-end">
          <div className="inline-flex items-center gap-2 text-[0.75rem] text-[#395947]">
            <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            {isConnected
              ? "Dang cap nhat"
              : `Cap nhat luc ${lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "--:--"}`}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
      <ToastContainer />
      {loggedInUser && <FloatingChat />}
    </div>
  );
}
