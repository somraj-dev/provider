# NGINX Reverse Proxy

NGINX configuration for the AxioVital Provider Operating Environment.

Handles routing between frontend, backend, and AI services. Provides WebSocket support for real-time features.

## Usage

```bash
# Test configuration
nginx -t -c /path/to/nginx.conf

# Reload configuration
nginx -s reload
```
