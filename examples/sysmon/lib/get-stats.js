function getStats(processName) {
  return {
    process: processName,
    data: {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      // we're not currently using this in this example
      // resource: process.resourceUsage(),
    }
  }
}

module.exports = getStats
