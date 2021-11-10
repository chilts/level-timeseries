// npm
const tap = require('tap')

// local
const Gauge = require('../../aggregator/gauge.js')

// tests
tap.test(t => {
  const a = new Gauge()
  t.ok(a instanceof Gauge, 'is a gauge')
  t.equal(a.get(), null, "no observations yet")

  a.add(21.1)
  const one = {
    count: 1,
    mean: 21.1,
    min: 21.1,
    max: 21.1,
  }
  t.same(a.get(), one, "just one observation")

  a.add(21.3)
  const two = {
    count: 2,
    mean: 21.2,
    min: 21.1,
    max: 21.3,
  }
  t.same(a.get(), two, "second observation")

  a.add(21.2)
  const three = {
    count: 3,
    mean: 21.2,
    min: 21.1,
    max: 21.3,
  }
  t.same(a.get(), three, "third observation")

  a.reset()
  t.equal(a.get(), null, "aggregator has been reset")

  t.end()
})
