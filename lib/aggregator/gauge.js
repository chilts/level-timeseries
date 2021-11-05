class Gauge {
  constructor() {
    // there are no options for this plugin
    this.reset()
  }

  reset() {
    this.min = Infinity
    this.max = -Infinity
    this.count = 0
    this.total = 0
  }

  add(val) {
    // count and total
    this.count += 1
    this.total += val

    // min and max
    this.min = Math.min(this.min, val)
    this.max = Math.max(this.max, val)
  }

  get() {
    return {
      min: this.min,
      max: this.max,
      count: this.count,
      average: this.total / this.count,
    }
  }
}

// exports
module.exports = Gauge
