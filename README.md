# 🧰 pibox
**A simple, fast command-line control center for your Raspberry Pi fleet**

`pibox` is a lightweight terminal UI that lets you manage multiple Raspberry Pi machines from a single Linux workstation.  
Select a Pi, choose an action (SSH, reboot, power off, update, etc.), and `pibox` handles the rest over SSH.

It’s designed for **homelabs, dev labs, and Raspberry Pi clusters** where you want speed, consistency, and zero friction.

---

## ✨ Features

- Interactive terminal UI (host → action)
- Passwordless SSH support
- Works with hostnames, IPs, or SSH aliases
- Config-file driven (no hardcoded machines)
- VS Code Remote SSH compatible
- Built on standard Linux tools (ssh, whiptail)

---

## 🖥️ Example Workflow

```bash
pibox
```

1. Select a Raspberry Pi  
2. Select a command  
3. Confirm  
4. Done  

No IPs. No usernames. No copy-paste.

---

## 📦 Requirements

On your control machine (Kubuntu, Ubuntu, Debian, etc.):

```bash
sudo apt install whiptail openssh-client
```

Each Raspberry Pi must have:
- SSH enabled
- A static IP or DHCP reservation
- A hostname (recommended)
- Your SSH key installed

---

## 🔧 Installation

### 1) Install the pibox script

```bash
sudo cp pibox /usr/local/bin/pibox
sudo chmod +x /usr/local/bin/pibox
```

### 2) Create the config directory

```bash
mkdir -p ~/.config/pibox
```

### 3) Create your host list

```bash
nano ~/.config/pibox/hosts.conf
```

Example:

```
# name|hostname_or_ip|user|port
pi-dev|pi-dev|pi|22
pi-print|pi-print|pi|22
pi-sensor|pi-sensor|pi|22
```

- `name` → label shown in the menu  
- `hostname_or_ip` → what SSH connects to  
- `user` → SSH user (usually `pi`)  
- `port` → SSH port (default 22)

---

## 🔑 SSH Setup (required)

On your control machine:

```bash
ssh-keygen -t ed25519
```

Copy your key to each Pi:

```bash
ssh-copy-id pi@pi-dev
ssh-copy-id pi@pi-print
```

Verify:

```bash
ssh pi@pi-dev
```

You should connect without a password.

---

## 🌐 Optional: REST API


Expose your host configuration via a REST API with token-based authentication.

### Installation

#### 1) Install Node.js dependencies

```bash
cd api
npm install
```

#### 2) Configure API tokens

Generate a secure token:

```bash
openssl rand -hex 32
```

Create the API config file:

```bash
mkdir -p ~/.config/pibox
nano ~/.config/pibox/api.conf
```

Add one or more tokens (one per line):

```
your_token_from_openssl_here_1
another_token_from_openssl_here_2
```

#### 3) Run the API server

```bash
cd api
npm start
```

The API will be available at `http://localhost:3000`

For development with auto-reload:

```bash
npm run dev
```

### Running with systemctl (Linux)

For production use, run the API as a systemd service.

#### Create the systemd service file

```bash
sudo nano /etc/systemd/system/pibox-api.service
```

Add the following content (adjust paths and user as needed):

```ini
[Unit]
Description=pibox REST API Server
After=network.target

[Service]
Type=simple
User=pi
Group=pi
WorkingDirectory=/home/pi/pibox/api
ExecStart=/usr/bin/node /home/pi/pibox/api/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

Environment="NODE_ENV=production"
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
```

**Note:** Adjust `User`, `Group`, and paths to match your setup.

#### Enable and start the service

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Enable to start on boot
sudo systemctl enable pibox-api

# Start the service now
sudo systemctl start pibox-api

# Check status
sudo systemctl status pibox-api

# View logs
sudo journalctl -u pibox-api -f
```

### API Endpoints

All endpoints (except `/health`) require token authentication via the `Authorization` header:

```
Authorization: Bearer <your-token>
```

**Health Check** (no auth):
```bash
GET /health
```

**List all hosts**:
```bash
GET /api/hosts
Authorization: Bearer <token>
```

**Get specific host**:
```bash
GET /api/hosts/{name}
Authorization: Bearer <token>
```

Example with curl:

```bash
curl -H "Authorization: Bearer your_token_here" http://localhost:3000/api/hosts
curl -H "Authorization: Bearer your_token_here" http://localhost:3000/api/hosts/pi-dev
```

See [api/README.md](api/README.md) for complete API documentation.

---

## 🚀 Usage

```bash
pibox
```

Select:
1. A host  
2. A command  
3. Confirm  

Available actions include:
- SSH Shell
- Reboot
- Power Off
- System updates
- Uptime
- Disk usage
- Memory stats
- Docker status
- systemd status

---

## 🔐 Optional: Passwordless sudo on the Pi

For reboot, poweroff, and updates to work without prompting:

On each Pi:

```bash
sudo visudo
```

Add:

```
pi ALL=NOPASSWD: /sbin/reboot, /sbin/poweroff, /usr/bin/apt, /usr/bin/apt-get
```

---

## 🧠 Design Philosophy

pibox is:
- **Simple** — no databases, no agents
- **Portable** — just SSH and a config file
- **Transparent** — it runs the exact commands you’d run manually
- **Fast** — one command to rule all Pis

It’s meant to feel like a **mini command center** for your Raspberry Pi network.

---

## 📄 License

MIT — use it, fork it, improve it, ship it 🚀
