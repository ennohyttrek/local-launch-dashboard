// Local Launch Dashboard - Frontend Application
// Version: 0.0.1

const API_BASE = 'http://localhost:3003/api';
let servers = [];
let updateInterval = null;
let currentEditingServer = null;

// DOM Elements
const serversGrid = document.getElementById('serversGrid');
const serversCount = document.getElementById('serversCount');
const serverModal = document.getElementById('serverModal');
const serverForm = document.getElementById('serverForm');
const modalTitle = document.getElementById('modalTitle');

// System metrics elements
const systemCpu = document.getElementById('systemCpu');
const systemMemory = document.getElementById('systemMemory');
const systemCores = document.getElementById('systemCores');
const systemMemoryFree = document.getElementById('systemMemoryFree');

// Initialize app
async function init() {
  setupEventListeners();
  await loadServers();
  await loadSystemMetrics();
  startAutoUpdate();
}

// Setup event listeners
function setupEventListeners() {
  // Add server button
  document.getElementById('btnAddServer').addEventListener('click', () => {
    currentEditingServer = null;
    modalTitle.textContent = 'Add Server';
    serverForm.reset();
    serverModal.showModal();
  });
  
  // Modal close buttons
  document.getElementById('btnCloseModal').addEventListener('click', () => {
    serverModal.close();
  });
  
  document.getElementById('btnCancelModal').addEventListener('click', () => {
    serverModal.close();
  });
  
  // Form submission
  serverForm.addEventListener('submit', handleServerSubmit);
  
  // System refresh button
  document.getElementById('btnRefreshSystem').addEventListener('click', loadSystemMetrics);
}

// Load servers from API
async function loadServers() {
  try {
    const response = await fetch(`${API_BASE}/servers`);
    servers = await response.json();
    renderServers();
    await updateServerStatuses();
  } catch (error) {
    console.error('Failed to load servers:', error);
    showError('Failed to load servers');
  }
}

// Render servers
function renderServers() {
  serversCount.textContent = `${servers.length} server${servers.length !== 1 ? 's' : ''}`;
  
  if (servers.length === 0) {
    serversGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📦</div>
        <h3 class="empty-state-title">No servers configured</h3>
        <p class="empty-state-description">Click "Add Server" to configure your first development server</p>
      </div>
    `;
    return;
  }
  
  serversGrid.innerHTML = servers.map(server => createServerCard(server)).join('');
  
  // Attach event listeners to server cards
  servers.forEach(server => {
    const startBtn = document.getElementById(`start-${server.id}`);
    const stopBtn = document.getElementById(`stop-${server.id}`);
    const editBtn = document.getElementById(`edit-${server.id}`);
    const deleteBtn = document.getElementById(`delete-${server.id}`);
    
    if (startBtn) startBtn.addEventListener('click', () => startServer(server.id));
    if (stopBtn) stopBtn.addEventListener('click', () => stopServer(server.id));
    if (editBtn) editBtn.addEventListener('click', () => editServer(server));
    if (deleteBtn) deleteBtn.addEventListener('click', () => deleteServer(server.id));
  });
}

// Create server card HTML
function createServerCard(server) {
  const status = server.status || { running: false, metrics: null };
  const statusClass = status.running ? 'status-running' : 'status-stopped';
  const statusText = status.running ? 'Running' : 'Stopped';
  
  return `
    <div class="card-400" data-server-id="${server.id}">
      <div class="card-header">
        <h3 class="card-title">${server.name}</h3>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      <div class="card-body">
        ${server.description ? `<p style="margin-bottom: 1rem; color: var(--color-text-secondary); font-size: 0.875rem;">${server.description}</p>` : ''}
        
        <div style="margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Command</div>
          <code style="font-size: 0.75rem; background: var(--color-background-secondary); padding: 0.25rem 0.5rem; border-radius: 4px; display: inline-block;">${server.command}</code>
        </div>
        
        ${server.port ? `
          <div style="margin-bottom: 1rem;">
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">Port</div>
            <span style="font-weight: 600;">${server.port}</span>
          </div>
        ` : ''}
        
        ${status.running && status.metrics ? `
          <div class="metrics-grid" style="margin: 1rem 0;">
            <div class="metric-item">
              <span class="metric-label">CPU</span>
              <span class="metric-value">${status.metrics.cpu}%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">RAM</span>
              <span class="metric-value">${status.metrics.memory}MB</span>
            </div>
          </div>
        ` : ''}
      </div>
      <div class="card-footer">
        ${status.running ? `
          <button id="stop-${server.id}" class="btn btn-danger" style="flex: 1;">Stop</button>
        ` : `
          <button id="start-${server.id}" class="btn btn-success" style="flex: 1;">Start</button>
        `}
        <button id="edit-${server.id}" class="btn btn-secondary">Edit</button>
        <button id="delete-${server.id}" class="btn btn-secondary">Delete</button>
      </div>
    </div>
  `;
}

// Update server statuses
async function updateServerStatuses() {
  for (const server of servers) {
    try {
      const response = await fetch(`${API_BASE}/servers/${server.id}/status`);
      const status = await response.json();
      server.status = status;
    } catch (error) {
      console.error(`Failed to get status for ${server.id}:`, error);
    }
  }
  renderServers();
}

// Start server
async function startServer(id) {
  const btn = document.getElementById(`start-${id}`);
  if (btn) btn.disabled = true;
  
  try {
    const response = await fetch(`${API_BASE}/servers/${id}/start`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start server');
    }
    
    // Open server in new tab
    const server = servers.find(s => s.id === id);
    if (server && server.port) {
      window.open(`http://localhost:${server.port}`, '_blank');
    }
    
    await loadServers();
  } catch (error) {
    console.error('Failed to start server:', error);
    showError(error.message);
    if (btn) btn.disabled = false;
  }
}

