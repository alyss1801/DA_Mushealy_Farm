import { useAppStore } from "@/lib/store";
import { buildFallbackSensorSummary } from "@/lib/gardenFallback";
import { cropTypeSeeds, getCropTypeSeedById, type CropType } from "@/lib/cropThresholds";
import * as mockApi from "@/lib/mockData";
import * as farmsApi from "@/lib/api/farms";
import * as gardensApi from "@/lib/api/gardens";
import * as devicesApi from "@/lib/api/devices";
import * as sensorDataApi from "@/lib/api/sensorData";
import * as alertsApi from "@/lib/api/alerts";
import * as schedulesApi from "@/lib/api/schedules";
import * as automationRulesApi from "@/lib/api/automationRules";
import * as usersApi from "@/lib/api/users";
import * as systemLogsApi from "@/lib/api/systemLogs";
import type { Garden, GardenSensorSummary } from "@/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const realApi = {
  ...farmsApi,
  ...gardensApi,
  ...devicesApi,
  ...sensorDataApi,
  ...alertsApi,
  ...schedulesApi,
  ...automationRulesApi,
  ...usersApi,
  ...systemLogsApi,
};

export const api = USE_MOCK ? mockApi : realApi;

export { USE_MOCK };
export * from "@/lib/api/types";

export function getCropTypes(): CropType[] {
  return cropTypeSeeds;
}

export function getCropTypeById(cropTypeId?: string): CropType | null {
  return getCropTypeSeedById(cropTypeId);
}

export function getGardenSensorSummary(garden: Garden): GardenSensorSummary {
  const sensorSummaries = useAppStore.getState().sensorSummaries;
  return sensorSummaries.find((summary) => summary.gardenId === garden.id)
    ?? buildFallbackSensorSummary(garden.id, garden.plantType);
}
