Returns a stream of blocks from given start height to given max height.

# Installation
`npm install chainstate-utxo-stream`

# Example
```javascript
var level = require('level')
var us = require('chainstate-utxo-stream')

var db = level('chainstate')
var rs = db.createReadStream({ keyEncoding: 'hex', valueEncoding: 'hex' })

rs.pipe(us())
  .pipe( // do what you want here )

```
