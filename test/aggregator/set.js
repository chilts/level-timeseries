// npm
const tap = require('tap')

// local
const Set = require('../../aggregator/set.js')

// tests
tap.test(t => {
  const a = new Set()
  t.ok(a instanceof Set, 'is a set')
  t.equal(a.get(), null, "no observations yet")

  a.add('Alice')
  t.same(a.get(), { count: 1, set: { Alice: 1 } }, "just one observation")

  a.add('Bob')
  a.add('Alice')
  t.same(a.get(), { count: 3, set: { Alice: 2, Bob: 1 }}, "second observation")

  a.reset()
  t.equal(a.get(), null, "aggregator has been reset")

  t.end()
})
