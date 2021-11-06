# Level TimeSeries #

A timeseries database with pluggable aggregators.

Built-in aggregators include:

* Gauge
* Counter
* Timer
* Set

Inspiration gleaned from
[Monitoring Statsd Metrics](https://sysdig.com/blog/monitoring-statsd-metrics/)
and
[Metric Types](https://github.com/statsd/statsd/blob/master/docs/metric_types.md).

## Synopsis ##

```
const TimeSeries = require('level-timeseries')
const gauge = require('level-timeseries/aggregator/gauge')

const seriesName = 'temperature'

// add some temperature observations
ts.addObs(seriesName, 21.4)
ts.addObs(seriesName, 20.9)
ts.addObs(seriesName, 20.5)

// aggregate every hour to get min, max, count, and mean
ts.aggregateAll(seriesName, '1h', new Gauge())

// loop over our aggregated values
ts.streamAgg(seriesName, '1h')
  .on('data', console.log)
  .on('end', () => console.log('Done'))
```

## About ##


```
   ╒════════════════════════════════════════════════════╕
   │                                                    │
   │   Andrew Chilton (Personal)                        │
   │   -------------------------                        │
   │                                                    │
   │          Email : andychilton@gmail.com             │
   │            Web : https://chilts.org                │
   │        Twitter : https://twitter.com/andychilton   │
   │         GitHub : https://github.com/chilts         │
   │                                                    │
   │   Apps Attic Ltd (My Company)                      │
   │   ---------------------------                      │
   │                                                    │
   │          Email : chilts@appsattic.com              │
   │            Web : https://appsattic.com             │
   │        Twitter : https://twitter.com/AppsAttic     │
   │         GitLab : https://github.com/appsattic      │
   │                                                    │
   │   Node.js / npm                                    │
   │   -------------                                    │
   │                                                    │
   │        Profile : https://www.npmjs.com/~chilts     │
   │           Card : $ npx chilts                      │
   │                                                    │
   ╘════════════════════════════════════════════════════╛
   ```

(Ends)
