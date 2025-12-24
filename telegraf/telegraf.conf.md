```toml
# ⚓️ ADA ONENET TELEMETRY BRIDGE (TELEGRAF)
# Purpose: Subscribes to OneNet MQTT sensors and persists to InfluxDB.

[agent]
  interval = "5s"
  round_interval = true
  metric_batch_size = 1000
  metric_buffer_limit = 10000
  collection_jitter = "0s"
  flush_interval = "10s"
  flush_jitter = "0s"
  precision = "ms"
  hostname = "ada-telegraf"
  omit_hostname = true

# --- INPUT: OneNet MQTT Backbone (SignalK) ---
[[inputs.mqtt_consumer]]
  servers = ["tcp://ada-mqtt:1883"]
  topics = [
    "signalk/vessels/self/#",
  ]
  data_format = "json"
  
  # Flattening SignalK's nested JSON structure
  json_string_fields = ["updates_values_path"]
  tag_keys = ["updates_source_label", "updates_values_path"]

# --- OUTPUT: InfluxDB v2 (Long-Term Memory) ---
[[outputs.influxdb_v2]]
  urls = ["http://influxdb:8086"]
  token = "$INFLUX_TOKEN"
  organization = "${DOCKER_INFLUXDB_INIT_ORG}"
  bucket = "signalk"

# --- PROCESSORS: Data Normalization ---
[[processors.enum]]
  [[processors.enum.mapping]]
    field = "updates_values_value"
    dest = "value_bool"
    [processors.enum.mapping.value_mappings]
      true = 1
      false = 0
```
