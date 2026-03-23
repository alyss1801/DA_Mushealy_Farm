import Link from "next/link";
import { Clock3, Mail } from "lucide-react";

interface PendingPageProps {
  searchParams?: {
    email?: string;
  };
}

export default function PendingPage({ searchParams }: PendingPageProps) {
  const email = searchParams?.email ?? "";

  return (
    <div className="min-h-screen bg-[#F7F8F6] flex items-center justify-center p-4">
      <div className="w-full max-w-[520px] rounded-[16px] border border-[#E2E8E4] bg-white p-6 md:p-8">
        <div className="w-12 h-12 rounded-[10px] bg-[#FFF4E6] flex items-center justify-center mb-4">
          <Clock3 size={22} className="text-[#B85C00]" />
        </div>
        <h1 className="text-[1.5rem] font-bold text-[#1A2E1F]">Tài khoản đang chờ kích hoạt</h1>
        <p className="text-[0.875rem] text-[#5C7A6A] mt-2">
          Quản trị viên cần xác nhận quyền truy cập trước khi bạn có thể vào dashboard.
        </p>
        {email && (
          <div className="mt-4 rounded-[10px] border border-[#E2E8E4] bg-[#F7F8F6] px-3 py-2 text-[0.8125rem] text-[#1A2E1F]">
            Tài khoản: <span className="font-medium">{email}</span>
          </div>
        )}
        <div className="mt-6 flex items-center gap-2 text-[0.8125rem] text-[#5C7A6A]">
          <Mail size={14} />
          Liên hệ admin: admin@mushealy.vn
        </div>
        <div className="mt-6">
          <Link href="/login" className="btn-primary inline-flex">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
