// core
const EventEmitter = require('events')

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
    this.series = {}
  }

  open() {
    this.db = level(this.filename)
  }

  ensureDbs(seriesName) {
    if (!this.series[seriesName]) {
      const serDb = sublevel(this.db, seriesName)
      const valDb = sublevel(serDb, 'val', { valueEncoding: 'json' })
      const aggDb = sublevel(serDb, 'agg')
      this.series[seriesName] = {
        serDb,
        valDb,
        aggDb,
      }
    }
  }

  getValDb(seriesName) {
    this.ensureDbs(seriesName)
    return this.series[seriesName].valDb
  }

  getAggDb(seriesName) {
    this.ensureDbs(seriesName)
    return this.series[seriesName].aggDb
  }

  getPerDb(seriesName, prettyPeriodMs) {
    return sublevel(this.getAggDb(seriesName), prettyPeriodMs, { valueEncoding: 'json' })
  }

  addVal(seriesName, value) {
    this.addTsVal(seriesName, new Date(), value)
  }

  addTsVal(seriesName, date, value) {
    const valDb = this.getValDb(seriesName)
    const id = Date.now() + '-' + String(Math.random()).substr(2, 13)
    valDb.put(id, value)
  }

  aggregateAll(seriesName, period, aggregator) {
    // figure out the period in MS
    const periodMs = ms(period)
    const prettyPeriodMs = prettyMs(periodMs)

    const valDb = this.getValDb(seriesName)
    const aggDb = this.getPerDb(seriesName, prettyPeriodMs)

    let doneTs = null
    let currentTs = null
    return valDb.createReadStream()
      .on('data', data => {
        console.log('data:', data)

        // check the timestamp
        const timestamp = yid.asDate(data.key).valueOf()
        currentTs = timestamp - ( timestamp % periodMs )
        console.log('doneTs:', doneTs)
        console.log('currentTs:', currentTs)
        if (!doneTs) {
          doneTs = currentTs
        }
        if (currentTs === doneTs) {
          aggregator.add(data.value)
        }
        else {
          console.log('Putting aggregated data since the timestamp has changed ...')
          const agg = aggregator.get()
          console.log(` -> ${(new Date(doneTs)).toISOString()} @ ${period} -> ${doneTs}:`, agg)
          aggDb.put(doneTs, agg)
          aggregator.reset()

          // and finally, add this data in to the new timeframe
          aggregator.add(data.value)

          // remember this new timestamp as being the last done
          doneTs = currentTs
        }
        console.log()
      })
      .on('end', () => {
        console.log('Ended, getting the final data ...')
        const agg = aggregator.get()
        console.log('agg2:', agg)

        // only put it if we have had some readings
        if (agg.count > 0) {
          aggDb.put(currentTs, agg)
        }
      })
  }

  streamAgg(seriesName, period) {
    // figure out the period in MS
    const periodMs = ms(period)
    const prettyPeriodMs = prettyMs(periodMs)
    const aggDb = this.getPerDb(seriesName, prettyPeriodMs)

    const ee = new EventEmitter()
    aggDb.createReadStream()
      .on('data', data => {
        ee.emit('data', {
          ts: Number(data.key),
          data: data.value,
        })
      })
      .on('end', () => {
        ee.emit('end')
      })
    return ee
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
