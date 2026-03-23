import type { Farm, CropType, Garden, PlantTypeInfo, ZoneThresholds } from "@/types";
import { cropTypeSeeds } from "@/lib/cropThresholds";

export const farms: Farm[] = [
  {
    id: "f1",
    name: "Nông trại Long An",
    location: "Bến Lức, Long An",
    ownerId: "u2",
    createdAt: "2025-10-01T08:00:00.000Z",
    status: "active",
    description: "Trang trại trọng điểm khu vực miền Nam",
  },
  {
    id: "f2",
    name: "Nông trại Đức Hòa",
    location: "Đức Hòa, Long An",
    ownerId: "u3",
    createdAt: "2025-12-01T08:00:00.000Z",
    status: "warning",
    description: "Cụm thử nghiệm tự động hóa nhà kính",
  },
];

export const cropTypes: CropType[] = [
  {
    id: "crop_cai_xanh",
    name: "Cải Xanh",
    thresholdsJson: {
      temperature: {
        min: cropTypeSeeds.find((crop) => crop.id === "crop_cai_xanh")?.thresholds.find((item) => item.sensor_type === "temperature")?.optimal_min ?? 15,
        max: cropTypeSeeds.find((crop) => crop.id === "crop_cai_xanh")?.thresholds.find((item) => item.sensor_type === "temperature")?.optimal_max ?? 18,
      },
      humidityAir: { min: 60, max: 80 },
      humiditySoil: {
        min: cropTypeSeeds.find((crop) => crop.id === "crop_cai_xanh")?.thresholds.find((item) => item.sensor_type === "humidity_soil")?.optimal_min ?? 50,
        max: cropTypeSeeds.find((crop) => crop.id === "crop_cai_xanh")?.thresholds.find((item) => item.sensor_type === "humidity_soil")?.optimal_max ?? 70,
      },
      light: {
        min: (cropTypeSeeds.find((crop) => crop.id === "crop_cai_xanh")?.thresholds.find((item) => item.sensor_type === "light_hours")?.optimal_min ?? 4) * 3600,
        max: (cropTypeSeeds.find((crop) => crop.id === "crop_cai_xanh")?.thresholds.find((item) => item.sensor_type === "light_hours")?.optimal_max ?? 6) * 3600,
      },
    },
    wateringScheduleJson: { morning: "06:00", afternoon: "17:30" },
  },
  {
    id: "crop_ca_chua",
    name: "Cà Chua",
    thresholdsJson: {
      temperature: {
        min: cropTypeSeeds.find((crop) => crop.id === "crop_ca_chua")?.thresholds.find((item) => item.sensor_type === "temperature")?.optimal_min ?? 22,
        max: cropTypeSeeds.find((crop) => crop.id === "crop_ca_chua")?.thresholds.find((item) => item.sensor_type === "temperature")?.optimal_max ?? 26,
      },
      humidityAir: { min: 45, max: 75 },
      humiditySoil: {
        min: cropTypeSeeds.find((crop) => crop.id === "crop_ca_chua")?.thresholds.find((item) => item.sensor_type === "humidity_soil")?.optimal_min ?? 60,
        max: cropTypeSeeds.find((crop) => crop.id === "crop_ca_chua")?.thresholds.find((item) => item.sensor_type === "humidity_soil")?.optimal_max ?? 85,
      },
      light: {
        min: (cropTypeSeeds.find((crop) => crop.id === "crop_ca_chua")?.thresholds.find((item) => item.sensor_type === "light_hours")?.optimal_min ?? 6) * 3600,
        max: (cropTypeSeeds.find((crop) => crop.id === "crop_ca_chua")?.thresholds.find((item) => item.sensor_type === "light_hours")?.optimal_max ?? 8) * 3600,
      },
    },
    wateringScheduleJson: { morning: "07:00", afternoon: "17:00" },
  },
  {
    id: "crop_nha_dam",
    name: "Nha Đam",
    thresholdsJson: {
      temperature: {
        min: cropTypeSeeds.find((crop) => crop.id === "crop_nha_dam")?.thresholds.find((item) => item.sensor_type === "temperature")?.optimal_min ?? 20,
        max: cropTypeSeeds.find((crop) => crop.id === "crop_nha_dam")?.thresholds.find((item) => item.sensor_type === "temperature")?.optimal_max ?? 25,
      },
      humidityAir: { min: 35, max: 70 },
      humiditySoil: {
        min: cropTypeSeeds.find((crop) => crop.id === "crop_nha_dam")?.thresholds.find((item) => item.sensor_type === "humidity_soil")?.optimal_min ?? 40,
        max: cropTypeSeeds.find((crop) => crop.id === "crop_nha_dam")?.thresholds.find((item) => item.sensor_type === "humidity_soil")?.optimal_max ?? 50,
      },
      light: {
        min: (cropTypeSeeds.find((crop) => crop.id === "crop_nha_dam")?.thresholds.find((item) => item.sensor_type === "light_hours")?.optimal_min ?? 6) * 3600,
        max: (cropTypeSeeds.find((crop) => crop.id === "crop_nha_dam")?.thresholds.find((item) => item.sensor_type === "light_hours")?.optimal_max ?? 8) * 3600,
      },
    },
    wateringScheduleJson: { morning: "07:00", afternoon: "10:00" },
  },
];

