# Mushealy — Smart Farm Management System

> **Branch:** `feat/iot-supabase-e2e` — Supabase backend + OhStem IoT integration

Hệ thống quản lý nông trại thông minh, xây dựng bằng **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **Zustand** và **Supabase PostgreSQL** backend.

---

## 🎯 Tính năng chính

- 🌿 **Dashboard giám sát realtime** — Cảm biến (nhiệt độ, độ ẩm, ánh sáng, GDD) cập nhật tức thì via Supabase
- 💧 **Điều khiển thiết bị IoT** — Bơm tưới thông minh qua OhStem MQTT (Pump 1 & 2)
- 📊 **Báo cáo & phân tích** — Lưu trữ lịch sử sensor data trên PostgreSQL
- 🤖 **Rule Engine + Automation** — Định luật tự động kích hoạt dựa trên ngưỡng cảm biến
- 📈 **Alert System** — Cảnh báo realtime khi vượt ngưỡng
- 🔐 **Row-Level Security (RLS)** — Phân quyền multi-tenant trên Supabase

---

## 📋 Kiến trúc

### Stack
| Lớp | Công nghệ |
|-----|-----------|
| **Frontend** | Next.js 14 (React 18 + TypeScript) |
| **Backend** | Next.js API Routes + Supabase PostgreSQL |
| **IoT** | OhStem MQTT (mqtt.ohstem.vn:1883) |
| **Realtime** | Supabase Realtime subscriptions |
| **State** | Zustand (client) |
| **Auth** | Supabase Auth (RLS-enabled) |

### IoT Bridge Architecture

```
OhStem MQTT (SmartFarm/feeds/+)
        ↓
Standalone Bridge (scripts/ohstem-bridge.mjs)
        ↓
Supabase PostgreSQL (sensor_data table, RLS)
        ↓
UI (useRealtimeSensor hook) + API REST
```

---

## 🚀 Bắt đầu

### 1. Clone & Setup

```bash
# Clone repository
git clone https://github.com/alyss1801/DA_Mushealy_Farm.git
cd nongtech

# Checkout branch
git checkout feat/iot-supabase-e2e

# Install dependencies
npm install
```

### 2. Cấu hình Environment

Copy `.env.local.example` → `.env.local` và điền thông tin:

```bash
cp .env.local.example .env.local
```

**File `.env.local` cần có:**

```env
# Supabase (Replace with your credentials)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=sb_secret_<your-service-role-key>

# IoT Bridge (OhStem SmartFarm)
OHSTEM_BROKER_URL=mqtt://mqtt.ohstem.vn:1883
OHSTEM_USERNAME=SmartFarm
OHSTEM_PASSWORD=
OHSTEM_TOPIC_PREFIX=SmartFarm/feeds

# API Authentication (32-byte hex key)
INTERNAL_API_KEY=<your-internal-api-key>
```

👉 **Lấy credentials từ Supabase project:**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Project Settings → API
3. Copy URL, Anon Key, Service Role Key vào `.env.local`

> **⚠️ Lưu ý:** Không commit `.env.local` — file này chứa secrets

### 3. Chạy ứng dụng

