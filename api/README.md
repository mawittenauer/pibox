# pibox API

A simple REST API to expose your pibox host configuration with token-based authentication.

## Installation

### 1. Install dependencies

```bash
cd api
npm install
```

### 2. Generate API tokens

Generate a secure token:

```bash
openssl rand -hex 32
```

### 3. Create API configuration

Create the API config file at `~/.config/pibox/api.conf`:

```bash
mkdir -p ~/.config/pibox
nano ~/.config/pibox/api.conf
```

Add your tokens (one per line):

```
your_token_from_openssl_here_1
another_token_from_openssl_here_2
```

You can comment out tokens with `#`.

### 4. Run the API server

```bash
npm start
```

The API will be available at `http://localhost:3000`

For development with auto-reload:

```bash
npm run dev
```

## Configuration

Configure via environment variables (see `.env.example`):

```bash
cp .env.example .env
nano .env
```

Or pass them directly:

```bash
PORT=8080 HOSTS_FILE=~/.config/pibox/hosts.conf node server.js
```

## API Endpoints

### Health Check (No Auth Required)

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-18T12:34:56.789Z"
}
```

### List All Hosts

```bash
GET /api/hosts
Authorization: Bearer <your-token>
```

Response:
```json
{
  "success": true,
  "count": 3,
  "hosts": [
    {
      "name": "pi-dev",
      "hostname": "pi-dev",
      "user": "pi",
      "port": 22,
      "os": "linux"
    },
    {
      "name": "pi-print",
      "hostname": "pi-print",
      "user": "pi",
      "port": 22,
      "os": "linux"
    },
    {
      "name": "pi-panel",
      "hostname": "pi-panel",
      "user": "pi",
      "port": 22,
      "os": "fullpageos"
    }
  ]
}
```

### Get Specific Host

```bash
GET /api/hosts/{name}
Authorization: Bearer <your-token>
```

Example:

```bash
GET /api/hosts/pi-dev
Authorization: Bearer <your-token>
```

Response:
```json
{
  "success": true,
  "host": {
    "name": "pi-dev",
    "hostname": "pi-dev",
    "user": "pi",
    "port": 22,
    "os": "linux"
  }
}
```

## Authentication

All API endpoints (except `/health`) require token-based authentication using the `Authorization` header:

```
Authorization: Bearer <token>
```

Replace `<token>` with a valid token from your `~/.config/pibox/api.conf` file.

### Example Requests

Using `curl`:

```bash
# List all hosts
curl -H "Authorization: Bearer your_token_here" http://localhost:3000/api/hosts

# Get specific host
curl -H "Authorization: Bearer your_token_here" http://localhost:3000/api/hosts/pi-dev

# Check health (no auth)
curl http://localhost:3000/health
```

Using Python:

```python
import requests

token = "your_token_here"
headers = {"Authorization": f"Bearer {token}"}

# List all hosts
response = requests.get("http://localhost:3000/api/hosts", headers=headers)
print(response.json())

# Get specific host
response = requests.get("http://localhost:3000/api/hosts/pi-dev", headers=headers)
print(response.json())
```

Using JavaScript/Node.js:

```javascript
const token = "your_token_here";

// List all hosts
fetch("http://localhost:3000/api/hosts", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(r => r.json())
  .then(data => console.log(data));

// Get specific host
fetch("http://localhost:3000/api/hosts/pi-dev", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(r => r.json())
  .then(data => console.log(data));
```

## Security Notes

1. **Generate strong tokens**: Use `openssl rand -hex 32` to generate secure random tokens
2. **Protect your tokens**: Don't commit `~/.config/pibox/api.conf` to version control
3. **Use HTTPS in production**: Consider using a reverse proxy (nginx, caddy) with HTTPS
4. **Rotate tokens regularly**: Update your tokens periodically
5. **Limit API access**: Run the API on localhost by default, use a firewall/VPN for remote access

## Systemd Service (Optional)

Create `/etc/systemd/system/pibox-api.service`:

```ini
[Unit]
Description=pibox API Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/pibox/api
ExecStart=/usr/bin/node /home/pi/pibox/api/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pibox-api
sudo systemctl start pibox-api
```
