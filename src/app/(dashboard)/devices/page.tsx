"use client";

import { useState } from "react";
import { LayoutGrid, List, Cpu, Droplets, Lightbulb, Thermometer, Droplet, Sun, Filter, Plus, X } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useAppStore } from "@/lib/store";
import { StatusDot, Badge, EmptyState } from "@/components/shared/index";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";
import { cn, timeAgo } from "@/lib/utils";
import { gardens } from "@/lib/mockData";
import type { Device, DeviceType } from "@/types";

const deviceTypeLabel: Record<string, string> = {
  pump: "Máy bơm",
  led_rgb: "Đèn LED RGB",
  sensor_temp: "Cảm biến Nhiệt độ",
  sensor_humidity_air: "Cảm biến ĐA Không khí",
  sensor_humidity_soil: "Cảm biến ĐA Đất",
  sensor_light: "Cảm biến Ánh sáng",
};

const deviceTypeIcon: Record<string, typeof Cpu> = {
  pump: Droplets,
  led_rgb: Lightbulb,
  sensor_temp: Thermometer,
  sensor_humidity_air: Droplet,
  sensor_humidity_soil: Droplet,
  sensor_light: Sun,
};

type FilterType = "all" | "online" | "error" | string;

export default function DevicesPage() {
  const storeDevices = useAppStore((s) => s.devices);
  const toggleDevice = useAppStore((s) => s.toggleDevice);
  const addDevice = useAppStore((s) => s.addDevice);
  const addToast = useAppStore((s) => s.addToast);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "pump" as DeviceType,
    gardenId: gardens[0]?.id ?? "g1",
    description: "",
  });

  const filters = [
    { id: "all", label: "Tất cả", count: storeDevices.length },
    { id: "online", label: "Hoạt động", count: storeDevices.filter((d) => d.status === "online").length },
    { id: "error", label: "Lỗi / Offline", count: storeDevices.filter((d) => d.status !== "online").length },
    ...gardens.map((g) => ({ id: g.id, label: g.name, count: storeDevices.filter((d) => d.gardenId === g.id).length })),
  ];

  const filtered = storeDevices.filter((d) => {
    if (filter === "all") return true;
    if (filter === "online") return d.status === "online";
    if (filter === "error") return d.status !== "online";
    return d.gardenId === filter;
  });

  const handleToggle = (device: Device) => {
    if (device.type !== "pump" && device.type !== "led_rgb") return;
    toggleDevice(device.id);
    addToast({ type: "success", message: `${device.isOn ? "Đã tắt" : "Đã bật"} ${device.name}` });
  };

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateDevice = () => {
    const selectedGarden = gardens.find((garden) => garden.id === form.gardenId);
    if (!form.name.trim() || !selectedGarden) return;

    const controllable = form.type === "pump" || form.type === "led_rgb";
    addDevice({
      id: `d${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      gardenId: selectedGarden.id,
      gardenName: selectedGarden.name,
      status: "online",
      isOn: controllable,
      lastUpdated: new Date().toISOString(),
      description: form.description.trim() || undefined,
    });
    addToast({ type: "success", message: `Đã thêm thiết bị ${form.name.trim()}` });
    setShowModal(false);
    setForm({ name: "", type: "pump", gardenId: gardens[0]?.id ?? "g1", description: "" });
  };

  return (
    <div>
      <Topbar title="Thiết bị" subtitle={`${storeDevices.length} thiết bị — ${storeDevices.filter((d) => d.status === "online").length} đang hoạt động`} />
      <div className="p-8">
        {/* Filter + View toggle bar */}
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-[#5C7A6A]" />
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] text-[0.8125rem] font-medium transition-colors border",
                  filter === f.id
                    ? "bg-[#1B4332] text-white border-[#1B4332]"
                    : "bg-white text-[#5C7A6A] border-[#E2E8E4] hover:border-[#1B4332] hover:text-[#1B4332]"
                )}
              >
                {f.label}
                <span className={cn("text-[0.625rem] font-bold px-1.5 py-0.5 rounded-full",
                  filter === f.id ? "bg-white/20 text-white" : "bg-[#E2E8E4] text-[#5C7A6A]"
                )}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-3">
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={15} />
              Thêm thiết bị
            </button>
            <div className="flex rounded-[8px] border border-[#E2E8E4] overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={cn("p-2 transition-colors", view === "grid" ? "bg-[#1B4332] text-white" : "bg-white text-[#5C7A6A] hover:bg-[#F0FAF3]")}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn("p-2 transition-colors", view === "list" ? "bg-[#1B4332] text-white" : "bg-white text-[#5C7A6A] hover:bg-[#F0FAF3]")}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 && (
          <EmptyState icon={Cpu} title="Không có thiết bị" description="Không tìm thấy thiết bị nào phù hợp với bộ lọc." />
        )}

        {/* Grid View */}
        {view === "grid" && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((device) => {
              const Icon = deviceTypeIcon[device.type] ?? Cpu;
              const gardenColor = gardens.find((g) => g.id === device.gardenId)?.color ?? "#5C7A6A";
              const isControllable = device.type === "pump" || device.type === "led_rgb";

              return (
                <div key={device.id} className="card p-4 flex flex-col gap-3 border-l-4" style={{ borderLeftColor: gardenColor }}>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-[8px] bg-[#F0FAF3] flex items-center justify-center">
                      <Icon size={20} strokeWidth={1.5} className="text-[#1B4332]" />
                    </div>
                    <StatusDot status={device.status} />
                  </div>
                  <div>
                    <p className="font-semibold text-[0.875rem] text-[#1A2E1F] leading-tight">{device.name}</p>
                    <p className="text-[0.6875rem] text-[#5C7A6A] mt-0.5">{device.gardenName}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[0.6875rem] text-[#5C7A6A]">{timeAgo(device.lastUpdated)}</span>
                    {isControllable ? (
                      <ToggleSwitch
                        checked={device.isOn}
                        onChange={() => handleToggle(device)}
                        disabled={device.status !== "online"}
                        size="sm"
                      />
                    ) : (
                      <span className="text-[0.6875rem] font-bold" style={{ color: device.isOn ? "#27AE60" : "#CBD5E1" }}>
                        {device.isOn ? "LIVE" : "OFF"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {view === "list" && filtered.length > 0 && (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F7F8F6] border-b border-[#E2E8E4]">
                <tr>
                  {["ID", "Tên thiết bị", "Loại", "Khu vườn", "Trạng thái", "Cập nhật", "Điều khiển"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[0.6875rem] uppercase tracking-wide text-[#5C7A6A] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E4]">
                {filtered.map((device) => {
                  const isControllable = device.type === "pump" || device.type === "led_rgb";
                  return (
                    <tr key={device.id} className="hover:bg-[#F7F8F6] transition-colors">
                      <td className="px-4 py-3 text-[0.75rem] font-mono text-[#5C7A6A]">{device.id.toUpperCase()}</td>
                      <td className="px-4 py-3 text-[0.875rem] font-medium text-[#1A2E1F]">{device.name}</td>
                      <td className="px-4 py-3"><Badge variant="default">{deviceTypeLabel[device.type] ?? device.type}</Badge></td>
                      <td className="px-4 py-3 text-[0.875rem] text-[#5C7A6A]">{device.gardenName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusDot status={device.status} />
                          <span className="text-[0.8125rem] text-[#5C7A6A]">
                            {device.status === "online" ? "Trực tuyến" : device.status === "offline" ? "Ngoại tuyến" : "Lỗi"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[0.8125rem] text-[#5C7A6A] whitespace-nowrap">{timeAgo(device.lastUpdated)}</td>
                      <td className="px-4 py-3">
                        {isControllable ? (
                          <ToggleSwitch
                            checked={device.isOn}
                            onChange={() => handleToggle(device)}
                            disabled={device.status !== "online"}
                            size="sm"
                          />
                        ) : (
                          <span className="text-[0.75rem] text-[#5C7A6A]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative w-full max-w-[520px] rounded-[16px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E2E8E4]">
                <div>
                  <h2 className="font-bold text-[1.125rem] text-[#1A2E1F]">Thêm thiết bị mới</h2>
                  <p className="text-[0.8125rem] text-[#5C7A6A] mt-1">Khai báo nhanh thiết bị cho từng khu vườn.</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C7A6A] hover:bg-[#F0F4F0] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-[#5C7A6A] mb-1.5">Tên thiết bị</label>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Ví dụ: Máy bơm dự phòng Vườn 2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-[#5C7A6A] mb-1.5">Loại thiết bị</label>
                    <select className="input-field" value={form.type} onChange={(e) => updateForm("type", e.target.value as DeviceType)}>
                      {(Object.keys(deviceTypeLabel) as DeviceType[]).map((type) => (
                        <option key={type} value={type}>{deviceTypeLabel[type]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-[#5C7A6A] mb-1.5">Khu vườn</label>
                    <select className="input-field" value={form.gardenId} onChange={(e) => updateForm("gardenId", e.target.value)}>
                      {gardens.map((garden) => (
                        <option key={garden.id} value={garden.id}>{garden.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-[#5C7A6A] mb-1.5">Mô tả</label>
                  <textarea
                    className="input-field min-h-[110px] resize-none"
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    placeholder="Ghi chú vị trí lắp đặt, nhiệm vụ hoặc trạng thái mong muốn"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 px-6 pb-5">
                <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
                <button onClick={handleCreateDevice} disabled={!form.name.trim()} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus size={15} />
                  Lưu thiết bị
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
