var bn = require('bn.js')
var Bufferlist = require('bitcoin-bufferlist')
var through = require('through2')
require('buffertools').extend();

module.exports = utxoStream

function utxoStream () {
  return through.obj(function (chunk, enc, done) {
    var txid = chunk.key.slice(1)
    var stx = chunk.value
    this.push(unserializePrunedTX(stx))
    done()
  })
}

// see https://github.com/bitcoin/bitcoin/blob/master/src/coins.h
// for an explanation of the serializing algorithm
function unserializePrunedTX (stx) {
  var bl = new Bufferlist(stx)
  var off = 0
  var unspentness = []

  // version
  var version = bl.readVarInt(0)
  //console.log('version', version);

  // code
  var code = bl.readVarInt(1)
  //console.log('code', code);
  off = code.offset
  code = code.res
  var coinbase = (code & 1) != 0
  unspentness[0] = (code & 2) != 0
  unspentness[1] = (code & 4) != 0
  var nBytes = (code >> 3) + ((code & 6) != 0 ? 0 : 1)
  //console.log('code', code);
  //console.log('coinbase', coinbase);
  //console.log('unspentness', unspentness);
  //console.log('nBytes', nBytes);
  //console.log('offset', off);

  // unspentness
  if (nBytes > 0) {
    var bytes = bl.slice(off, off + nBytes)
    console.log('bytes', bytes);
    off += nBytes

    for (var j = 0; j < nBytes; j++) {
      for (var i = 0; i < 8; i++) {
        unspentness.push((bytes[j] & (1 << i)) != 0)
      }
    }
  }

  // txouts themselves
  var txOuts = []
  for (var i = 0; i < unspentness.length; i++) {
    if (unspentness[i]) {
      var txOut = {}
      var amount = readMSB128(bl.slice(off))
      txOut.amount = decompressAmount(amount.res)
      off += amount.off
      txOut.type = bl.readUInt8(off)
      txOut.address = bl.slice(off+1, off+21) // an address is 20 bytes
      txOuts.push(txOut)
      off += 21
    }
  }

  return {
    version: version.res,
    code: code,
    unspentness: unspentness,
    txOuts: txOuts
  }
}

// see https://github.com/bitcoin/bitcoin/blob/e8f6d54f1f58d9a5998e37367b84b427e51e1ad7/src/core.cpp
function decompressAmount (x) {
  x = new bn(x)
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

// reads an MSB 128 encoded integer
// see https://github.com/bitcoin/bitcoin/blob/e8f6d54f1f58d9a5998e37367b84b427e51e1ad7/src/serialize.h#L252
function readMSB128 (buf) {
  var n, i = 0
  while (true) {
    n = (n << 7) | (buf[i] & 0x7f)
    if (buf[i++] & 0x80)
      n++
    else
      return { res: n, off: i }
  }
}

//var buf = new Buffer('8358', 'hex')
//console.log(readMSB128(buf));
//buf = new Buffer('86af3b', 'hex')
//console.log(readMSB128(buf));
//buf = new Buffer('8bb85e', 'hex')
//console.log(readMSB128(buf));

//console.log(decompressAmount(600));