export const gardens: Garden[] = [
  {
    id: "g1",
    farmId: "f1",
    cropTypeId: "crop_cai_xanh",
    name: "Vườn Cải Xanh",
    plantType: "CAI_XANH",
    plantLabel: "Cải Xanh",
    color: "#1B4332",
    status: "OK",
    description: "Khu canh tác rau cải xanh hữu cơ",
    area: "500m²",
    areaM2: 500,
    createdAt: "2025-11-01T08:00:00.000Z",
  },
  {
    id: "g2",
    farmId: "f1",
    cropTypeId: "crop_ca_chua",
    name: "Vườn Cà Chua",
    plantType: "CA_CHUA",
    plantLabel: "Cà Chua",
    color: "#E67E22",
    status: "WARN",
    description: "Khu canh tác cà chua ghép",
    area: "750m²",
    areaM2: 750,
    createdAt: "2025-11-01T08:00:00.000Z",
  },
  {
    id: "g3",
    farmId: "f2",
    cropTypeId: "crop_nha_dam",
    name: "Vườn Nha Đam",
    plantType: "NHA_DAM",
    plantLabel: "Nha Đam",
    color: "#2980B9",
    status: "OK",
    description: "Khu canh tác nha đam xuất khẩu",
    area: "300m²",
    areaM2: 300,
    createdAt: "2025-11-15T08:00:00.000Z",
  },
];

export const plantTypeInfos: PlantTypeInfo[] = [
  {
    id: "CAI_XANH",
    label: "Cải Xanh",
    emoji: "🥬",
    description: "Rau cải xanh hữu cơ, ưa mát và ẩm",
    cycleDays: "45 ngày",
    optimalTemp: { min: 20, max: 28 },
    optimalAirHumidity: { min: 65, max: 80 },
    optimalSoilMoisture: { min: 60, max: 80 },
    optimalLight: { min: 8, max: 16 },
  },
  {
    id: "CA_CHUA",
    label: "Cà Chua",
    emoji: "🍅",
    description: "Cà chua ghép, cần nhiều ánh sáng và nước",
    cycleDays: "90–120 ngày",
    optimalTemp: { min: 22, max: 30 },
    optimalAirHumidity: { min: 50, max: 70 },
    optimalSoilMoisture: { min: 50, max: 70 },
    optimalLight: { min: 14, max: 22 },
  },
  {
    id: "NHA_DAM",
    label: "Nha Đam",
    emoji: "🌵",
    description: "Nha đam xuất khẩu, chịu hạn tốt",
    cycleDays: "12–18 tháng",
    optimalTemp: { min: 25, max: 35 },
    optimalAirHumidity: { min: 40, max: 65 },
    optimalSoilMoisture: { min: 30, max: 55 },
    optimalLight: { min: 8, max: 20 },
  },
];

export const zoneThresholds: ZoneThresholds[] = [
  { gardenId: "g1", temperature: { min: 18, max: 30 }, humidityAir: { min: 60, max: 85 }, humiditySoil: { min: 55, max: 85 }, light: { min: 5000, max: 20000 } },
  { gardenId: "g2", temperature: { min: 20, max: 35 }, humidityAir: { min: 45, max: 75 }, humiditySoil: { min: 40, max: 75 }, light: { min: 10000, max: 30000 } },
  { gardenId: "g3", temperature: { min: 22, max: 38 }, humidityAir: { min: 35, max: 70 }, humiditySoil: { min: 25, max: 60 }, light: { min: 5000, max: 25000 } },
];
