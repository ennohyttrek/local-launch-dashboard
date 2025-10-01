# Changelog

All notable changes to the Local Launch Dashboard project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.3] - 2025-01-10

### Added
- **Project planning and documentation**
  - `ROADMAP.md` with comprehensive feature roadmap and long-term vision
  - `NEXTSTEPS.md` with immediately actionable tasks
  - `AGENTS.md` with project-specific agent instructions
  - `style.css` as primary version source with WordPress-style header
- **Enhanced versioning protocol**
  - Updated `META-AGENTS.md` with mandatory multi-file version synchronization
  - WordPress-style header format for version tracking
  - Explicit commit approval requirement

### Fixed
- **Hugo Writing Site server issues**
  - Added proper PATH environment variables for Hugo process spawning
  - Resolved CPU/RAM metrics display problems
  - Fixed process stop delays with improved process management
  - Hugo server now starts correctly and displays metrics

### Enhanced
- **Planning file structure compliance**
  - Restructured `NEXTSTEPS.md` to contain only immediately actionable tasks
  - Organized longer-term features appropriately in `ROADMAP.md`

## [0.0.2] - 2025-01-10

### Added
- **Auto-start on macOS login via LaunchAgents**
  - `com.local.launch-dashboard-backend.plist` - Backend API auto-start
  - `com.local.launch-dashboard-frontend.plist` - Frontend auto-start
  - Services start automatically on user login and restart if crashed
- **Pre-configured servers in `data/servers.json`**
  - Hugo Writing Site (port 1314)
  - Digital Micro Products (port 3001)

### Enhanced
- Header padding in UI for better visual consistency
- Frontend now opens server URLs in new tabs instead of new windows

## [0.0.1] - 2025-01-10

### Added
- **Initial project setup with Node.js and Vite**
- **Express.js backend server on port 3003**
- **Vite frontend development server on port 3002**
- **QAB 700 design system integration with modular CSS structure**
  - `css/reset.css` - CSS reset
  - `css/color.css` - HSL-based color token system
  - `css/components.css` - Reusable component styles
  - `css/layout.css` - Layout and responsive utilities
- **Server management functionality**
  - Add new server configurations dynamically
  - Edit existing server configurations
  - Delete server configurations with confirmation
  - Start/stop server processes
- **Real-time process monitoring**
  - Per-server CPU usage tracking
  - Per-server RAM usage tracking
  - Overall system metrics display
- **Backend API endpoints**
  - `GET /api/servers` - List all servers
  - `POST /api/servers` - Create new server
  - `PUT /api/servers/:id` - Update server
  - `DELETE /api/servers/:id` - Delete server
  - `POST /api/servers/:id/start` - Start server process
  - `POST /api/servers/:id/stop` - Stop server process
  - `GET /api/servers/:id/status` - Get server status and metrics
  - `GET /api/system` - Get system-wide metrics
- **Process management service (`server/services/process.js`)**
  - Spawn child processes for servers
  - Graceful shutdown with SIGTERM/SIGKILL
  - Process output logging
- **Monitoring service (`server/services/monitor.js`)**
  - CPU and memory tracking via pidusage
  - System-wide resource metrics
  - Cross-platform support
- **Frontend dashboard UI**
  - Server cards with status indicators
  - Add/Edit server modal dialog
  - Real-time metric updates (3-second interval)
  - System resource overview section
  - Empty state for no configured servers
- **JSON-based data storage in `data/servers.json`**
- **Project documentation**
  - `README.md` with setup and usage instructions
  - `CHANGELOG.md` following Keep a Changelog format
  - Inline code documentation

### Infrastructure
- Package.json with ES module support
- Vite configuration for port 3002
- Concurrently script for running frontend and backend together
- Git repository initialization
- .gitignore for Node.js projects
