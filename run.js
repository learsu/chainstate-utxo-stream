var bcoin = require('bcoin-core')
var level = require('level')
var through = require('through2')
var utxoStream = require('./')

var db = level('./chainstate', { keyEncoding: 'hex', valueEncoding: 'hex' })
var rs = db.createReadStream({ gte: '63', lt: '64' })
rs.pipe(utxoStream())
  .pipe(through.obj(function (chunk, enc, done) {
    chunk.forEach(function (txOut) {
      txOut.txHash = txOut.txHash.toString('base64')
      formatCQL(txOut)
    })
    done()
  }))

function formatCQL (txOut) {
  txOut.addresses.forEach(function (address) {
    if (!txOut.txHash) console.log(txOut)
    console.log('%s,%d,%s,%s,%d,%d', address, txOut.idx, txOut.txHash, txOut.type, txOut.height, txOut.amount)
  })
}

process.on('uncaughtException', function (err) {
  console.err(err)
})
