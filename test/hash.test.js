// npm
const tap = require('tap')
const yid = require('yid');

// local
const TimeSeries = require('../')

tap.test(async t => {
  t.plan(1)

  // open DB
  const filename = `/tmp/${yid()}`
  const ts = new TimeSeries(filename)
  ts.open()

  // add some gauge observations
  const series = 'req/min'
  await ts.addObs(series, 500)

  const hash = await ts.hash(series)
  console.log({ hash })
  t.equal(hash.length, 40, 'Hash length is correct size')

  ts.close()
  t.end()
})
