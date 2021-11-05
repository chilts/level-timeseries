class Counter {
  constructor() {
    // there are no options for this plugin
    this.reset()
  }

  reset() {
    this.count = 0
    this.total = 0
  }

  add(val) {
    // count and total
    this.count += 1
    this.total += val
  }

  get() {
    return {
      count: this.count,
      total: this.total,
    }
  }
}

// exports
module.exports = Counter
