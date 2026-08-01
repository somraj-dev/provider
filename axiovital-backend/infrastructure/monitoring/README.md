# Monitoring

Monitoring infrastructure for the AxioVital Provider Operating Environment.

## Stack

- **Prometheus** — Metrics collection and alerting
- **Grafana** — Dashboards and visualization

## Setup

1. Deploy Prometheus with the provided configuration
2. Deploy Grafana and import dashboards from `grafana/`
3. Configure alert rules

## Directories

- `prometheus.yml` — Prometheus scrape configuration
- `grafana/` — Grafana dashboard definitions
