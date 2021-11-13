// npm
const tap = require('tap')
const yid = require('yid');

// local
const TimeSeries = require('../')

tap.test('Test hash of empty observation set', async t => {
  t.plan(2)

  // open DB
  const id = yid()
  const filename = `/tmp/${id}`
  const ts = new TimeSeries(filename)
  ts.open()

  // add some gauge observations
  const series = `series-${id}`

  // hash the entire observations (in this case, empty)
  const hash = await ts.hash(series)
  t.equal(hash.length, 40, 'Hash length is correct size')
  t.equal(hash, 'da39a3ee5e6b4b0d3255bfef95601890afd80709', 'Hash is correct')

  ts.close()
  t.end()
})

tap.test('Test hash with one observation', async t => {
  t.plan(2)

  // open DB
  const filename = `/tmp/${yid()}`
  const ts = new TimeSeries(filename)
  ts.open()

  // add one gauge observation with a predetermined `id`
  const id = '1636765823919-5448589315637'
  const series = `series-${id}`
  await ts._addObsWithId(series, id, 500)

  const hash = await ts.hash(series)
  t.equal(hash.length, 40, 'Hash length is correct size')
  t.equal(hash, '0e9f56894eb6581a1f3f6221f5dd15c647a27f0f', 'Hash is correct')

  ts.close()
  t.end()
})
