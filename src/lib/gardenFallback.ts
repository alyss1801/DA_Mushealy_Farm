import type { GardenSensorSummary, PlantType } from "@/types";

const plantBaseline: Record<PlantType, { temperature: number; humidityAir: number; humiditySoil: number; light: number }> = {
  CAI_XANH: { temperature: 26, humidityAir: 72, humiditySoil: 70, light: 13000 },
  CA_CHUA: { temperature: 29, humidityAir: 60, humiditySoil: 55, light: 18000 },
  NHA_DAM: { temperature: 31, humidityAir: 48, humiditySoil: 40, light: 16000 },
};

export function buildFallbackSensorSummary(gardenId: string, plantType?: PlantType): GardenSensorSummary {
  const baseline = plantType ? plantBaseline[plantType] : { temperature: 27, humidityAir: 62, humiditySoil: 58, light: 14000 };
  return {
    gardenId,
    temperature: baseline.temperature,
    humidityAir: baseline.humidityAir,
    humiditySoil: baseline.humiditySoil,
    light: baseline.light,
    updatedAt: new Date().toISOString(),
  };
}
