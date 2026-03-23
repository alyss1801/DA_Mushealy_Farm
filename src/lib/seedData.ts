import type { User } from "@/types";
import {
  devices,
  alerts,
  farms,
  cropTypes,
  gardens,
  plantTypeInfos,
  systemLogs,
  alertRules,
  schedules,
  users,
  aiAnalyses,
  backupRecords,
  sensorSummaries,
  temperatureChartData,
  humidityAirChartData,
  humiditySoilChartData,
  lightChartData,
} from "@/lib/mockData";

const useDemoData = process.env.NEXT_PUBLIC_USE_DEMO_DATA !== "false";

const minimalAdminUser: User = {
  id: "u_admin",
  name: "System Admin",
  email: "admin@nongtech.vn",
  role: "ADMIN",
  assignedGardens: [],
  assignedFarmIds: [],
  status: "active",
  createdAt: new Date().toISOString(),
};

export const seedDevices = useDemoData ? devices : [];
export const seedAlerts = useDemoData ? alerts : [];
export const seedFarms = useDemoData ? farms : [];
export const seedCropTypes = cropTypes;
export const seedGardens = useDemoData ? gardens : [];
export const seedPlantTypeInfos = plantTypeInfos;
export const seedSystemLogs = useDemoData ? systemLogs : [];
export const seedAlertRules = useDemoData ? alertRules : [];
export const seedSchedules = useDemoData ? schedules : [];
export const seedUsers = useDemoData ? users : [minimalAdminUser];
export const seedAiAnalyses = useDemoData ? aiAnalyses : [];
export const seedBackupRecords = useDemoData ? backupRecords : [];
export const seedSensorSummaries = useDemoData ? sensorSummaries : [];
export const seedTemperatureChartData = useDemoData ? temperatureChartData : [];
export const seedHumidityAirChartData = useDemoData ? humidityAirChartData : [];
export const seedHumiditySoilChartData = useDemoData ? humiditySoilChartData : [];
export const seedLightChartData = useDemoData ? lightChartData : [];

export const isDemoDataEnabled = useDemoData;