// Stop server
async function stopServer(id) {
  const btn = document.getElementById(`stop-${id}`);
  if (btn) btn.disabled = true;
  
  try {
    const response = await fetch(`${API_BASE}/servers/${id}/stop`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to stop server');
    }
    
    await loadServers();
  } catch (error) {
    console.error('Failed to stop server:', error);
    showError('Failed to stop server');
    if (btn) btn.disabled = false;
  }
}

// Edit server
function editServer(server) {
  currentEditingServer = server;
  modalTitle.textContent = 'Edit Server';
  
  document.getElementById('serverName').value = server.name;
  document.getElementById('serverDescription').value = server.description || '';
  document.getElementById('serverCommand').value = server.command;
  document.getElementById('serverCwd').value = server.cwd;
  document.getElementById('serverPort').value = server.port || '';
  
  serverModal.showModal();
}

// Delete server
async function deleteServer(id) {
  if (!confirm('Are you sure you want to delete this server?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/servers/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete server');
    }
    
    await loadServers();
  } catch (error) {
    console.error('Failed to delete server:', error);
    showError('Failed to delete server');
  }
}

// Handle server form submission
async function handleServerSubmit(e) {
  e.preventDefault();
  
  const data = {
    name: document.getElementById('serverName').value,
    description: document.getElementById('serverDescription').value,
    command: document.getElementById('serverCommand').value,
    cwd: document.getElementById('serverCwd').value,
    port: document.getElementById('serverPort').value ? parseInt(document.getElementById('serverPort').value) : null
  };
  
  try {
    const url = currentEditingServer 
      ? `${API_BASE}/servers/${currentEditingServer.id}`
      : `${API_BASE}/servers`;
    
    const method = currentEditingServer ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save server');
    }
    
    serverModal.close();
    await loadServers();
  } catch (error) {
    console.error('Failed to save server:', error);
    showError(error.message);
  }
}

// Load system metrics
async function loadSystemMetrics() {
  try {
    const response = await fetch(`${API_BASE}/system`);
    const metrics = await response.json();
    
    systemCpu.textContent = `${metrics.cpu.usage}%`;
    systemMemory.textContent = `${metrics.memory.used}MB`;
    systemCores.textContent = metrics.cpu.cores;
    systemMemoryFree.textContent = `${metrics.memory.free}MB`;
  } catch (error) {
    console.error('Failed to load system metrics:', error);
  }
}

// Start auto-update
function startAutoUpdate() {
  // Update every 3 seconds
  updateInterval = setInterval(async () => {
    await updateServerStatuses();
    await loadSystemMetrics();
  }, 3000);
}

// Stop auto-update (cleanup)
function stopAutoUpdate() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

// Show error message
function showError(message) {
  // Simple error display - could be enhanced with a toast notification
  alert(`Error: ${message}`);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  stopAutoUpdate();
});

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
