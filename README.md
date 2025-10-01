# Local Launch Dashboard

A web-based dashboard for managing local development servers with real-time resource monitoring.

## Version

Version: 0.0.4

## Features

- **Server Management**: Add, edit, and delete server configurations dynamically
- **Process Control**: Start and stop development servers with a single click
- **Real-time Monitoring**: Track CPU and RAM usage per server
- **System Metrics**: Monitor overall system resources (CPU, memory, cores)
- **Auto-refresh**: Status and metrics update every 3 seconds
- **Clean UI**: Built with QAB 700 design system principles

## Tech Stack

- **Frontend**: Vite, vanilla JavaScript (ES modules), HTML, CSS
- **Backend**: Express.js, Node.js
- **Monitoring**: pidusage for process metrics
- **Design**: Modular CSS with HSL color tokens

## Ports

- **Frontend (Vite)**: http://localhost:3002
- **Backend (Express API)**: http://localhost:3003

## Installation

```bash
# Install dependencies
npm install
```

## Usage

### Auto-Start on System Boot

The dashboard is configured to start automatically when you log in via macOS LaunchAgents:

- **Frontend** runs on http://localhost:3002
- **Backend API** runs on http://localhost:3003

LaunchAgent files are located in `~/Library/LaunchAgents/`:
- `com.local.launch-dashboard-frontend.plist`
- `com.local.launch-dashboard-backend.plist`

To manage the auto-start services:

```bash
# Check service status
launchctl list | grep launch-dashboard

# Stop services
launchctl unload ~/Library/LaunchAgents/com.local.launch-dashboard-frontend.plist
launchctl unload ~/Library/LaunchAgents/com.local.launch-dashboard-backend.plist

# Start services
launchctl load ~/Library/LaunchAgents/com.local.launch-dashboard-frontend.plist
launchctl load ~/Library/LaunchAgents/com.local.launch-dashboard-backend.plist
```

### Manual Start (Alternative)

You can also run frontend and backend manually:

```bash
# Run both frontend and backend together
npm run dev:all

# Or run separately:
npm run dev        # Frontend only (Vite)
npm run dev:backend # Backend only (Express)
```

### Pre-Configured Servers

The dashboard comes with two servers already configured:
1. **Hugo Writing Site** (port 1314) - Opens in new tab when started
2. **Digital Micro Products** (port 3001) - Opens in new tab when started

**Note:** The Hugo Writing Site requires Hugo to be installed on your system. Hugo is now correctly configured with the proper PATH environment variables for process spawning.

### Adding a Server

1. Click the "+ Add Server" button
2. Fill in the server details:
   - **Name**: Display name for the server
   - **Description**: Optional description
   - **Command**: Command to run (e.g., `npm run dev`)
   - **Working Directory**: Absolute path to project directory
   - **Port**: Optional port number
3. Click "Save Server"

### Managing Servers

- **Start**: Click the "Start" button on a server card. The server will open in a new tab.
- **Stop**: Click the "Stop" button on a running server
- **Edit**: Click "Edit" to modify server configuration
- **Delete**: Click "Delete" to remove a server (requires confirmation)

## Project Structure

```
/local-launch-dashboard
├── index.html              # Frontend entry point
├── app.js                  # Frontend JavaScript (ES module)
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration (port 3002)
├── css/
│   ├── reset.css          # CSS reset
│   ├── color.css          # HSL color tokens
│   ├── components.css     # Component styles
│   └── layout.css         # Layout styles
├── server/
│   ├── index.js           # Express server (port 3003)
│   └── services/
│       ├── process.js     # Process management
│       └── monitor.js     # Resource monitoring
└── data/
    └── servers.json       # Server configurations (auto-created)
```

## API Endpoints

### Servers

- `GET /api/servers` - List all configured servers
- `POST /api/servers` - Add new server
- `PUT /api/servers/:id` - Update server configuration
- `DELETE /api/servers/:id` - Remove server
- `POST /api/servers/:id/start` - Start server
- `POST /api/servers/:id/stop` - Stop server
- `GET /api/servers/:id/status` - Get server status and metrics

### System

- `GET /api/system` - Get overall system metrics

## Data Storage

Server configurations are stored in `data/servers.json`. This file is automatically created when you add your first server.

Example structure:
```json
{
  "servers": [
    {
      "id": "server-1704908400000-abc123",
      "name": "My App",
      "description": "Main development server",
      "command": "npm run dev",
      "cwd": "/path/to/project",
      "port": 3001,
      "autoStart": false,
      "createdAt": "2025-01-10T19:00:00.000Z"
    }
  ]
}
```

## Development

The dashboard uses:
- Vite for fast frontend development with HMR
- Express for the REST API
- Native Node.js `child_process` for spawning servers
- `pidusage` for cross-platform process monitoring

## Future Enhancements

See [ROADMAP.md](ROADMAP.md) for detailed feature plans and [NEXTSTEPS.md](NEXTSTEPS.md) for immediate action items.

**Upcoming Priority Features:**
- CPU/RAM history charts with startup spike visualization
- SQLite database for historical metrics storage
- Server groups and tagging system
- Live logs viewer
- Dark mode support
- Performance alerts and notifications

**Long-term Vision:**
- Plugin ecosystem for custom integrations
- Multi-user and team collaboration features
- Cloud and remote development support
- Advanced analytics and optimization recommendations

## License

Private - Internal Tool

## Author

Built for local development workflow optimization
