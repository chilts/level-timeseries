// core
const EventEmitter = require('events')
const crypto = require('crypto')

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

  close() {
    this.filename = null
    this.db.close()
    this.series = {}
  }

  _ensureDbs(seriesName) {
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

  _getSeriesDb(seriesName) {
    this._ensureDbs(seriesName)
    return this.series[seriesName].serDb
  }

  _getObservationDb(seriesName) {
    this._ensureDbs(seriesName)
    return this.series[seriesName].obsDb
  }

  _getAggregationDb(seriesName) {
    this._ensureDbs(seriesName)
    return this.series[seriesName].aggDb
  }

  _getIntervalDb(seriesName, period) {
    // figure out the period in MS
    console.log('period:', period)
    const periodMs = ms(period)
    console.log('periodMs:', periodMs)
    const prettyPeriodMs = prettyMs(periodMs)
    console.log('prettyPeriodMs:', prettyPeriodMs)
    const aggDb = this._getAggregationDb(seriesName)
    return sublevel(aggDb, prettyPeriodMs, { valueEncoding: 'json' })
  }

  addObs(seriesName, value) {
    const obsDb = this._getObservationDb(seriesName)
    const id = yid()
    return obsDb.put(id, value)
  }

  addObsWithTimestamp(seriesName, date, value) {
    const obsDb = this._getObservationDb(seriesName)
    const id = yid.fromDate(new Date(date))
    return obsDb.put(id, value)
  }

  // for testing purposes, to test the `hash()` stuff
  _addObsWithId(seriesName, id, value) {
    const obsDb = this._getObservationDb(seriesName)
    return obsDb.put(id, value)
  }

  aggregate(seriesName, period, aggregator, from, to) {
    const obsDb = this._getObservationDb(seriesName)
    const aggDb = this._getIntervalDb(seriesName, period)

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
        console.log('key:', data.key)
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

  // doesn't write to the DB, just returns the aggregation
  aggregateRange(seriesName, aggregator, from, to) {
    return new Promise((resolve, reject) => {
      const obsDb = this._getObservationDb(seriesName)

      const opts = { gte: from.valueOf(), lt: to.valueOf() }
      return obsDb.createReadStream(opts)
        .on('data', data => {
          aggregator.add(data.value)
        })
        .on('end', () => {
          const agg = aggregator.get()
          if (!agg) {
            // no readings, nothing to do
            resolve(null)
            return
          }

          // return the aggregated value
          resolve(agg)
        })
        .on('error', reject)
      ;
    })
  }

  async aggregateLatest(seriesName, period, aggregator) {
    console.log('aggregateLatest():', seriesName, period, aggregator)
    const obsDb = this._getObservationDb(seriesName)
    const intDb = this._getIntervalDb(seriesName, period)

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
      const intDb = this._getIntervalDb(seriesName, period)

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

  streamInterval(seriesName, period) {
    const intDb = this._getIntervalDb(seriesName, period)

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

  hash(seriesName) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha1')
      const obsDb = this._getObservationDb(seriesName)
      return obsDb.createReadStream()
        .on('data', data => {
          const str = data.key + ' = ' + JSON.stringify(data.value) + '\n'
          console.log(str)
          hash.update(str)
        })
        .on('end', () => {
          resolve(hash.digest('hex'))
        })
        .on('error', reject)
      ;
    })
  }
}

// exports
module.exports = TimeSeries
