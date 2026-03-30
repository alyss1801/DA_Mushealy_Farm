import mqtt, { type MqttClient } from "mqtt";

let client: MqttClient | null = null;

export function getMqttClient(): MqttClient {
  if (client) return client;

  const brokerUrl = process.env.OHSTEM_BROKER_URL ?? "mqtt://mqtt.ohstem.vn";
  const username = process.env.OHSTEM_USERNAME;
  const password = process.env.OHSTEM_PASSWORD;

  client = mqtt.connect(brokerUrl, {
    username,
    password,
    reconnectPeriod: 5000,
    keepalive: 60,
  });

  client.on("connect", () => {
    const baseUser = process.env.OHSTEM_USERNAME;
    if (!baseUser) return;
    client?.subscribe(`${baseUser}/feeds/+`);
  });

  client.on("error", (error) => {
    console.error("[mqtt] client error", error);
  });

  return client;
}

export function publishCommand(feedKey: string, value: string | number) {
  const baseUser = process.env.OHSTEM_USERNAME;
  if (!baseUser) {
    throw new Error("Missing OHSTEM_USERNAME env variable");
  }

  const targetTopic = `${baseUser}/feeds/${feedKey}`;
  getMqttClient().publish(targetTopic, String(value));
}
