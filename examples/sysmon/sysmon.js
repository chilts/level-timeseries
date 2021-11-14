// npm
const mqtt = require('mqtt')
const TimeSeries = require('level-timeseries')

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
  console.log((new Date()).toISOString() + ':')
  // console.log(`  ${message.toString()}`)

  const msg = JSON.parse(message.toString())
  console.log('msg.data:', msg.data)
  console.log(' * process:', msg.process)
  console.log(' * memory:')
  console.log(' *   rss:', msg.data.memory.rss)
  console.log(' *   heapTotal:', msg.data.memory.heapTotal)
  console.log(' *   heapUsed:', msg.data.memory.heapUsed)
  console.log(' *   external:', msg.data.memory.external)
  console.log(' *   arrayBuffers:', msg.data.memory.arrayBuffers)
  console.log(' * cpu:')
  console.log(' *   user:', msg.data.cpu.user)
  console.log(' *   system:', msg.data.cpu.system)

  // write out these stats to the correct process
  ts.addObs(msg.process, msg.data)

  console.log()
})

// ToDo: aggregate stats every 1m, 5m, and 15m.
