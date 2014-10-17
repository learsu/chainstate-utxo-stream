Returns a stream of blocks from given start height to given max height.

# Installation
`npm install bitcoind-block-stream`

# Example
```javascript
var bitcoin = require('bitcoin')
var bs = require('./index')
var level = require('level')
var map = require('through2-map')

var client = new bitcoin.Client(require('./bitcoin.json'))
var db = level('testdb')

var ws = db.createWriteStream({ valueEncoding: 'json' })
ws.on('error', function (err) {
  console.log('Oh my!', err)
})
ws.on('close', function () {
  console.log('Stream closed')
})

bs(client, { max: 12 })
  .pipe(map.obj(function (x) { return { key: x.hash, value: x } }))
  .pipe(ws)
```
