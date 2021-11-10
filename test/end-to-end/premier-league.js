// core
const fs = require('fs')

// npm
const tap = require('tap')
const yid = require('yid');
const parse = require('csv-parse/lib/sync')

// local
const TimeSeries = require('../../')
const finalTable = require('./fixtures/final-table.json')

async function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

class FootballTable {
  constructor() {
    this.reset()
  }

  reset() {
    this.team = {}
    this.count = 0
  }

  add(val) {
    this.count += 1

    // make sure the team exists
    this.team[val.home.team] = this.team[val.home.team] || this.newTeam()
    this.team[val.away.team] = this.team[val.away.team] || this.newTeam()

    // played
    this.team[val.home.team].played += 1
    this.team[val.away.team].played += 1

    // goals
    this.team[val.home.team].for += val.home.goals
    this.team[val.home.team].against += val.away.goals
    this.team[val.home.team].gd += val.home.goals - val.away.goals
    this.team[val.away.team].for += val.away.goals
    this.team[val.away.team].against += val.home.goals
    this.team[val.away.team].gd += val.away.goals - val.home.goals

    if (val.home.goals > val.away.goals) {
      // home win
      this.team[val.home.team].won += 1
      this.team[val.home.team].points += 3
      this.team[val.away.team].lost += 1
    }
    else if (val.away.goals > val.home.goals) {
      // away win
      this.team[val.away.team].won += 1
      this.team[val.away.team].points += 3
      this.team[val.home.team].lost += 1
    }
    else {
      // draw
      this.team[val.home.team].points += 1
      this.team[val.away.team].points += 1
      this.team[val.home.team].drawn += 1
      this.team[val.away.team].drawn += 1
    }
  }

  get() {
    if (this.count === 0) {
      return null
    }

    return this.team
  }

  newTeam() {
    return {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      for: 0,
      against: 0,
      gd: 0,
      points: 0,
    }
  }
}

tap.test(async t => {
  t.plan(3 + 380 + 2)

  // matches
  const csv = fs.readFileSync(__dirname + '/fixtures/premier-league-2018-2019.csv')
  const parser = parse()
  const matches = parse(csv)
  t.equal(matches.length, 381, 'CSV parsing gave 380 games plus on header line')
  matches.shift()
  t.equal(matches.length, 380, 'now 380 matches')
  t.equal(matches[0][5], 'Leicester City', 'verification of reading the columns')

  // open DB
  const filename = `/tmp/${yid()}`
  const ts = new TimeSeries(filename)
  ts.open()

  const plSeries = 'premier-league'

  // loop over all matches
  matches.forEach(async match => {
    const date = new Date(match[0] * 1000)
    const data = {
      home: {
        team: match[4],
        goals: Number(match[12]),
      },
      away: {
        team: match[5],
        goals: Number(match[13]),
      },
    }
    await ts.addObsWithTimestamp(plSeries, date, data)
    t.ok('Added match')
  })

  // wait for all observations to be written
  await sleep(1000)

  // aggregate across matches
  const from = new Date('2018-08-01T00:00:00Z')
  const to = new Date('2019-07-31T23:59:59.999Z')
  const table = await ts.aggregateRange(plSeries, new FootballTable(), from, to)

  // test one whole team
  const liverpool = {
    played: 38,
    won: 30,
    drawn: 7,
    lost: 1,
    for: 89,
    against: 22,
    gd: 67,
    points: 97
  }
  t.same(table.Liverpool, liverpool, 'Liverpool in 2nd')

  // and check the final table
  t.same(table, finalTable, 'Final table is correct')

  // get the entire table
})
