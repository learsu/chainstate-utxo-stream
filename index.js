var bn = require('bn.js')
var msb = require('msb128')
var through = require('through2')

module.exports = utxoStream

// see https://github.com/bitcoin/bitcoin/blob/master/src/coins.h
// for an explanation of the serializing algorithm
function utxoStream () {
  return through.obj(function (chunk, enc, done) {
    var stx = chunk.value

    // version
    var version = msb.read(stx)
    var off = version.off

    // code
    var code = msb.read(stx.slice(off))
    off += code.off
    code = parseInt(code.res, 10)

    // unspentness
    var unspentness = []
    unspentness[0] = (code & 2) != 0
    unspentness[1] = (code & 4) != 0
    var nBytes = (code >> 3) + ((code & 6) != 0 ? 0 : 1)
    if (nBytes > 0) {
      var bytes = stx.slice(off, off + nBytes)
      off += nBytes

      for (var j = 0; j < nBytes; j++) {
        for (var i = 0; i < 8; i++) {
          unspentness.push((bytes[j] & (1 << i)) != 0)
        }
      }
    }

    // txouts themselves
    for (var i = 0; i < unspentness.length; i++) {
      if (unspentness[i]) {
        var txOut = {}
        var amount = msb.read(stx.slice(off))
        txOut.amount = decompressAmount(amount.res)
        off += amount.off
        txOut.type = stx.readUInt8(off)
        txOut.address = stx.slice(off + 1, off + 21) // an address is 20 bytes
        this.push(txOut)
        off += 21
      }
    }
    done()
  })
}

// see https://github.com/bitcoin/bitcoin/blob/e8f6d54f1f58d9a5998e37367b84b427e51e1ad7/src/core.cpp
// x is expected to be a BN
function decompressAmount (x) {
  if (!(x instanceof bn))
    throw new Error('not a bn')
  // x = 0  OR  x = 1+10*(9*n + d - 1) + e  OR  x = 1+10*(n - 1) + 9
  if (x.cmpn(0) === 0)
      return 0
  x = x.subn(1)
  // x = 10*(9*n + d - 1) + e
  e = x.modn(10)
  x = x.divn(10)
  n = new bn(0)
  if (e < 9) {
      // x = 9*n + d - 1
      d = x.modn(9) + 1
      x = x.divn(9)
      // x = n
      n = x.mul(new bn(10))
      n = n.addn(d)
  } else {
      n = x.addn(1)
  }
  while (e > 0) {
      n = n.mul(new bn(10))
      e--
  }
  return n.toString()
}
