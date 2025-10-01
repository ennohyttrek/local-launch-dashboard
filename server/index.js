// Local Launch Dashboard - Backend Server
// Version: 0.0.1

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const dataDir = path.join(__dirname, '../data');
const serversFile = path.join(dataDir, 'servers.json');

// In-memory process tracking
const runningProcesses = new Map();

// Helper: Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Helper: Read servers data
async function readServers() {
  try {
    const data = await fs.readFile(serversFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty structure
    return { servers: [] };
  }
}

// Helper: Write servers data
async function writeServers(data) {
  await ensureDataDir();
  await fs.writeFile(serversFile, JSON.stringify(data, null, 2));
}

// Routes

// GET /api/servers - List all servers
app.get('/api/servers', async (req, res) => {
  try {
    const data = await readServers();
    res.json(data.servers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read servers' });
  }
});

// POST /api/servers - Add new server
app.post('/api/servers', async (req, res) => {
  try {
    const { name, description, command, cwd, port, autoStart = false } = req.body;
    
    // Validation
    if (!name || !command || !cwd) {
      return res.status(400).json({ error: 'Missing required fields: name, command, cwd' });
    }
    
    const data = await readServers();
    
    // Generate unique ID
    const id = `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newServer = {
      id,
      name,
      description: description || '',
      command,
      cwd,
      port: port || null,
      autoStart,
      createdAt: new Date().toISOString()
    };
    
    data.servers.push(newServer);
    await writeServers(data);
    
    res.status(201).json(newServer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create server' });
  }
});

// PUT /api/servers/:id - Update server
app.put('/api/servers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const data = await readServers();
    const index = data.servers.findIndex(s => s.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    // Don't allow ID changes
    delete updates.id;
    delete updates.createdAt;
    
    data.servers[index] = {
      ...data.servers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await writeServers(data);
    res.json(data.servers[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update server' });
  }
});

// DELETE /api/servers/:id - Remove server
app.delete('/api/servers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Stop process if running
    if (runningProcesses.has(id)) {
      const process = runningProcesses.get(id);
      process.kill();
      runningProcesses.delete(id);
    }
    
    const data = await readServers();
    const index = data.servers.findIndex(s => s.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    data.servers.splice(index, 1);
    await writeServers(data);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete server' });
  }
});

// POST /api/servers/:id/start - Start server
app.post('/api/servers/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if already running
    if (runningProcesses.has(id)) {
      return res.status(400).json({ error: 'Server already running' });
    }
    
    const data = await readServers();
    const server = data.servers.find(s => s.id === id);
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    // Import dynamically to avoid circular dependencies
    const { startProcess } = await import('./services/process.js');
    const process = await startProcess(server);
    
    runningProcesses.set(id, process);
    
    res.json({ success: true, pid: process.pid });
  } catch (error) {
    console.error('Failed to start server:', error);
    res.status(500).json({ error: 'Failed to start server', details: error.message });
  }
});

// POST /api/servers/:id/stop - Stop server
app.post('/api/servers/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!runningProcesses.has(id)) {
      return res.status(400).json({ error: 'Server not running' });
    }
    
    const process = runningProcesses.get(id);
    
    // Import dynamically
    const { stopProcess } = await import('./services/process.js');
    await stopProcess(process);
    
    runningProcesses.delete(id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop server' });
  }
});

// GET /api/servers/:id/status - Get server status with metrics
app.get('/api/servers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const isRunning = runningProcesses.has(id);
    let metrics = null;
    
    if (isRunning) {
      const process = runningProcesses.get(id);
      
      // Import dynamically
      const { getProcessMetrics } = await import('./services/monitor.js');
      metrics = await getProcessMetrics(process.pid);
    }
    
    res.json({
      id,
      running: isRunning,
      pid: isRunning ? runningProcesses.get(id).pid : null,
      metrics
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get server status' });
  }
});

// GET /api/system - Get overall system metrics
app.get('/api/system', async (req, res) => {
  try {
    // Import dynamically
    const { getSystemMetrics } = await import('./services/monitor.js');
    const metrics = await getSystemMetrics();
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system metrics' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Local Launch Dashboard API running on http://localhost:${PORT}`);
  console.log(`Frontend should be running on http://localhost:3002`);
});
