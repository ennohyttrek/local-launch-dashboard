// System and Process Monitoring Service
// Tracks CPU and RAM usage for processes and system

import pidusage from 'pidusage';
import os from 'os';

/**
 * Get metrics for a specific process
 * @param {number} pid - Process ID
 * @returns {Object} Process metrics (cpu, memory)
 */
export async function getProcessMetrics(pid) {
  try {
    const stats = await pidusage(pid);
    
    return {
      cpu: Math.round(stats.cpu * 10) / 10, // CPU percentage (rounded to 1 decimal)
      memory: Math.round(stats.memory / 1024 / 1024), // Memory in MB
      elapsed: stats.elapsed, // Elapsed time in ms
      timestamp: Date.now()
    };
  } catch (error) {
    // Process might have stopped
    return null;
  }
}

/**
 * Get overall system metrics
 * @returns {Object} System metrics
 */
export function getSystemMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  const cpus = os.cpus();
  const cpuCount = cpus.length;
  
  // Calculate average CPU usage
  let totalIdle = 0;
  let totalTick = 0;
  
  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  
  const idle = totalIdle / cpuCount;
  const total = totalTick / cpuCount;
  const usage = 100 - (100 * idle / total);
  
  return {
    cpu: {
      usage: Math.round(usage * 10) / 10, // CPU percentage
      cores: cpuCount,
      model: cpus[0].model
    },
    memory: {
      total: Math.round(totalMem / 1024 / 1024), // MB
      used: Math.round(usedMem / 1024 / 1024), // MB
      free: Math.round(freeMem / 1024 / 1024), // MB
      usagePercent: Math.round((usedMem / totalMem) * 100)
    },
    platform: os.platform(),
    uptime: Math.round(os.uptime()), // System uptime in seconds
    timestamp: Date.now()
  };
}

/**
 * Get metrics for multiple processes
 * @param {Array<number>} pids - Array of process IDs
 * @returns {Object} Map of pid to metrics
 */
export async function getMultipleProcessMetrics(pids) {
  try {
    const stats = await pidusage(pids);
    const result = {};
    
    for (const pid in stats) {
      result[pid] = {
        cpu: Math.round(stats[pid].cpu * 10) / 10,
        memory: Math.round(stats[pid].memory / 1024 / 1024),
        elapsed: stats[pid].elapsed,
        timestamp: Date.now()
      };
    }
    
    return result;
  } catch (error) {
    return {};
  }
}
