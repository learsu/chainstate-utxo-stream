var bcoin = require('bcoin-core')
var level = require('level')
var through = require('through2')
var utxoStream = require('./')

var db = level('/Users/stan/Library/Application Support/Bitcoin/testnet3/chainstate', { keyEncoding: 'hex', valueEncoding: 'hex' })
var rs = db.createReadStream({ gte: '63', lt: '64' })
console.time('parse-utxo')
// rs.on('data', function (data) {
  // console.log(data)
// })
rs.pipe(utxoStream())
  .pipe(through.obj(function (chunk, enc, done) {
    chunk.forEach(function (txOut) {
      txOut.txHash = txOut.txHash.toString('hex')
      console.log(txOut)
    })
    done()
  }))
  .on('end', function () {
    console.timeEnd('parse-utxo')
  })
