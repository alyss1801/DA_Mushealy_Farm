"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastContainer } from "@/components/shared/ToastContainer";
import { FloatingChat } from "@/components/shared/FloatingChat";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user: loggedInUser } = useAuth();

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
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
      <ToastContainer />
      {loggedInUser && <FloatingChat />}
    </div>
  );
}
