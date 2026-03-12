"use client";

import { useState } from "react";
import { CalendarClock, Plus, Repeat, X, Power } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { schedules, gardens } from "@/lib/mockData";
import { useAppStore } from "@/lib/store";
import { Badge, EmptyState } from "@/components/shared/index";
import { cn } from "@/lib/utils";

const repeatLabel = { once: "Một lần", daily: "Hàng ngày", weekly: "Hàng tuần" };
const repeatVariant = { once: "default", daily: "ok", weekly: "info" } as const;

const deviceTypeLabel: Record<string, string> = {
  pump:                 "Máy bơm",
  led_rgb:              "Đèn LED RGB",
  sensor_temp:          "Cảm biến Nhiệt độ",
  sensor_humidity_air:  "Cảm biến ĐA KK",
  sensor_humidity_soil: "Cảm biến ĐA Đất",
  sensor_light:         "Cảm biến Ánh sáng",
};

export default function SchedulesPage() {
  const storeDevices = useAppStore((s) => s.devices);
  const addToast     = useAppStore((s) => s.addToast);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    gardenId: "g1",
    deviceId: "",
    action: "ON" as "ON" | "OFF",
    date: new Date().toISOString().split("T")[0],
    startTime: "06:00",
    endTime: "06:30",
    repeat: "once" as "once" | "daily" | "weekly",
  });

  const controllableDevices = storeDevices.filter(
    (d) => (d.type === "pump" || d.type === "led_rgb") && d.gardenId === form.gardenId
  );

  const f = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    addToast({ type: "success", message: "Đã thêm lịch trình mới" });
    setShowModal(false);
  };

  const groupedByDate = schedules.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {} as Record<string, typeof schedules>);

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div>
      <Topbar title="Lịch trình" subtitle="Quản lý lịch tự động cho thiết bị" />

      <div className="p-8">
        <div className="flex justify-end mb-5">
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} />
            Thêm lịch trình
          </button>
        </div>

        {/* Days grouped */}
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const items = groupedByDate[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
            const dateObj = new Date(date + "T00:00:00");
            const label = dateObj.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

            return (
              <div key={date}>
                <h2 className="text-[0.875rem] font-semibold text-[#5C7A6A] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <CalendarClock size={14} />
                  {label}
                </h2>
                <div className="space-y-2">
                  {items.map((s) => {
                    const gardenColor = gardens.find((g) => g.id === s.gardenId)?.color ?? "#5C7A6A";
                    return (
                      <div key={s.id} className="card p-4 flex items-center gap-4 border-l-4" style={{ borderLeftColor: gardenColor }}>
                        {/* Time */}
                        <div className="text-center flex-shrink-0 w-14">
                          <p className="font-bold text-[1rem] text-[#1A2E1F]" style={{ fontFamily: "'DM Mono', monospace" }}>{s.startTime}</p>
                          {s.endTime && <p className="text-[0.6875rem] text-[#5C7A6A]">{s.endTime}</p>}
                        </div>

                        <div className="w-px h-10 bg-[#E2E8E4]" />

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-[0.9375rem] text-[#1A2E1F]">{s.deviceName}</p>
                            <span className={cn(
                              "text-[0.6875rem] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wide",
                              s.action === "ON" ? "bg-[#27AE60]/15 text-[#1B7A3F]" : "bg-[#C0392B]/15 text-[#9B1C1C]"
                            )}>
                              {s.action === "ON" ? "Bật" : "Tắt"}
                            </span>
                          </div>
                          <p className="text-[0.8125rem] text-[#5C7A6A]">{s.gardenName}</p>
                        </div>

                        {/* Repeat badge */}
                        <Badge variant={repeatVariant[s.repeat]}>
                          <Repeat size={10} className="mr-1" />
                          {repeatLabel[s.repeat]}
                        </Badge>

                        {/* Active indicator */}
                        <div className={cn("w-2 h-2 rounded-full", s.isActive ? "bg-[#27AE60]" : "bg-[#CBD5E1]")} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {schedules.length === 0 && (
          <EmptyState
            icon={CalendarClock}
            title="Chưa có lịch trình"
            description="Tạo lịch trình tự động để điều khiển thiết bị"
            action={{ label: "Thêm lịch trình", onClick: () => setShowModal(true) }}
          />
        )}
      </div>

      {/* ── Create Schedule Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[16px] shadow-[0_24px_80px_rgba(0,0,0,0.22)] w-full max-w-[520px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E2E8E4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[8px] bg-[#1B4332]/10 flex items-center justify-center">
                  <CalendarClock size={15} className="text-[#1B4332]" />
                </div>
                <h2 className="font-bold text-[1.125rem] text-[#1A2E1F]">Thêm lịch trình mới</h2>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C7A6A] hover:bg-[#F0F4F0] transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Garden select */}
              <div>
                <label className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-[#5C7A6A] mb-1.5">Khu vườn</label>
                <select className="input-field" value={form.gardenId}
                  onChange={(e) => { f("gardenId", e.target.value); f("deviceId", ""); }}>
                  {gardens.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              {/* Device select */}
              <div>
                <label className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-[#5C7A6A] mb-1.5">Thiết bị</label>
                <select className="input-field" value={form.deviceId} onChange={(e) => f("deviceId", e.target.value)}>
                  <option value="">— Chọn thiết bị —</option>
                  {controllableDevices.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({deviceTypeLabel[d.type]})</option>
                  ))}
                </select>
                {controllableDevices.length === 0 && (
                  <p className="text-[0.75rem] text-[#E67E22] mt-1">Khu vườn này không có thiết bị điều khiển được</p>
                )}
              </div>

              {/* Action toggle */}
              <div>
                <label className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-[#5C7A6A] mb-1.5">Hành động</label>
                <div className="flex gap-2">
                  {(["ON", "OFF"] as const).map((act) => (
                    <button key={act} onClick={() => f("action", act)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] border-2 text-[0.875rem] font-bold transition-all",
                        form.action === act
                          ? act === "ON" ? "bg-[#27AE60] border-[#27AE60] text-white" : "bg-[#C0392B] border-[#C0392B] text-white"
                          : "bg-[#F7F9F7] border-[#D1E8DC] text-[#5C7A6A] hover:border-[#1B4332]"
                      )}>
                      <Power size={14} />
                      {act === "ON" ? "Bật" : "Tắt"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date + Repeat */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-[#5C7A6A] mb-1.5">Ngày</label>
                  <input type="date" className="input-field" value={form.date} onChange={(e) => f("date", e.target.value)} />
                </div>
                <div>
                  <label className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-[#5C7A6A] mb-1.5">Lặp lại</label>
                  <select className="input-field" value={form.repeat} onChange={(e) => f("repeat", e.target.value)}>
                    <option value="once">Một lần</option>
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                  </select>
                </div>
              </div>

              {/* Start + End time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-[#5C7A6A] mb-1.5">Giờ bắt đầu</label>
                  <input type="time" className="input-field" value={form.startTime} onChange={(e) => f("startTime", e.target.value)} />
                </div>
                <div>
                  <label className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-[#5C7A6A] mb-1.5">Giờ kết thúc</label>
                  <input type="time" className="input-field" value={form.endTime} onChange={(e) => f("endTime", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 pb-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
              <button
                onClick={handleSave}
                disabled={!form.deviceId}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CalendarClock size={15} />
                Lưu lịch trình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
