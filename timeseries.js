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
      // create the sublevel for this entire series
      const serDb = sublevel(this.db, seriesName)

      // now create an observation sublevel
      const obsDb = sublevel(serDb, 'obs', { valueEncoding: 'json' })

      // and a parent aggregate sublevel, for all of the interval sublevels
      const aggDb = sublevel(serDb, 'agg')
      this.series[seriesName] = {
        serDb,
        obsDb,
        aggDb,
      }
    }
  }

  getSeriesDb(seriesName) {
    this.ensureDbs(seriesName)
    return this.series[seriesName].serDb
  }

  getObservationDb(seriesName) {
    this.ensureDbs(seriesName)
    return this.series[seriesName].obsDb
  }

  getAggregationDb(seriesName) {
    this.ensureDbs(seriesName)
    return this.series[seriesName].aggDb
  }

  getIntervalDb(seriesName, period) {
    // figure out the period in MS
    const periodMs = ms(period)
    const prettyPeriodMs = prettyMs(periodMs)
    const aggDb = this.getAggregationDb(seriesName)
    return sublevel(aggDb, prettyPeriodMs, { valueEncoding: 'json' })
  }

  addObs(seriesName, value) {
    const obsDb = this.getObservationDb(seriesName)
    const id = yid()
    obsDb.put(id, value)
  }

  addObsWithTimestamp(seriesName, date, value) {
    const obsDb = this.getObservationDb(seriesName)
    const id = Date.now() + '-' + String(Math.random()).substr(2, 13)
    obsDb.put(id, value)
  }

  aggregate(seriesName, period, aggregator, from, to) {
    const obsDb = this.getObservationDb(seriesName)
    const aggDb = this.getIntervalDb(seriesName, period)

    const opts = {}
    if (from) {
      opts.gte = String(from.valueOf())
    }
    if (to) {
      opts.lt = String(to.valueOf())
    }

    let doneTs = null
    let currentTs = null
    return obsDb.createReadStream(opts)
      .on('data', data => {
        console.log('data:', data)

        // check the timestamp
        const timestamp = yid.asDate(data.key).valueOf()
        const periodMs = ms(period)
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
        if (!agg) {
          // no readings, nothing to do
          return
        }

        // push the aggregated value
        aggDb.put(currentTs, agg)
      })
  }

  aggregateAll(seriesName, period, aggregator) {
    return this.aggregate(seriesName, period, aggregator, null, null)
  }

  aggregateSince(seriesName, period, aggregator, date) {
    return this.aggregate(seriesName, period, aggregator, date, null)
  }

  async aggregateLatest(seriesName, period, aggregator) {
    console.log('aggregateLatest():', seriesName, period, aggregator)
    const obsDb = this.getObservationDb(seriesName)
    const intDb = this.getIntervalDb(seriesName, period)

    // get the last date from the aggregated values so we re-do it if new data has come in
    console.log('getting the last date ...')
    const date = await this.getLastAggregationDate(seriesName, period)
    console.log('date:', date)

    if (!date) {
      // no aggregations have ever happened
      return this.aggregateAll(seriesName, period, aggregator)
    }

    return this.aggregate(seriesName, period, aggregator, date, null)
  }

  async getLastAggregationDate(seriesName, period) {
    console.log('getLastAggregationDate():', seriesName, period)
    return new Promise((resolve, reject) => {
      const intDb = this.getIntervalDb(seriesName, period)

      let lastDate = null
      const s = intDb.createKeyStream({ reverse: true, limit: 1 })
        .on('data', date => {
          const epoch = Number(date)
          lastDate = new Date(epoch)
        })
        .on('end', () => {
          console.log('end')
          resolve(lastDate)
        })
        .on('error', err => {
          console.log('err:', err)
          reject(err)
        })
      ;
    })
  }

  streamAgg(seriesName, period) {
    const intDb = this.getIntervalDb(seriesName, period)

    const ee = new EventEmitter()
    intDb.createReadStream()
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
