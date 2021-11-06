// npm
const tap = require('tap')

// local
const Timer = require('../aggregator/timer.js')

// tests
tap.test(t => {
  const a = new Timer()
  t.ok(a instanceof Timer, 'is a timer')
  t.equal(a.get(), null, "no observations yet")

  a.add(76.0)
  const one = {
    count: 1,
    min: 76.0,
    mean: 76.0,
    max: 76.0,
    percentile: {
      90: {
        value: 68.4,
        count: 1,
        min: 76.0,
        max: 76.0,
        mean: 76.0,
        total: 76.0,
      },
    },
  }
  t.same(a.get(), one, "just one observation")

  a.add(77.0)
  a.add(21.0)
  const two = {
    count: 3,
    min: 21.0,
    max: 77.0,
    mean: 58.0,
    percentile: {
      90: {
        value: 69.3,
        count: 2,
        total: 153.0,
        min: 76.0,
        max: 77.0,
        mean: 76.5,
      }
    },
  }
  t.same(a.get(), two, "second observation")

  a.reset()
  t.equal(a.get(), null, "aggregator has been reset")

  t.end()
})

tap.test('no percentiles (just like a gauge)', t => {
  const a = new Timer({
    percentiles: [],
  })

  // observations
  a.add(76.0)
  a.add(25.1)
  a.add(77.5)
  const exp = {
    min: 25.1,
    max: 77.5,
    count: 3,
    mean: 59.53,
    percentile: {},
  }
  t.same(a.get(), exp, "lots of observations but no percentiles")

  t.end()
})

tap.test('multiple percentiles', t => {
  const a = new Timer({
    percentiles: [ 75, 90, 95 ],
  })

  // observations
  a.add(76.0)
  a.add(25.1)
  a.add(77.5)
  a.add(71.3)
  a.add(64.9)
  a.add(60.6)
  a.add(77.0)
  a.add(21.0)
  const exp = {
    min: 21,
    max: 77.5,
    count: 8,
    mean: 59.17,
    percentile: {
      75: {
        value: 58.125,
        count: 6,
        total: 427.30,
        min: 60.6,
        max: 77.5,
        mean: 71.22,
      },
      90: {
        value: 69.75,
        count: 4,
        total: 301.8,
        min: 71.3,
        max: 77.5,
        mean: 75.45,
      },
      95: {
        value: 73.625,
        count: 3,
        total: 230.5,
        min: 76,
        max: 77.5,
        mean: 76.83,
      },
    },
  }
  t.same(a.get(), exp, "lots of observations and percentiles")

  t.end()
})
