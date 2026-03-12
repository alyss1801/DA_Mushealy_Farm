"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/shared/index";
import { backupRecords } from "@/lib/mockData";
import { useAppStore } from "@/lib/store";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";
import type { BackupRecord } from "@/types";
import { DatabaseBackup, Download, HardDrive, RefreshCw, RotateCcw, TriangleAlert } from "lucide-react";

const statusVariant: Record<BackupRecord["status"], "ok" | "warn" | "danger" | "info"> = {
  success: "ok",
  failed: "danger",
  in_progress: "info",
};

const statusLabel: Record<BackupRecord["status"], string> = {
  success: "Thành công",
  failed: "Thất bại",
  in_progress: "Đang chạy",
};

const typeLabel: Record<BackupRecord["type"], string> = {
  manual: "Thủ công",
  auto: "Tự động",
};

export default function BackupPage() {
  const addToast = useAppStore((state) => state.addToast);
  const [records, setRecords] = useState<BackupRecord[]>(backupRecords);
  const [isRunningBackup, setIsRunningBackup] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalStorage = records
    .map((record) => Number.parseFloat(record.fileSize))
    .filter((size) => Number.isFinite(size))
    .reduce((sum, size) => sum + size, 0)
    .toFixed(1);

  const lastBackup = records[0];
  const failedCount = records.filter((record) => record.status === "failed").length;

  const handleManualBackup = () => {
    if (isRunningBackup) return;

    setIsRunningBackup(true);
    setProgress(12);

    const checkpoints = [28, 46, 72, 100];
    checkpoints.forEach((value, index) => {
      window.setTimeout(() => {
        setProgress(value);
      }, (index + 1) * 500);
    });

    window.setTimeout(() => {
      const createdAt = new Date().toISOString();
      const newRecord: BackupRecord = {
        id: `bk${Date.now()}`,
        type: "manual",
        status: "success",
        createdAt,
        fileSize: "14.6 MB",
        fileName: `backup_${createdAt.slice(0, 10).replaceAll("-", "")}_${createdAt.slice(11, 16).replace(":", "")}.sql.gz`,
        createdBy: "Nguyễn Văn An",
        note: "Backup thủ công từ giao diện quản trị",
      };

      setRecords((current) => [newRecord, ...current]);
      setIsRunningBackup(false);
      setProgress(0);
      addToast({ type: "success", message: "Đã tạo bản sao lưu mới" });
    }, 2500);
  };

  return (
    <div>
      <Topbar title="Sao lưu hệ thống" subtitle="Theo dõi bản sao lưu, dung lượng và thao tác khôi phục" />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: "Tổng bản sao lưu",
              value: `${records.length}`,
              note: `${records.filter((record) => record.status === "success").length} bản thành công`,
              icon: DatabaseBackup,
            },
            {
              label: "Lần sao lưu gần nhất",
              value: lastBackup ? timeAgo(lastBackup.createdAt) : "Chưa có",
              note: lastBackup ? formatDateTime(lastBackup.createdAt) : "Không có dữ liệu",
              icon: RefreshCw,
            },
            {
              label: "Dung lượng lưu trữ",
              value: `${totalStorage} MB`,
              note: "Tổng dung lượng file backup khả dụng",
              icon: HardDrive,
            },
            {
              label: "Bản lỗi cần kiểm tra",
              value: `${failedCount}`,
              note: failedCount > 0 ? "Nên rà soát lịch tự động và kết nối lưu trữ" : "Không có lỗi gần đây",
              icon: TriangleAlert,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="card p-5">
                <div className="w-10 h-10 rounded-[10px] bg-[#F0FAF3] flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#1B4332]" />
                </div>
                <p className="text-[0.75rem] uppercase tracking-wide font-semibold text-[#5C7A6A] mb-1">{item.label}</p>
                <p className="text-[1.75rem] leading-none font-bold text-[#1A2E1F] mb-2">{item.value}</p>
                <p className="text-[0.8125rem] text-[#5C7A6A]">{item.note}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-semibold text-[1rem] text-[#1A2E1F]">Sao lưu thủ công</h2>
                <p className="text-[0.8125rem] text-[#5C7A6A] mt-1">Tạo nhanh một bản snapshot dữ liệu hiện tại.</p>
              </div>
              <Badge variant="info">Admin</Badge>
            </div>

            <button onClick={handleManualBackup} disabled={isRunningBackup} className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
              <DatabaseBackup size={16} />
              {isRunningBackup ? "Đang sao lưu..." : "Tạo bản sao lưu mới"}
            </button>

            <div className="mt-4 rounded-[12px] bg-[#F7F8F6] p-4">
              <div className="flex items-center justify-between text-[0.8125rem] text-[#5C7A6A] mb-2">
                <span>Tiến độ</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#E2E8E4] overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-300", isRunningBackup ? "bg-[#1B4332]" : "bg-[#52B788]")}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[0.75rem] text-[#5C7A6A] mt-3">
                Hệ thống hiện hỗ trợ mô phỏng backup thủ công. Backend lưu trữ sẽ được nối ở giai đoạn triển khai sau.
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8E4] flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold text-[1rem] text-[#1A2E1F]">Lịch sử sao lưu</h2>
                <p className="text-[0.8125rem] text-[#5C7A6A] mt-1">Danh sách file backup gần nhất và trạng thái hoàn tất.</p>
              </div>
              <Badge variant="default">{records.length} bản ghi</Badge>
            </div>

            <table className="w-full">
              <thead className="bg-[#F7F8F6] border-b border-[#E2E8E4]">
                <tr>
                  {[
                    "Mã",
                    "Loại",
                    "Trạng thái",
                    "Thời gian",
                    "Dung lượng",
                    "Tệp sao lưu",
                    "Người tạo",
                    "Thao tác",
                  ].map((header) => (
                    <th key={header} className="text-left px-4 py-3 text-[0.6875rem] uppercase tracking-wide text-[#5C7A6A] font-semibold whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E4]">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-[#F7F8F6] transition-colors">
                    <td className="px-4 py-3 text-[0.75rem] font-mono text-[#5C7A6A]">{record.id.toUpperCase()}</td>
                    <td className="px-4 py-3"><Badge variant="default">{typeLabel[record.type]}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[record.status]}>{statusLabel[record.status]}</Badge></td>
                    <td className="px-4 py-3 text-[0.8125rem] text-[#5C7A6A] whitespace-nowrap">{formatDateTime(record.createdAt)}</td>
                    <td className="px-4 py-3 text-[0.8125rem] text-[#1A2E1F] whitespace-nowrap">{record.fileSize}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[0.8125rem] font-medium text-[#1A2E1F]">{record.fileName}</p>
                        {record.note && <p className="text-[0.75rem] text-[#5C7A6A] mt-0.5">{record.note}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[0.8125rem] text-[#5C7A6A] whitespace-nowrap">{record.createdBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToast({ type: "info", message: `Đã tải xuống ${record.fileName}` })}
                          className="px-2.5 py-2 rounded-[8px] border border-[#E2E8E4] text-[#1B4332] hover:bg-[#F0FAF3] transition-colors"
                          disabled={record.status !== "success"}
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => addToast({ type: "warning", message: `Đã gửi yêu cầu khôi phục từ ${record.id.toUpperCase()}` })}
                          className="px-2.5 py-2 rounded-[8px] border border-[#E2E8E4] text-[#1B4332] hover:bg-[#F0FAF3] transition-colors"
                          disabled={record.status !== "success"}
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}