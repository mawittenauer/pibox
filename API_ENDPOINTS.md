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

### Power Off Host

**POST** `/api/hosts/:name/poweroff`

Send a power off command to the specified host. Requires authentication.

**Parameters:**
- `name` (path) - Host name as defined in hosts.conf

**Response (Success):**
```json
{
  "success": true,
  "message": "Power off command sent to mypi",
  "host": "mypi",
  "command": "poweroff",
  "output": "Connection to 192.168.1.100 closed by remote host."
}
```

---

### Update Packages

**POST** `/api/hosts/:name/update`

Run `apt update && apt upgrade` on the specified host. Requires authentication.

**Parameters:**
- `name` (path) - Host name as defined in hosts.conf

**Response (Success):**
```json
{
  "success": true,
  "message": "Update command executed on mypi",
  "host": "mypi",
  "command": "update",
  "output": "Hit:1 http://raspbian.raspberrypi.org/raspbian bullseye InRelease\n..."
}
```

---

### Get Uptime

**GET** `/api/hosts/:name/uptime`

Get the uptime of the specified host. Requires authentication.

**Parameters:**
- `name` (path) - Host name as defined in hosts.conf

**Response (Success):**
```json
{
  "success": true,
  "host": "mypi",
  "command": "uptime",
  "output": " 12:34:56 up 45 days,  2:15,  2 users,  load average: 0.15, 0.10, 0.08"
}
```

---

### Get Disk Usage

**GET** `/api/hosts/:name/disk-usage`

Get the disk usage of the specified host. Requires authentication.

**Parameters:**
- `name` (path) - Host name as defined in hosts.conf

**Response (Success):**
```json
{
  "success": true,
  "host": "mypi",
  "command": "disk-usage",
  "output": "Filesystem      Size  Used Avail Use% Mounted on\n/dev/root       29G  4.5G   23G  16% /\ndevtmpfs        427M     0  427M   0% /dev\ntmpfs           486M     0  486M   0% /dev/shm\n..."
}
```

---

### Get Memory Usage

**GET** `/api/hosts/:name/memory`

Get the memory usage of the specified host. Requires authentication.

**Parameters:**
- `name` (path) - Host name as defined in hosts.conf

**Response (Success):**
```json
{
  "success": true,
  "host": "mypi",
  "command": "memory",
  "output": "              total        used        free      shared  buff/cache   available\nMem:        1014Mi       150Mi       650Mi        12Mi       213Mi       803Mi\nSwap:        100Mi         0B       100Mi"
}
```

---

### Get Systemctl Status

**GET** `/api/hosts/:name/systemctl`

Get the systemctl status of the specified host. Requires authentication.

**Parameters:**
- `name` (path) - Host name as defined in hosts.conf

**Response (Success):**
```json
{
  "success": true,
  "host": "mypi",
  "command": "systemctl",
  "output": "State: running\nJobs: 0 queued\nFailed: 0 units\nSince: Mon 2026-01-20 10:15:30 GMT; 45 days ago\nCPUs: 4\nMemory: 150.1M\nMemory Limit: infinity\nTasks: 125\nCGroup: /\n..."
}
```

---

### Set FullPageOS URL

**POST** `/api/hosts/:name/set-url`

Update the URL for FullPageOS servers. Only available for hosts with OS type `fullpageos`. Requires authentication.

**Parameters:**
- `name` (path) - Host name as defined in hosts.conf

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "FullPageOS URL updated on display",
  "host": "display",
  "command": "set-url",
  "url": "https://example.com",
  "output": "Updated: /boot/firmware/fullpageos.txt\nNew URL: https://example.com"
}
```

**Response (Error - Not FullPageOS):**
```json
{
  "success": false,
  "error": "Host 'mypi' is not a FullPageOS server (OS: linux)"
}
```

**Response (Error - Invalid URL):**
```json
{
  "success": false,
  "error": "URL must start with http:// or https://"
}
```

**Response (Error - SSH Failure):**
```json
{
  "success": false,
  "error": "Failed to update URL on host",
  "details": "Connection refused",
  "stderr": "ssh: connect to host 192.168.1.101 port 22: Connection refused"
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

# Get system status
curl -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/hosts/mypi/uptime"

curl -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/hosts/mypi/memory"

curl -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/hosts/mypi/disk-usage"

# Execute actions
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/hosts/mypi/update"

curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/hosts/mypi/reboot"

curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/hosts/mypi/poweroff"

# Update FullPageOS URL (for FullPageOS hosts only)
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  "$API_URL/api/hosts/display/set-url"
```

### 5. Batch Testing

Use the included test script to test all endpoints:

```bash
cd /path/to/pibox/api

# Set variables and run tests
API_URL="http://localhost:3000" \
TOKEN="your-api-token" \
HOST="mypi" \
bash test-endpoints.sh
```

---

## Available Commands

The following commands can be executed via the API:

**Query/Status Commands (GET):**
- `uptime` - Show system uptime
- `disk-usage` - Show disk usage (df -h)
- `memory` - Show memory usage (free -h)
- `systemctl` - Show systemctl status

**Action Commands (POST):**
- `reboot` - Reboot the host
- `poweroff` - Power off the host
- `update` - Run apt update and upgrade
- `set-url` - Set FullPageOS URL (FullPageOS hosts only)

**Interactive-only Commands (not available via API):**
- `ssh-shell` - Open SSH shell (use SSH directly instead)

---

## Notes

- The reboot command uses `sudo -n` first (passwordless sudo), then falls back to `sudo` with prompt
- SSH connections inherit the user and port from the host configuration
- Commands have a 60-second timeout
- The API server logs all requests to stdout
