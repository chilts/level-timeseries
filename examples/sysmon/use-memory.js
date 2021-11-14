//
// This example pretends to gobble up more memory every 5s,
// and then every so often it releases that memory and
// starts again.
//
// We're just doing this as an example of how the following
// changes over time:
//
// ```
// process.memoryUsage().heapUsed
// ```
//
// On my system I get readings of around 13309240 and 14002920.
//

// core
const fs = require('fs')

// npm
const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://localhost')

// local
const getStats = require('./lib/get-stats.js')

// queue
const queue = 'process'

const readmes = []
const text = fs.readFileSync(__dirname + '/../../ReadMe.md')

client.on('connect', connack => {
  console.log('Connected')
  setInterval(() => {
    // create a new text to push
    readmes.push('' + text)

    console.log('Gathering stats ...')
    const stats = getStats('use-memory')
    console.log('heapUsed=' + stats.data.memory.heapUsed)
    client.publish(queue, JSON.stringify(stats))
    console.log('Published')

    // every so often, clear out the memory
    if ( Math.random() > 0.95 ) {
      console.log('--- Resetting Memory ---')
      while (readmes.length) {
        readmes.shift()
      }
    }
  }, 5 * 1000)
})
