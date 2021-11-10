// npm
const tap = require('tap')

// local
const Counter = require('../../aggregator/counter.js')

// tests
tap.test(t => {
  const a = new Counter()
  t.ok(a instanceof Counter, 'is a counter')
  t.equal(a.get(), null, "no observations yet")

  a.add(1)
  t.same(a.get(), { count: 1, total: 1 }, "just one observation")

  a.add(2)
  t.same(a.get(), { count: 2, total: 3 }, "second observation")

  a.reset()
  t.equal(a.get(), null, "aggregator has been reset")

  t.end()
})
