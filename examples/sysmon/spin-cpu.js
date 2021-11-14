// npm
const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://localhost')

// local
const getStats = require('./lib/get-stats.js')

// queue
const queue = 'process'

client.on('connect', connack => {
  console.log('Connected')

  setInterval(() => {
    for(let i = 0; i < 50000; i++) {
      // do something
      Math.sqrt(7823764827364)
    }

    console.log('Gathering stats ...')
    const stats = getStats('spin-cpu')
    console.log('cpu.user=' + stats.cpu.user)
    client.publish(queue, JSON.stringify(stats))
    console.log('Published')
  }, 5 * 1000)
})