**Terminal 1 — Web Frontend:**
```bash
npm run dev
```
Truy cập: [http://localhost:3000](http://localhost:3000)

**Terminal 2 — IoT Bridge (MQTT Subscriber):**
```bash
npm run iot:bridge
```

Khi khởi động thành công, bạn sẽ thấy:
```
[bridge] mapping loaded: 7 feeds
[bridge] subscribed SmartFarm/feeds/+
[bridge] ready to ingest sensor data
```

---

## 📡 IoT Feed Mapping

Các feed từ OhStem được ánh xạ đến sensor_data table như sau:

| OhStem Feed | Tên Cảm biến | Đơn vị | Ghi chú |
|---|---|---|---|
| **V1** | Temperature (nhiệt độ) | °C | |
| **V2** | Humidity (độ ẩm) | % | |
| **V3** | Soil Moisture (độ ẩm đất) | % | |
| **V4** | LUX (ánh sáng) | Lux | |
| **V5** | GDD (Growing Degree Days) | °C·day | |
| **V10** | Pump 1 (bơm 1) | 0/1 | Thiết bị điều khiển (ON/OFF) |
| **V11** | Pump 2 (bơm 2) | 0/1 | Thiết bị điều khiển (ON/OFF) |

**Thiết lập trên bảng điều khiển:**
- Zone: **Zone A**
- Plant Type: **Ca chua** (Tomato)
- Device: **V1_smartfarm** → **V11_smartfarm** (tự động sinh từ seed data)

---

## 🔌 API Reference

### 1. Ingest Sensor Readings

**POST** `/api/v1/readings`

Request:
```json
{
  "device_code": "V1_smartfarm",
  "value": 28.5,
  "recorded_at": "2026-03-30T10:30:00Z"
}
```

Header:
```
Authorization: Bearer <INTERNAL_API_KEY>
```

Response (200 OK):
```json
{
  "ok": true,
  "reading_id": "uuid",
  "device_code": "V1_smartfarm",
  "value": 28.5
}
```

### 2. Get Device Status

**GET** `/api/v1/devices/status`

Response:
```json
{
  "devices": [
    {
      "device_code": "V1_smartfarm",
      "name": "Temperature",
      "is_online": true,
      "last_value": 28.5,
      "last_seen": "2026-03-30T10:35:00Z"
    }
  ]
}
```

### 3. Get Commands for Device

**GET** `/api/v1/commands/V10_smartfarm`

Response:
```json
{
  "commands": [
    {
      "id": "uuid",
      "device_code": "V10_smartfarm",
      "command_type": "PUMP_ON",
      "value": 1,
      "scheduled_at": "2026-03-30T14:00:00Z",
      "status": "PENDING"
    }
  ]
}
```

### 4. Health Check

**GET** `/api/v1/health`

Response:
```json
{
  "ok": true,
  "hasBrowserSupabase": true,
  "hasServiceRole": true,
  "hasIoTEnv": true,
  "timestamp": "2026-03-30T10:00:00Z"
}
```

---

## 🗄️ Database Schema

**33 Tables + RLS Policies:**
- `users`, `farms`, `zones`, `device_types`, `devices`
- `sensor_data`, `device_commands`, `device_status`
- `rules`, `automations`, `schedules`
- `alerts`, `alert_triggers`
- `activity_logs`, `audit_logs`
- + thêm các bảng hỗ trợ

**Migrations:**
- `001_initial_schema.sql` — Core tables + RLS policies
- `002_seed_data.sql` — Demo data (users, device types, plant types)
- `003_demo_iot_bootstrap.sql` — SmartFarm device mapping

Apply migrations (đã được deploy):
```bash
npx supabase migration list
```

---

## 🧪 Kiểm thử

### Unit Tests
```bash
npm run test
```
Kết quả: ✅ 5/5 tests passed

### Build Validation
```bash
npm run build
npm run lint
```
- ✅ Build: 26 routes, 87.5KB shared JS
- ✅ Lint: 0 errors, 0 warnings

### E2E Validation (Manual)
1. Chạy web + bridge (2 terminals)
2. Gửi MQTT message đến `SmartFarm/feeds/V1` (qua OhStem)
3. Xác nhận:
   - Bridge receives & logs message
   - sensor_data table updated
   - Dashboard widgets refresh realtime

---

## 📚 Key Files

| File | Mục đích |
|------|---------|
| `scripts/ohstem-bridge.mjs` | Standalone IoT bridge runner |
| `src/app/api/v1/readings/route.ts` | API ingest sensor data |
| `src/app/api/v1/health/route.ts` | Runtime env check |
| `src/services/ohstem/mqttClient.ts` | MQTT client factory |
| `src/services/engine/ruleEngine.ts` | Rule evaluation engine |
| `src/hooks/useRealtimeSensor.ts` | Realtime sensor subscription hook |
| `src/lib/supabase.ts` | Supabase client (browser + service role) |
| `supabase/migrations/` | Database schema + seed data |

---

## 🔧 Troubleshooting

### Bridge không kết nối MQTT
```
❌ [bridge] connection failed Error: Connection refused
```

**Giải pháp:**
- Kiểm tra OHSTEM_BROKER_URL, OHSTEM_USERNAME, OHSTEM_PASSWORD
- Kiểm tra mạng (SmartFarm account có password trống)

### Health endpoint báo missing env
```
❌ hasIoTEnv: false
```

**Giải pháp:**
- Đảm bảo `.env.local` có `OHSTEM_BROKER_URL` và `OHSTEM_USERNAME`
- OHSTEM_PASSWORD có thể để trống (SmartFarm không cần password)

### UI không cập nhật realtime
```
❌ Dashboard báo "No data"
```

**Giải pháp:**
1. Xác nhận bridge đang chạy: `npm run iot:bridge` (Terminal 2)
2. Kiểm tra Supabase auth: column name phải match feed mapping (V1_smartfarm, etc.)
3. Kiểm tra RLS policies enable trên Supabase console

### DB schema chưa applied
```
❌ [bridge] mapping refresh failed Could not find the table 'public.devices'
```

**Giải pháp:**
```bash
# Manual migration run (nếu chưa apply)
npx supabase db pull  # Check local
npx supabase migration list  # See remote status
```

---

## 📝 Demo Credentials

| Email | Mật khẩu | Vai trò |
|---|---|---|
| an.nguyen@nongtech.vn | 123456 | Admin |
| bich.tran@nongtech.vn | 123456 | Nông dân |
| cuong.le@nongtech.vn | 123456 | Nông dân |

> Ghi chú: Đây là mock local auth. Chuyển sang `NEXT_PUBLIC_AUTH_PROVIDER=supabase` trong production.

---

## 🔐 Security Notes

⚠️ **Secrets trong branch này chỉ dùng cho DEMO:**
- Supabase keys (`sb_publishable_*`, `sb_secret_*`) cần rotate
- INTERNAL_API_KEY nên thay đổi trước khi deploy production
- OHSTEM_PASSWORD trống (SmartFarm password-less mode)

**Production checklist:**
- [ ] Rotate Supabase keys
- [ ] Rotate INTERNAL_API_KEY
- [ ] Enable RLS on all tables
- [ ] Setup environment-specific .env (separate prod/staging)
- [ ] Backup Supabase database

---

## 📖 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OhStem MQTT API](https://ohstem.com)
- [Zustand State Management](https://github.com/pmndrs/zustand)

---

## 👨‍💻 Support & Contribution

**For CE/Hardware Engineer:**
- Check IoT feed mapping above (V1-V11)
- Ensure board publishes to `SmartFarm/feeds/<VFEED_NUMBER>`
- Run bridge in separate terminal: `npm run iot:bridge`
- Monitor logs for successful ingestion

**Submit issues:** Create PR against `feat/iot-supabase-e2e` branch

---

**Last Updated:** March 30, 2026  
**Repository:** https://github.com/alyss1801/DA_Mushealy_Farm  
**Branch:** feat/iot-supabase-e2e
