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

## Aggregators ##

### counter ###

```
const TimeSeries = require('level-timeseries')
const counter = require('level-timeseries/aggregator/counter')

// setup
const ts = new TimeSeries('data.db')
ts.open()
const name = 'logins'

// add some login observations
ts.addObs(name, 5)

// some time later
ts.addObs(name, 1)

// some more time later
ts.addObs(name, 19)

// aggregate every day to get count and total
ts.aggregateAll(seriesName, '1d', new Counter())

// loop over our aggregated values
ts.streamAgg(seriesName, '1h')
  .on('data', console.log)
  .on('end', () => console.log('Done'))

// tidy up
ts.close()
```

### gauge ###

ToDo: ... !!!

### timer ###

ToDo: ... !!!

### set ###

ToDo: ... !!!

## Creating your own Aggregator ##

Whilst `level-timeseries` comes with a few built-in aggregators, it's very easy
to create your own.

Here are some examples you can go and study.

### Example: Premier League Table ###

In the tests, there is an example of a Premier League aggregator which takes
each observation (i.e. a game result) and builds up a table of standings. By
aggregating over a specific period of time - Aug 2019 until May 2020 - we
process all 380 observations (20 teams, each playing 38 games) and give each
team win/drawn/loss, goals for/against/difference, and of course points.

Please see the GitHub repo for more details. ToDo: ... !!!

### Example: Candlestick charts for Trading ###

ToDo: ... !!!

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
