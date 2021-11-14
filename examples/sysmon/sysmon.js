// npm
const mqtt = require('mqtt')
const TimeSeries = require('level-timeseries')
const chalk = require('chalk')

// setup
const client = mqtt.connect('mqtt://localhost')
const ts = new TimeSeries('sysmon.db')
ts.open()

// queue
const queue = 'process'

client.on('connect', () => {
  console.log('Connected')
  client.subscribe(queue, err => {
    if (err) {
      console.warn('Error:', err)
      process.exit(-2)
    }
  })
})

client.on('message', (topic, message, packet) => {
  const msg = JSON.parse(message.toString())
  const process = msg.process
  delete msg.process

  console.log(chalk.green(chalk.green(process)) + ' : ' + chalk.yellow((new Date()).toISOString()))
  console.log(chalk.grey('  ' + JSON.stringify(msg)))
  console.log('  * memory:')
  console.log('  *   rss:', msg.memory.rss)
  console.log('  *   heapTotal:', msg.memory.heapTotal)
  console.log('  *   heapUsed:', msg.memory.heapUsed)
  console.log('  *   external:', msg.memory.external)
  console.log('  *   arrayBuffers:', msg.memory.arrayBuffers)
  console.log('  * cpu:')
  console.log('  *   user:', msg.cpu.user)
  console.log('  *   system:', msg.cpu.system)
  console.log()

  // write out these stats to the correct process
  ts.addObs(process, msg)

})

// ToDo: aggregate stats every 1m, 5m, and 15m.
