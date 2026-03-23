import type { GardenSensorSummary, ChartDataPoint, AIAnalysis, BackupRecord } from "@/types";

export const sensorSummaries: GardenSensorSummary[] = [
  {
    gardenId: "g1",
    temperature: 26.4,
    humidityAir: 68,
    humiditySoil: 74,
    light: 12400,
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    gardenId: "g2",
    temperature: 32.1,
    humidityAir: 55,
    humiditySoil: 41,
    light: 18700,
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    gardenId: "g3",
    temperature: 28.8,
    humidityAir: 72,
    humiditySoil: 82,
    light: 9200,
    updatedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
];

function generateChartData(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    const timeLabel = `${hour.toString().padStart(2, "0")}:00`;
    const baseTemp = 20 + 8 * Math.sin((hour - 6) * Math.PI / 12);
    data.push({
      time: timeLabel,
      garden1: parseFloat((baseTemp + 1.5 + Math.random() * 2).toFixed(1)),
      garden2: parseFloat((baseTemp + 5.0 + Math.random() * 2).toFixed(1)),
      garden3: parseFloat((baseTemp + 3.0 + Math.random() * 2).toFixed(1)),
    });
  }
  return data;
}

function generateHumidityData(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    const timeLabel = `${hour.toString().padStart(2, "0")}:00`;
    data.push({
      time: timeLabel,
      garden1: parseFloat((70 + 10 * Math.sin(hour * Math.PI / 12) + Math.random() * 5).toFixed(1)),
      garden2: parseFloat((50 + 8 * Math.sin(hour * Math.PI / 12) + Math.random() * 5).toFixed(1)),
      garden3: parseFloat((78 + 6 * Math.sin(hour * Math.PI / 12) + Math.random() * 5).toFixed(1)),
    });
  }
  return data;
}

function generateSoilData(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    const timeLabel = `${hour.toString().padStart(2, "0")}:00`;
    let base1 = 70, base2 = 40; const base3 = 80;
    if (hour >= 6 && hour < 9) { base1 = 75 + (hour - 6) * 2; base2 = 45 + (hour - 6) * 2; }
    if (hour >= 16 && hour < 19) { base1 = 72 + (hour - 16) * 2; base2 = 43 + (hour - 16) * 2; }
    data.push({
      time: timeLabel,
      garden1: parseFloat((base1 + Math.random() * 4).toFixed(1)),
      garden2: parseFloat((base2 + Math.random() * 4).toFixed(1)),
      garden3: parseFloat((base3 + Math.random() * 3).toFixed(1)),
    });
  }
  return data;
}

function generateLightData(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    const timeLabel = `${hour.toString().padStart(2, "0")}:00`;
    const lightCurve = Math.max(0, 20000 * Math.sin((hour - 6) * Math.PI / 12));
    data.push({
      time: timeLabel,
      garden1: Math.round(lightCurve * 0.9 + Math.random() * 1000),
      garden2: Math.round(lightCurve * 1.1 + Math.random() * 1200),
      garden3: Math.round(lightCurve * 0.7 + Math.random() * 800),
    });
  }
  return data;
}

export const temperatureChartData = generateChartData();
export const humidityAirChartData = generateHumidityData();
export const humiditySoilChartData = generateSoilData();
export const lightChartData = generateLightData();

export const aiAnalyses: AIAnalysis[] = [
  {
    id: "ai1",
    imageUrl: "https://images.unsplash.com/photo-1560493676-04071185765c?w=300&q=80",
    gardenId: "g2",
    gardenName: "Vườn Cà Chua",
    result: "Vàng lá do thiếu nước",
    confidence: 87.3,
    recommendation: "Tăng lịch tưới lên 2 lần/ngày, kiểm tra hệ thống bơm",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ai2",
    imageUrl: "https://images.unsplash.com/photo-1595829279802-0dfd38c56e15?w=300&q=80",
    gardenId: "g1",
    gardenName: "Vườn Cải Xanh",
    result: "Cây phát triển bình thường",
    confidence: 94.1,
    recommendation: "Không cần can thiệp. Tiếp tục chế độ chăm sóc hiện tại.",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ai3",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&q=80",
    gardenId: "g3",
    gardenName: "Vườn Nha Đam",
    result: "Phát hiện dấu hiệu sâu bệnh nhẹ",
    confidence: 62.7,
    recommendation: "Phun thuốc trừ sâu sinh học, theo dõi trong 3 ngày tiếp theo",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const backupRecords: BackupRecord[] = [
  { id: "bk1", type: "auto", status: "success", createdAt: "2026-03-08T02:00:00.000Z", fileSize: "14.2 MB", fileName: "backup_20260308_0200.sql.gz", createdBy: "Hệ thống", note: "Backup tự động hàng ngày" },
  { id: "bk2", type: "manual", status: "success", createdAt: "2026-03-07T15:32:11.000Z", fileSize: "13.8 MB", fileName: "backup_20260307_1532.sql.gz", createdBy: "Nguyễn Văn An" },
  { id: "bk3", type: "auto", status: "success", createdAt: "2026-03-07T02:00:00.000Z", fileSize: "13.5 MB", fileName: "backup_20260307_0200.sql.gz", createdBy: "Hệ thống", note: "Backup tự động hàng ngày" },
  { id: "bk4", type: "auto", status: "failed", createdAt: "2026-03-06T02:00:00.000Z", fileSize: "—", fileName: "—", createdBy: "Hệ thống", note: "Lỗi kết nối database" },
  { id: "bk5", type: "manual", status: "success", createdAt: "2026-03-05T09:15:44.000Z", fileSize: "12.9 MB", fileName: "backup_20260305_0915.sql.gz", createdBy: "Nguyễn Văn An" },
  { id: "bk6", type: "auto", status: "success", createdAt: "2026-03-05T02:00:00.000Z", fileSize: "12.7 MB", fileName: "backup_20260305_0200.sql.gz", createdBy: "Hệ thống" },
  { id: "bk7", type: "auto", status: "success", createdAt: "2026-03-04T02:00:00.000Z", fileSize: "12.4 MB", fileName: "backup_20260304_0200.sql.gz", createdBy: "Hệ thống" },
];
