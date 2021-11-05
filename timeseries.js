// npm
const level = require('level')
const sublevel = require('subleveldown')
const yid = require('yid')
const ms = require('ms')
const prettyMs = require('pretty-ms')

// TimeSeries
class TimeSeries {
  constructor(filename) {
    this.filename = filename;
    this.db = null
    this.sub = {}
  }

  open() {
    this.db = level(this.filename)
  }

  ensureDbs(name) {
    if (!this.sub[name]) {
      const subDb = sublevel(this.db, name)
      const valDb = sublevel(subDb, 'val', { valueEncoding: 'json' })
      const aggDb = sublevel(subDb, 'agg')
      this.sub[name] = {
        subDb,
        valDb,
        aggDb,
      }
    }
  }

  getAggDb(name) {
    this.ensureDbs(name)
    return this.sub[name].aggDb
  }

  getValDb(name) {
    this.ensureDbs(name)
    return this.sub[name].valDb
  }

  addVal(name, value) {
    this.addTsVal(name, new Date(), value)
  }

  addTsVal(name, date, value) {
    const valDb = this.getValDb(name)
    const id = Date.now() + '-' + String(Math.random()).substr(2, 13)
    valDb.put(id, value)
  }

  aggregateAll(name, period, aggregator) {
    // figure out the period in MS
    const periodMs = ms(period)
    const prettyPeriodMs = prettyMs(periodMs)

    const valDb = this.getValDb(name)
    const aggDb = sublevel(this.getAggDb(name), prettyPeriodMs, { valueEncoding: 'json' })

    let oldTs = null
    let currentTs = null
    return valDb.createReadStream()
      .on('data', data => {
        console.log('data:', data)
        aggregator.add(data.value)

        const timestamp = yid.asDate(data.key).valueOf()
        currentTs = timestamp - ( timestamp % periodMs )
        console.log('currentTs:', currentTs)
        if (!oldTs) {
          oldTs = currentTs
          console.log('oldTs:', oldTs)
        }
        if (currentTs !== oldTs) {
          console.log(`${(new Date(oldTs)).toISOString()} @ ${period} -> ${oldTs}:`, aggregator.get())
          const data = aggregator.get()
          aggDb.put(oldTs, data)
          aggregator.reset()
          oldTs = currentTs
        }
      })
      .on('end', () => {
        const data = aggregator.get()
        aggDb.put(currentTs, data)
        aggregator.reset()
      })
  }

  dump(stream = process.stdin) {
    console.log('Started')
    return this.db.createReadStream()
      .on('data', function (data) {
        console.log(data.key, '=', data.value)
      })
      .on('error', function (err) {
        console.log('Error:', err)
      })
  }
}

// exports
module.exports = TimeSeries
