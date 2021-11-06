// setup
const defaultOpts = {
  percentiles: [
    90,
  ],
  dp: 2,
}

// Timer
class Timer {
  constructor(opts) {
    opts = Object.assign({}, defaultOpts, opts)
    this.opts = opts

    this.reset()
  }

  reset() {
    this.observations = []
    this.min = Infinity
    this.max = -Infinity
    this.count = 0
    this.total = 0
  }

  add(val) {
    // count and total
    this.observations.push(val)
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

    // firstly, figure out all of the percentiles
    const percentile = {}
    this.opts.percentiles.forEach(p => {
      const item = {
        value: this.max * p / 100.0,
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
      }

      this.observations.forEach(v => {
        if ( v > item.value ) {
          item.count += 1
          item.total += v
          item.min = Math.min(item.min, v)
          item.max = Math.max(item.max, v)
        }
      })

      // calculate the mean of these values
      item.mean = Number((item.total / item.count).toFixed(this.opts.dp))

      // and fix the total since it can go funny with lots of decimal places
      item.total = Number(item.total.toFixed(this.opts.dp))

      percentile[String(p)] = item
    })

    return {
      min: this.min,
      max: this.max,
      count: this.count,
      mean: Number((this.total / this.count).toFixed(this.opts.dp)),
      percentile,
    }
  }
}

// exports
module.exports = Timer
