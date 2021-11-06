// setup
const defaultOpts = {
  dp: 2.
}

// Gauge
class Gauge {
  constructor(opts) {
    opts = Object.assign({}, defaultOpts, opts)
    this.opts = opts

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
    if (this.count === 0) {
      return null
    }

    return {
      min: this.min,
      max: this.max,
      count: this.count,
      mean: Number((this.total / this.count).toFixed(this.opts.dp)),
    }
  }
}

// exports
module.exports = Gauge
