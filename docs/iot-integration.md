# IoT Integration Guide

## Option 1: OhStem MQTT (recommended)

1. Board keeps publishing to OhStem feeds as usual.
2. Server subscribes to `<OHSTEM_USERNAME>/feeds/+`.
3. Feed keys are mapped to devices by `devices.ohstem_feed_key`.
4. New sensor reading is ingested into `sensor_data` and evaluators run automatically.

Broker used by current CE setup:

`mqtt://mqtt.ohstem.vn`

Current feed mapping from CE:

- `V1`: Temperature
- `V2`: Humidity
- `V3`: Soil Moisture
- `V4`: LUX
- `V5`: GDD
- `V10`: Pump 1
- `V11`: Pump 2

For a stable non-serverless worker, run the standalone bridge process:

`npm run iot:bridge`

This process reads `.env.local`, subscribes to OhStem MQTT, and writes directly to Supabase.

## Option 2: HTTP direct ingest

Endpoint:

`POST /api/v1/readings`

Headers:

`Authorization: Bearer <INTERNAL_API_KEY>`

Body:

```json
{
  "device_code": "V1_nongtech_farm",
  "value": 28.5,
  "recorded_at": "2026-03-30T08:20:00.000Z"
}
```

## Polling commands

Endpoint:

`GET /api/v1/commands/<device_code>`

Headers:

`Authorization: Bearer <INTERNAL_API_KEY>`

Recommended polling interval: every 2 seconds.

When command is executed or failed, send status:

`POST /api/v1/devices/status`

Body:

```json
{
  "command_id": "uuid",
  "status": "executed",
  "executed_at": "2026-03-30T08:21:00.000Z"
}
```

## Naming convention

`device_code = <V-pin>_<ohstem_username>`

Example:

`V1_nongtech_farm`

## Security notes

- Keep `INTERNAL_API_KEY` secret.
- Rotate API key regularly.
- Restrict API routes to server-to-server traffic only.

## Health check

You can verify runtime configuration using:

`GET /api/v1/health`
