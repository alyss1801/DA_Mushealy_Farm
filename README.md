# Mushealy — Smart Farm Management System

Hệ thống quản lý nông trại thông minh, xây dựng bằng **Next.js 14 App Router**, TypeScript, Tailwind CSS và Zustand.

### Tính năng chính
- 🌿 Dashboard giám sát cảm biến realtime (nhiệt độ, độ ẩm, ánh sáng, pH)
- 💧 Điều khiển thiết bị tưới tiêu thông minh
- 📊 Báo cáo & phân tích dữ liệu
- 🤖 AI chẩn đoán sức khỏe cây trồng
- 📅 Lịch chăm sóc tự động
- 🔐 Phân quyền ADMIN / FARMER

### Demo credentials
| Email | Mật khẩu | Vai trò |
|---|---|---|
| an.nguyen@nongtech.vn | 123456 | Admin |
| bich.tran@nongtech.vn | 123456 | Nông dân |
| cuong.le@nongtech.vn | 123456 | Nông dân |

Ghi chú:
- Tài khoản `dung.pham@nongtech.vn` đang ở trạng thái `inactive` nên sẽ bị chuyển qua trang chờ kích hoạt.
- Nếu bạn đã đổi mật khẩu trong màn Users, mật khẩu local sẽ ưu tiên theo dữ liệu đã lưu trong trình duyệt.

### Auth provider mode
- Mặc định app chạy auth local mock (không cần backend): `NEXT_PUBLIC_AUTH_PROVIDER=local`
- Kiến trúc đã có adapter để chuyển sang backend auth: `NEXT_PUBLIC_AUTH_PROVIDER=supabase`
- Nếu đặt `supabase` nhưng chưa tích hợp backend, login sẽ báo rõ trạng thái provider chưa cấu hình.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
