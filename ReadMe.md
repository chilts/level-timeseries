# Level TimeSeries #

A timeseries database with pluggable aggregators.

Built-in aggregators include:

* Gauge
* Counter
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
const temperature = 21.4

// add some temperature readings
ts.addVal(seriesName, temperature)

// aggregate every hour to get min, max, count, and average
ts.aggregateAll(seriesName, '1h', new Gauge())
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
