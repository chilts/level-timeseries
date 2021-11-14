# SysMon #

This system monitor uses two programs, one to collect the data and ping it to
MQTT, the other to listen to it and put it into a TimeSeries database.

## Running ##

In three terminal windows, run each of `sysmon.js`, `use-memory.js`, and
`spin-cpu.js`.

```
$ node sysmon.js
$ node use-memory.js
$ node spincpu.js`
```

You should have a copy of something like `mosquitto` running locally so both of
the processes that gather stats can transmit them to `sysmon.js`.

Each will transmit it's stats every 5 seconds.

## Analysis ##

The `sysmon.js` process will aggregate all stats every 1m, 5m and 15m.

(Ends)
