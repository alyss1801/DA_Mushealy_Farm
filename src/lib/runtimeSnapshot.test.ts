import { describe, expect, it } from "vitest";
import {
  buildRuntimeImportPreview,
  createRuntimeSnapshotEnvelope,
  extractRuntimeSnapshot,
  normalizeRuntimeSnapshot,
  parseRuntimeSnapshotPayload,
  RUNTIME_SNAPSHOT_SCHEMA,
  RUNTIME_SNAPSHOT_VERSION,
  type RuntimeStateSnapshot,
} from "@/lib/runtimeSnapshot";

const defaults: RuntimeStateSnapshot = {
  farms: [{ id: "f0", name: "Default Farm", location: "N/A", ownerId: "u0", createdAt: "2026-01-01T00:00:00.000Z", status: "active" }],
  cropTypes: [],
  plantTypeInfos: [],
  gardens: [],
  devices: [],
  sensorSummaries: [],
  temperatureChartData: [],
  humidityAirChartData: [],
  humiditySoilChartData: [],
  lightChartData: [],
  alerts: [],
  alertRules: [],
  schedules: [],
  logs: [],
  backupRecords: [],
  aiAnalyses: [],
  users: [{ id: "u0", name: "Default User", email: "default@nongtech.vn", role: "ADMIN", assignedGardens: [], status: "active", createdAt: "2026-01-01T00:00:00.000Z" }],
};

describe("runtimeSnapshot", () => {
  it("normalizes missing fields from defaults", () => {
    const partial = { farms: [{ id: "f1", name: "Farm 1", location: "LA", ownerId: "u1", createdAt: "2026-01-01T00:00:00.000Z", status: "active" as const }] };
    const result = normalizeRuntimeSnapshot(partial, defaults);

    expect(result.farms).toHaveLength(1);
    expect(result.users).toHaveLength(1);
    expect(result.users[0].id).toBe("u0");
  });

  it("extracts from versioned envelope", () => {
    const envelope = createRuntimeSnapshotEnvelope(defaults, "1.2.3", "2026-03-23T08:00:00.000Z");
    const extracted = extractRuntimeSnapshot(envelope, defaults);

    expect(extracted.farms[0].id).toBe("f0");
    expect(extracted.users[0].id).toBe("u0");
  });

  it("supports legacy plain snapshot payload", () => {
    const legacyPayload = {
      farms: [{ id: "f_legacy", name: "Legacy", location: "N/A", ownerId: "u0", createdAt: "2026-01-01T00:00:00.000Z", status: "active" as const }],
      users: defaults.users,
    };
    const extracted = extractRuntimeSnapshot(legacyPayload, defaults);

    expect(extracted.farms[0].id).toBe("f_legacy");
    expect(extracted.alerts).toEqual([]);
  });

  it("builds preview warnings for future version and schema mismatch", () => {
    const payload = {
      version: RUNTIME_SNAPSHOT_VERSION + 1,
      snapshotMeta: { appVersion: "9.9.9", schema: "runtime-state-v2" },
      data: {
        farms: [{ id: "f1", name: "Farm", location: "N/A", ownerId: "u0", createdAt: "2026-01-01T00:00:00.000Z", status: "active" as const }],
        gardens: [],
        devices: [],
        alerts: [],
        users: defaults.users,
      },
    };

    const parsed = parseRuntimeSnapshotPayload(payload);
    expect(parsed).not.toBeNull();

    const preview = buildRuntimeImportPreview(parsed!);
    expect(preview.schema).toBe("runtime-state-v2");
    expect(preview.warnings.length).toBeGreaterThan(0);
    expect(preview.warnings.some((w) => w.includes(String(RUNTIME_SNAPSHOT_VERSION + 1)))).toBe(true);
  });

  it("creates envelope with snapshot meta", () => {
    const envelope = createRuntimeSnapshotEnvelope(defaults, "2.0.0", "2026-03-23T09:00:00.000Z");

    expect(envelope.version).toBe(RUNTIME_SNAPSHOT_VERSION);
    expect(envelope.snapshotMeta?.schema).toBe(RUNTIME_SNAPSHOT_SCHEMA);
    expect(envelope.snapshotMeta?.appVersion).toBe("2.0.0");
    expect(envelope.exportedAt).toBe("2026-03-23T09:00:00.000Z");
  });
});
