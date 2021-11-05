class Set {
  constructor() {
    // there are no options for this plugin
    this.reset()
  }

  reset() {
    this.count = 0
    this.set = {}
  }

  add(val) {
    // count and total
    this.count += 1
    this.set[val] = this.set[val] || 0
    this.set[val] += 1
  }

  get() {
    return {
      count: this.count,
      set: this.set,
    }
  }
}

// exports
module.exports = Set
