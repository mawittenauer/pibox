# pibox API Endpoints

## Overview

The pibox API server now exposes endpoints to execute pibox commands on configured hosts. All endpoints (except `/health`) require Bearer token authentication.

## Authentication

Include an authorization header with all requests (except `/health`):

```
Authorization: Bearer YOUR_API_TOKEN
```

API tokens are stored in `~/.config/pibox/api.conf` (one token per line, # for comments)

## Endpoints

### Health Check

**GET** `/health`

Check API server status (no authentication required).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-20T12:34:56.789Z"
}
```

---

### List All Hosts

**GET** `/api/hosts`

Requires authentication.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "hosts": [
    {
      "name": "mypi",
      "hostname": "192.168.1.100",
      "user": "pi",
      "port": 22,
      "os": "linux"
    },
    {
      "name": "display",
      "hostname": "192.168.1.101",
      "user": "pi",
      "port": 22,
      "os": "fullpageos"
    }
  ]
}
```

---

### Get Host Details

**GET** `/api/hosts/:name`

Get details for a specific host. Requires authentication.

**Parameters:**
- `name` (path) - Host name as defined in hosts.conf

**Response:**
```json
{
  "success": true,
  "host": {
    "name": "mypi",
    "hostname": "192.168.1.100",
    "user": "pi",
    "port": 22,
    "os": "linux"
  }
}
```

---

### Reboot Host

**POST** `/api/hosts/:name/reboot`

Send a reboot command to the specified host. Requires authentication.

**Parameters:**
- `name` (path) - Host name as defined in hosts.conf

**Response (Success):**
```json
{
  "success": true,
  "message": "Reboot command sent to mypi",
  "host": "mypi",
  "command": "reboot",
  "output": "sudo: no password entry for user pi\nConnection to 192.168.1.100 closed by remote host."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Host 'invalid-host' not found"
}
```

---

## Testing

### 1. Create API Token

```bash
mkdir -p ~/.config/pibox
echo "test-token-12345" >> ~/.config/pibox/api.conf
```

### 2. Start the API Server

```bash
cd /path/to/pibox/api
npm install  # if not already done
node server.js
```

### 3. Test Endpoints

**Health check:**
```bash
curl http://localhost:3000/health
```

**List hosts (with auth):**
```bash
curl -H "Authorization: Bearer test-token-12345" \
  http://localhost:3000/api/hosts
```

**Reboot a host:**
```bash
curl -X POST \
  -H "Authorization: Bearer test-token-12345" \
  http://localhost:3000/api/hosts/mypi/reboot
```

### 4. Using curl from your environment

```bash
# Replace with your API server URL and token
API_URL="http://localhost:3000"
TOKEN="your-api-token"

# Reboot a Raspberry Pi
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/hosts/mypi/reboot"
```

---

## Available Commands

The following commands can be executed via the API (currently only `reboot` has an endpoint, but more can be added):

- `ssh-shell` - Open SSH shell
- `reboot` - Reboot the host
- `poweroff` - Power off the host
- `update` - Run apt update and upgrade
- `uptime` - Show system uptime
- `disk-usage` - Show disk usage
- `memory` - Show memory usage
- `systemctl` - Show systemctl status

For FullPageOS hosts:
- `set-url` - Set the URL for FullPageOS (interactive only)

---

## Notes

- The reboot command uses `sudo -n` first (passwordless sudo), then falls back to `sudo` with prompt
- SSH connections inherit the user and port from the host configuration
- Commands have a 60-second timeout
- The API server logs all requests to stdout
