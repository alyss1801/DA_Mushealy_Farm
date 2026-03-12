"use client";

import { useState } from "react";
import { Power, Settings2, AlertTriangle, LogIn, LogOut, Plus, Trash2, Search, Filter } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { systemLogs } from "@/lib/mockData";
import { EmptyState } from "@/components/shared/index";
import { cn, timeAgo, formatDateTime } from "@/lib/utils";
import type { LogActionType } from "@/types";

const actionConfig: Record<LogActionType, { icon: typeof Power; color: string; bg: string; label: string }> = {
  DEVICE_TOGGLE: { icon: Power, color: "#1B4332", bg: "#F0FAF3", label: "Bật/Tắt thiết bị" },
  CONFIG_CHANGE: { icon: Settings2, color: "#2980B9", bg: "#EBF5FB", label: "Thay đổi cấu hình" },
  ALERT_ACTION: { icon: AlertTriangle, color: "#E67E22", bg: "#FEF9EE", label: "Xử lý cảnh báo" },
  USER_LOGIN: { icon: LogIn, color: "#27AE60", bg: "#DCFCE7", label: "Đăng nhập" },
  USER_LOGOUT: { icon: LogOut, color: "#5C7A6A", bg: "#F1F5F9", label: "Đăng xuất" },
  DEVICE_ADD: { icon: Plus, color: "#1B4332", bg: "#F0FAF3", label: "Thêm thiết bị" },
  DEVICE_REMOVE: { icon: Trash2, color: "#C0392B", bg: "#FEE2E2", label: "Xóa thiết bị" },
  SCHEDULE_CREATE: { icon: Power, color: "#F39C12", bg: "#FEF3C7", label: "Tạo lịch trình" },
};

export default function LogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<"all" | LogActionType>("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "7d" | "30d">("all");
  const sorted = [...systemLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const now = Date.now();
  const filtered = sorted.filter((log) => {
    const matchesSearch = !search || [log.description, log.userName, log.gardenName ?? ""].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || log.actionType === actionFilter;

    let matchesTime = true;
    const ageMs = now - new Date(log.timestamp).getTime();
    if (timeFilter === "today") matchesTime = ageMs <= 24 * 60 * 60 * 1000;
    if (timeFilter === "7d") matchesTime = ageMs <= 7 * 24 * 60 * 60 * 1000;
    if (timeFilter === "30d") matchesTime = ageMs <= 30 * 24 * 60 * 60 * 1000;

    return matchesSearch && matchesAction && matchesTime;
  });

  return (
    <div>
      <Topbar title="Nhật ký hệ thống" subtitle={`${filtered.length} / ${sorted.length} hoạt động đang hiển thị`} />

      <div className="p-8">
        <div className="card p-4 mb-5 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7A6A]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mô tả, người thao tác hoặc khu vườn"
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-[#5C7A6A]" />
              {[
                { id: "all", label: "Tất cả" },
                { id: "today", label: "Hôm nay" },
                { id: "7d", label: "7 ngày" },
                { id: "30d", label: "30 ngày" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTimeFilter(item.id as typeof timeFilter)}
                  className={cn(
                    "px-3 py-1.5 rounded-[20px] text-[0.8125rem] font-medium border transition-colors",
                    timeFilter === item.id
                      ? "bg-[#1B4332] text-white border-[#1B4332]"
                      : "bg-white text-[#5C7A6A] border-[#E2E8E4] hover:border-[#1B4332] hover:text-[#1B4332]"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActionFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-[20px] text-[0.8125rem] font-medium border transition-colors",
                actionFilter === "all"
                  ? "bg-[#1B4332] text-white border-[#1B4332]"
                  : "bg-white text-[#5C7A6A] border-[#E2E8E4] hover:border-[#1B4332] hover:text-[#1B4332]"
              )}
            >
              Tất cả hành động
            </button>
            {(Object.keys(actionConfig) as LogActionType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActionFilter(type)}
                className={cn(
                  "px-3 py-1.5 rounded-[20px] text-[0.8125rem] font-medium border transition-colors",
                  actionFilter === type
                    ? "bg-[#1B4332] text-white border-[#1B4332]"
                    : "bg-white text-[#5C7A6A] border-[#E2E8E4] hover:border-[#1B4332] hover:text-[#1B4332]"
                )}
              >
                {actionConfig[type].label}
              </button>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Không có nhật ký phù hợp"
              description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc thời gian/hành động."
            />
          ) : (
            <div className="divide-y divide-[#E2E8E4]">
              {filtered.map((log) => {
              const config = actionConfig[log.actionType];
              const Icon = config.icon;
              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#F7F8F6] transition-colors">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: config.bg }}
                  >
                    <Icon size={14} style={{ color: config.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[0.875rem] font-medium text-[#1A2E1F]">{log.description}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[0.75rem] text-[#5C7A6A]">{log.userName}</span>
                      {log.gardenName && <span className="text-[0.75rem] text-[#5C7A6A]">· {log.gardenName}</span>}
                    </div>
                    {log.oldValue && log.newValue && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[0.75rem] line-through text-[#C0392B] font-mono">{log.oldValue}</span>
                        <span className="text-[0.75rem] text-[#5C7A6A]">→</span>
                        <span className="text-[0.75rem] text-[#27AE60] font-bold font-mono">{log.newValue}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-[0.6875rem] text-[#5C7A6A]">{timeAgo(log.timestamp)}</p>
                    <p className="text-[0.625rem] text-[#5C7A6A]/60 mt-0.5">{formatDateTime(log.timestamp)}</p>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
