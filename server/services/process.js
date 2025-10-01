// Process Management Service
// Handles spawning and stopping server processes

import { spawn } from 'child_process';

/**
 * Start a server process
 * @param {Object} server - Server configuration
 * @returns {ChildProcess} The spawned process
 */
export function startProcess(server) {
  return new Promise((resolve, reject) => {
    try {
      // Parse command to handle arguments
      const [command, ...args] = server.command.split(' ');
      
      // Special handling for Hugo
      if (command === 'hugo') {
        args.unshift('server');
      }
      
      // Spawn the process
      const childProcess = spawn(command, args, {
        cwd: server.cwd,
        shell: true,
        detached: false,
        stdio: 'pipe',
        env: {
          ...process.env,
          PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'
        }
      });
      
      // Store server info on the process object
      childProcess.serverInfo = {
        id: server.id,
        name: server.name,
        startedAt: new Date().toISOString()
      };
      
      // Log output (optional, for debugging)
      childProcess.stdout?.on('data', (data) => {
        console.log(`[${server.name}] ${data.toString().trim()}`);
      });
      
      childProcess.stderr?.on('data', (data) => {
        console.error(`[${server.name}] ERROR: ${data.toString().trim()}`);
      });
      
      childProcess.on('error', (error) => {
        console.error(`[${server.name}] Failed to start:`, error);
        reject(error);
      });
      
      childProcess.on('exit', (code, signal) => {
        console.log(`[${server.name}] Process exited with code ${code}, signal ${signal}`);
      });
      
      // Give process a moment to start
      setTimeout(() => {
        if (childProcess.pid) {
          console.log(`[${server.name}] Started successfully (PID: ${childProcess.pid})`);
          resolve(childProcess);
        } else {
          reject(new Error('Failed to get process PID'));
        }
      }, 100);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Stop a running process
 * @param {ChildProcess} process - The process to stop
 */
export function stopProcess(process) {
  return new Promise((resolve) => {
    if (!process || !process.pid) {
      resolve();
      return;
    }
    
    const serverName = process.serverInfo?.name || 'Unknown';
    console.log(`[${serverName}] Stopping process (PID: ${process.pid})`);
    
    // Try graceful shutdown first
    process.kill('SIGTERM');
    
    // Force kill after timeout if still running
    const forceKillTimeout = setTimeout(() => {
      if (process.killed === false) {
        console.log(`[${serverName}] Force killing process`);
        process.kill('SIGKILL');
      }
    }, 5000);
    
    process.on('exit', () => {
      clearTimeout(forceKillTimeout);
      console.log(`[${serverName}] Process stopped`);
      resolve();
    });
    
    // Resolve after a short delay even if exit event doesn't fire
    setTimeout(() => {
      clearTimeout(forceKillTimeout);
      resolve();
    }, 6000);
  });
}
