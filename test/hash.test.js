// npm
const tap = require('tap')
const yid = require('yid');

// local
const TimeSeries = require('../')

// setup
const seriesName = 'series'
const emptyHash = 'da39a3ee5e6b4b0d3255bfef95601890afd80709'
const oneObsHash = '0e9f56894eb6581a1f3f6221f5dd15c647a27f0f'

async function tsWithOneObs() {
  // open DB
  const filename = `/tmp/${yid()}`
  const ts = new TimeSeries(filename)
  ts.open()

  // add one gauge observation with a predetermined `id`
  const epoch = 1636765823919
  const d = new Date(1636765823919)
  const id = `${epoch}-5448589315637`
  await ts._addObsWithId(seriesName, id, 500)

  return ts
}

tap.test('Test hash of empty observation set', async t => {
  t.plan(2)

  // open DB
  const id = yid()
  const filename = `/tmp/${id}`
  const ts = new TimeSeries(filename)
  ts.open()

  // no observations

  // hash the entire observations (in this case, empty)
  const hash = await ts.hash(seriesName)
  t.equal(hash.length, 40, 'Hash length is correct size')
  t.equal(hash, emptyHash, 'Hash is correct')

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
  const epoch = 1636765823919
  const d = new Date(1636765823919)
  const id = `${epoch}-5448589315637`
  await ts._addObsWithId(seriesName, id, 500)

  const hash = await ts.hash(seriesName)
  t.equal(hash.length, 40, 'Hash length is correct size')
  t.equal(hash, oneObsHash, 'Hash is correct')

  ts.close()
  t.end()
})

tap.test('Test hashFromTo() with one observation', async t => {
  t.plan(8)

  // open DB
  const filename = `/tmp/${yid()}`
  const ts = new TimeSeries(filename)
  ts.open()

  // add one gauge observation with a predetermined `id`
  const epoch = 1636765823919
  const d = new Date(1636765823919)
  const id = `${epoch}-5448589315637`
  await ts._addObsWithId(seriesName, id, 500)

  // check hashFromTo
  const hashFromTo1 = await ts.hashFromTo(seriesName, d.valueOf(), d.valueOf() + 1)
  t.equal(hashFromTo1.length, 40, 'Hash length is correct size')
  t.equal(hashFromTo1, oneObsHash, 'Hash is correct')
  const hashFromTo2 = await ts.hashFromTo(seriesName, d.valueOf() - 1, d.valueOf() + 1)
  t.equal(hashFromTo2.length, 40, 'Hash length is correct size')
  t.equal(hashFromTo2, oneObsHash, 'Hash is correct')
  const hashFromTo3 = await ts.hashFromTo(seriesName, d.valueOf() + 1 , d.valueOf() + 2)
  t.equal(hashFromTo3.length, 40, 'Hash length is correct size')
  t.equal(hashFromTo3, emptyHash, 'Hash is correct')
  const hashFromTo4 = await ts.hashFromTo(seriesName, d.valueOf() -1  , d.valueOf())
  t.equal(hashFromTo3.length, 40, 'Hash length is correct size')
  t.equal(hashFromTo3, emptyHash, 'Hash is correct')

  ts.close()
  t.end()
})

tap.test('Test hashPeriod() with one observation', async t => {
  t.plan(6)

  const ts = await tsWithOneObs()

  // check hashFromTo
  const hashPeriod1 = await ts.hashPeriod(seriesName, new Date('2021-11-13T01:10:00.000Z'), '5m')
  t.equal(hashPeriod1.length, 40, 'Hash length is correct size')
  t.equal(hashPeriod1, oneObsHash, 'Hash is correct')

  const hashPeriod2 = await ts.hashPeriod(seriesName, new Date('2021-11-13T01:05:00.000Z'), '5m')
  t.equal(hashPeriod2.length, 40, 'Hash length is correct size')
  t.equal(hashPeriod2, emptyHash, 'Hash is correct')

  const hashPeriod3 = await ts.hashPeriod(seriesName, new Date('2021-11-13T01:15:00.000Z'), '5m')
  t.equal(hashPeriod3.length, 40, 'Hash length is correct size')
  t.equal(hashPeriod3, emptyHash, 'Hash is correct')

  ts.close()
  t.end()
})
