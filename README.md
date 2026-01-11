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
