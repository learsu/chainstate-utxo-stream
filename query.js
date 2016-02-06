var bcoin = require('bcoin-core')
var bn = require('bn.js')
var level = require('level')
var msb = require('msb128')
var db = level('./chainstate', { keyEncoding: 'hex', valueEncoding: 'hex' })
// db.get(new Buffer('630406ddee3f1a6d8bdf321cc069c67c063add04d93423111bed2a5d9a7a7619e1', 'hex'), function (err, res) {
// db.get(new Buffer('6300d2138f1b85666a4e30a156ede6b4a11a27f202e77ea69565ead9101552cdda', 'hex'), function (err, res) {
  // console.log(err, res.toString('hex'))
// })
var buf1 = new Buffer('012cffffffff7f843f8221512103b1099d0a7e5576093e781fcfe61888f6d7cbc08ca47da561ed6fcfd90bbeae5421200000', 'hex')
var buf2 = new Buffer('0109044086ef97d5790061b01caab50f1b8e9c50a5057eb43c2d9563a4eebbd123008c988f1a4a4de2161e0f50aac7f17e7f9555caa486af3b', 'hex')
var buf = new Buffer('018040ffff7ff8ffff00c0ffffffffffffffffffffffffffffffff7f05006de332fe2da7324bc9be8f12b006cd383c0cae17', 'hex')
function decodeThatShit(buf) {
  var version = msb.read(buf)
  var off = version.off
  var code = msb.read(buf.slice(off))
  off += code.off
  console.log('code', code, code.res.toNumber())
  code = code.res
  var unspentness = []
  unspentness[0] = (code & 2) != 0
  unspentness[1] = (code & 4) != 0
  console.log(unspentness)
  var nBytes = (code >> 3) + ((code & 6) != 0 ? 0 : 1)
  console.log('nBytes',nBytes)
  while (nBytes > 0) {
    var chAvail = buf.readUInt8(off)
    for (var p = 0; p < 8; p++) {
      var f = (chAvail & (1 << p)) != 0
      unspentness.push(f)
    }
    off++
    if (chAvail !== 0) nBytes--
  }
  console.log('unspentness length', unspentness.length);
  console.log(unspentness)
}
// decodeThatShit(buf)
// decodeThatShit(buf2)

function getBuf(str, cb) {
  db.get(new Buffer('63'+bcoin.utils.revHex(str), 'hex'), function (err, res) {
    console.log(bcoin.utils.revHex(str))
    console.log(err, res.toString('hex'))
    cb(new Buffer(res, 'hex'))
  })
}
getBuf(process.argv[2], function (b) {
  decodeThatShit(b)
})
console.log(decompressAmount(msb.read(new Buffer('05', 'hex')).res))
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

vout = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  true,
  true,
  false,
  false,
  false,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
]

function calcMaskSize(nBytes, nNonZeroBytes) {
  var nLastUsedByte = 0
  for (var b = 0; 2 + b*8 < vout.length; b++) {
    var fZero = true
    for (var i = 0; (i < 8) && (2 + b*8 + i) < vout.length; i++) {
      if (vout[2+b*8+i]) {
        fZero = false
        continue
      }
    }
    if (!fZero) {
      nLastUsedByte = b+1
      nNonZeroBytes++
    }
  }
  nBytes += nLastUsedByte
  console.log(nBytes, nNonZeroBytes)
  return nBytes
}
// calcMaskSize(0, 0)
function computeSpentnessBitmask (nMaskSize) {
  var bitmask = []
  for (b = 0; b < nMaskSize; b++) {
    var chAvail = 0
    for (var i = 0; (i < 8) && (2+b*8+i) < vout.length; i++) {
      if (vout[2+b*8+i]) {
        chAvail |= (1 << i)
      }
    }
    bitmask.push(chAvail)
  }
  console.log('bitmask', bitmask)
  return bitmask
}
// computeSpentnessBitmask(6)
function computeSpentnessBitvector(bitmask, nMaskCode) {
  while (nMaskCode > 0) {
    var chAvail = bitmask.shift()
    console.log(chAvail)
    if (chAvail !== 0) nMaskCode--
  }
}
// computeSpentnessBitvector(computeSpentnessBitmask(6), 5)
