export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.OHSTEM_USERNAME || process.env.OHSTEM_PASSWORD === undefined) return;

  const { getMqttClient } = await import("@/services/ohstem/mqttClient");
  const { ingestSensorData } = await import("@/services/ohstem/dataIngester");
  const { loadFeedMappings } = await import("@/services/ohstem/topicMapper");

  await loadFeedMappings();

  const client = getMqttClient();
  client.on("message", (topic, message) => {
    const feedKey = topic.split("/feeds/")[1];
    if (!feedKey) return;

    ingestSensorData(feedKey, message.toString()).catch((error) => {
      console.error("[instrumentation] failed to ingest mqtt data", error);
    });
  });
}
