# pibox API - Complete Endpoint Reference

## Quick Summary

All pibox CLI commands are now available as REST API endpoints with full authentication support.

### Endpoint Count
- **Total Endpoints:** 10
- **GET Endpoints (Query/Status):** 7
- **POST Endpoints (Actions):** 3
- **No Auth Required:** 1 (/health)

---

## All Endpoints

### 1. Health Check (No Auth)
```
GET /health
```
Returns API server status. No authentication required.

### 2. List Hosts
```
GET /api/hosts
```
List all configured hosts.

### 3. Get Host Info
```
GET /api/hosts/:name
```
Get details for a specific host.

### 4. Query Commands (GET)
```
GET /api/hosts/:name/uptime
GET /api/hosts/:name/disk-usage
GET /api/hosts/:name/memory
GET /api/hosts/:name/systemctl
```
Retrieve system information from a host.

### 5. Action Commands (POST)
```
POST /api/hosts/:name/reboot
POST /api/hosts/:name/poweroff
POST /api/hosts/:name/update
```
Execute management actions on a host.

---

## Testing

### Start the Server
```bash
cd /path/to/pibox/api
npm install
node server.js
```

### Quick Test
```bash
# In another terminal
TOKEN="test-token-12345"
HOST="mypi"

# Query
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/hosts/$HOST/uptime

# Action
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/hosts/$HOST/reboot
```

### Comprehensive Test
```bash
API_URL="http://localhost:3000" \
TOKEN="test-token-12345" \
HOST="mypi" \
bash test-endpoints.sh
```

---

## Implementation Details

### Command Mapping
| API Command | pibox CLI | Method | Purpose |
|---|---|---|---|
| uptime | uptime | GET | Show system uptime |
| disk-usage | disk-usage | GET | Show disk usage |
| memory | memory | GET | Show memory usage |
| systemctl | systemctl | GET | Show systemctl status |
| reboot | reboot | POST | Reboot the host |
| poweroff | poweroff | POST | Power off the host |
| update | update | POST | Run apt update/upgrade |

### Execution Flow
1. API receives request with host name and command ID
2. Validates authentication token
3. Verifies host exists in hosts.conf
4. Executes: `bash pibox HOST COMMAND`
5. Returns output or error

### Timeout
- All commands have a 60-second timeout
- Commands that take longer will fail with timeout error

---

## Files Modified/Created

- **server.js** - Added 7 new endpoints and executePiboxCommand function
- **test-endpoints.sh** - New testing script for all endpoints
- **API_ENDPOINTS.md** - Updated with complete endpoint documentation
