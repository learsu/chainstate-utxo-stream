Returns a stream of blocks from given start height to given max height.

# Installation
`npm install chainstate-utxo-stream`

# Example
```javascript
var level = require('level')
var us = require('chainstate-utxo-stream')

var db = level('chainstate', { keyEncoding: 'hex', valueEncoding: 'hex' })
var rs = db.createReadStream({ gte: '\x63', lt: '\x64' })

rs.pipe(us())
  .pipe( // do what you want here )

```

# CLI example
```sh
node run.js | ../cassandra-loader/build/cassandra-loader -f stdin -host
127.0.0.1 -schema "mainnet.addresses_utxos(a_hash,idx,t_hash,type,b_height,value)" -progressRate 10000
```
