#!/usr/bin/env node
const express = require('express');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOSTS_FILE = process.env.HOSTS_FILE || path.join(process.env.HOME, '.config/pibox/hosts.conf');
const API_CONFIG_FILE = process.env.API_CONFIG_FILE || path.join(process.env.HOME, '.config/pibox/api.conf');
const PIBOX_SCRIPT = process.env.PIBOX_SCRIPT || path.join(__dirname, '..', 'pibox');

const execFileAsync = promisify(execFile);

// Middleware
app.use(express.json());

// Load valid API tokens from config file
function loadApiTokens() {
  if (!fs.existsSync(API_CONFIG_FILE)) {
    console.warn(`API config file not found: ${API_CONFIG_FILE}`);
    return [];
  }

  try {
    const content = fs.readFileSync(API_CONFIG_FILE, 'utf-8');
    const tokens = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    return tokens;
  } catch (err) {
    console.error(`Error reading API config: ${err.message}`);
    return [];
  }
}

// Load hosts from configuration file
function loadHosts() {
  if (!fs.existsSync(HOSTS_FILE)) {
    throw new Error(`Hosts file not found: ${HOSTS_FILE}`);
  }

  const content = fs.readFileSync(HOSTS_FILE, 'utf-8');
  const hosts = [];

  content.split('\n').forEach((line) => {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      return;
    }

    // Parse: name|hostname_or_ip|user|port|os
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 2) {
      const [name, hostname, user = 'pi', port = '22', os = 'linux'] = parts;
      if (name && hostname) {
        hosts.push({
          name,
          hostname,
          user,
          port: parseInt(port, 10),
          os
        });
      }
    }
  });

  return hosts;
}

// Token authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const validTokens = loadApiTokens();
  if (!validTokens.includes(token)) {
    return res.status(403).json({ error: 'Invalid authorization token' });
  }

  next();
}

// Execute a pibox command via the CLI script
async function executePiboxCommand(hostName, commandId) {
  try {
    if (!fs.existsSync(PIBOX_SCRIPT)) {
      throw new Error(`pibox script not found at ${PIBOX_SCRIPT}`);
    }

    // Execute: bash pibox HOST COMMAND
    const { stdout, stderr } = await execFileAsync('bash', [PIBOX_SCRIPT, hostName, commandId], {
      timeout: 60000, // 60 second timeout
      env: { ...process.env, HOSTS_FILE }
    });

    return {
      success: true,
      output: stdout
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      stderr: err.stderr || ''
    };
  }
}

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List all hosts
app.get('/api/hosts', authenticateToken, (req, res) => {
  try {
    const hosts = loadHosts();
    res.json({
      success: true,
      count: hosts.length,
      hosts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get a specific host by name
app.get('/api/hosts/:name', authenticateToken, (req, res) => {
  try {
    const hosts = loadHosts();
    const host = hosts.find(h => h.name === req.params.name);

    if (!host) {
      return res.status(404).json({
        success: false,
        error: `Host '${req.params.name}' not found`
      });
    }

    res.json({
      success: true,
      host
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Reboot a host
app.post('/api/hosts/:name/reboot', authenticateToken, async (req, res) => {
  try {
    const hosts = loadHosts();
    const host = hosts.find(h => h.name === req.params.name);

    if (!host) {
      return res.status(404).json({
        success: false,
        error: `Host '${req.params.name}' not found`
      });
    }

    const result = await executePiboxCommand(req.params.name, 'reboot');

    if (result.success) {
      res.json({
        success: true,
        message: `Reboot command sent to ${req.params.name}`,
        host: req.params.name,
        command: 'reboot',
        output: result.output
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        stderr: result.stderr
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Power off a host
app.post('/api/hosts/:name/poweroff', authenticateToken, async (req, res) => {
  try {
    const hosts = loadHosts();
    const host = hosts.find(h => h.name === req.params.name);

    if (!host) {
      return res.status(404).json({
        success: false,
        error: `Host '${req.params.name}' not found`
      });
    }

    const result = await executePiboxCommand(req.params.name, 'poweroff');

    if (result.success) {
      res.json({
        success: true,
        message: `Power off command sent to ${req.params.name}`,
        host: req.params.name,
        command: 'poweroff',
        output: result.output
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        stderr: result.stderr
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Update packages on a host
app.post('/api/hosts/:name/update', authenticateToken, async (req, res) => {
  try {
    const hosts = loadHosts();
    const host = hosts.find(h => h.name === req.params.name);

    if (!host) {
      return res.status(404).json({
        success: false,
        error: `Host '${req.params.name}' not found`
      });
    }

    const result = await executePiboxCommand(req.params.name, 'update');

    if (result.success) {
      res.json({
        success: true,
        message: `Update command executed on ${req.params.name}`,
        host: req.params.name,
        command: 'update',
        output: result.output
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        stderr: result.stderr
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get uptime for a host
app.get('/api/hosts/:name/uptime', authenticateToken, async (req, res) => {
  try {
    const hosts = loadHosts();
    const host = hosts.find(h => h.name === req.params.name);

    if (!host) {
      return res.status(404).json({
        success: false,
        error: `Host '${req.params.name}' not found`
      });
    }

    const result = await executePiboxCommand(req.params.name, 'uptime');

    if (result.success) {
      res.json({
        success: true,
        host: req.params.name,
        command: 'uptime',
        output: result.output.trim()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        stderr: result.stderr
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get disk usage for a host
app.get('/api/hosts/:name/disk-usage', authenticateToken, async (req, res) => {
  try {
    const hosts = loadHosts();
    const host = hosts.find(h => h.name === req.params.name);

    if (!host) {
      return res.status(404).json({
        success: false,
        error: `Host '${req.params.name}' not found`
      });
    }

    const result = await executePiboxCommand(req.params.name, 'disk-usage');

    if (result.success) {
      res.json({
        success: true,
        host: req.params.name,
        command: 'disk-usage',
        output: result.output.trim()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        stderr: result.stderr
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get memory usage for a host
app.get('/api/hosts/:name/memory', authenticateToken, async (req, res) => {
  try {
    const hosts = loadHosts();
    const host = hosts.find(h => h.name === req.params.name);

    if (!host) {
      return res.status(404).json({
        success: false,
        error: `Host '${req.params.name}' not found`
      });
    }

    const result = await executePiboxCommand(req.params.name, 'memory');

    if (result.success) {
      res.json({
        success: true,
        host: req.params.name,
        command: 'memory',
        output: result.output.trim()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        stderr: result.stderr
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get systemctl status for a host
app.get('/api/hosts/:name/systemctl', authenticateToken, async (req, res) => {
  try {
    const hosts = loadHosts();
    const host = hosts.find(h => h.name === req.params.name);

    if (!host) {
      return res.status(404).json({
        success: false,
        error: `Host '${req.params.name}' not found`
      });
    }

    const result = await executePiboxCommand(req.params.name, 'systemctl');

    if (result.success) {
      res.json({
        success: true,
        host: req.params.name,
        command: 'systemctl',
        output: result.output.trim()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        stderr: result.stderr
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`pibox API listening on port ${PORT}`);
  console.log(`Hosts file: ${HOSTS_FILE}`);
  console.log(`API tokens file: ${API_CONFIG_FILE}`);
});
