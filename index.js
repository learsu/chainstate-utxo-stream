var bcoin = require('bcoin-core')
var bn = require('bn.js')
var msb = require('msb128')
var through = require('through2')
var EC = require('elliptic').ec
var ec = new EC('secp256k1')

module.exports = utxoStream

// see https://github.com/bitcoin/bitcoin/blob/master/src/coins.h
// for an explanation of the serializing algorithm
var current
process.on('uncaughtException', function (err) {
  console.log(err)
  console.log(current)
})
var count = 0
function utxoStream () {
  return through.obj(function (chunk, enc, done) {
    chunk.key = new Buffer(chunk.key, 'hex')
    chunk.value = new Buffer(chunk.value, 'hex')
    var stx = chunk.value
    var txHash = chunk.key.slice(1).reverse()
    current = txHash.toString('hex')
    //console.log('key', chunk.key.reverse().toString('hex'));
    //console.log(stx.toString('hex'));

    // version
    var version = msb.read(stx)
    // console.log('version', version.res);
    var off = version.off
    count++
      if (count % 1000 === 0) console.log(count)

    // code
    var code = msb.read(stx.slice(off))
    //console.log('code', code.res.toString(), code.off);
    off += code.off
    code = code.res.toNumber()

    // unspentness
    var unspentness = []
    unspentness[0] = (code & 2) != 0
    unspentness[1] = (code & 4) != 0
    //console.log(unspentness);
    var nBytes = (code >> 3) + ((code & 6) != 0 ? 0 : 1)
    //console.log('nBytes', nBytes);
    while (nBytes > 0) {
      var chAvail = stx.readUInt8(off)
      for (var p = 0; p < 8; p++) {
        var f = (chAvail & (1 << p)) != 0
        unspentness.push(f)
      }
      off++
      if (chAvail !== 0) nBytes--
    }

    // txouts themselves
    var txOuts = []
    parsingtxouts: for (var i = 0; i < unspentness.length; i++) {
      if (unspentness[i]) {
        var txOut = {
          txHash: txHash,
          idx: i
        }
        //console.log('stx', stx.slice(off, off + 30).toString('hex'));
        var amount = msb.read(stx.slice(off))
        //console.log('amount', amount.res.toString(), off);
        txOut.amount = decompressAmount(amount.res)
        off += amount.off
        // var type = stx.readUInt8(off)
        var type = msb.read(stx.slice(off))
        off += type.off
        //console.log('type', type);
        type = type.res.toNumber()
        var size = getTypeSize(type)
        var hashOrKey = stx.slice(off, off + size)
        switch(type) {
          case 0:
            txOut.addresses = [bcoin.utils.hash2addr(hashOrKey, 'mainnet')]
            break
          case 1:
            txOut.addresses = [bcoin.utils.hash2scriptaddr(hashOrKey, 'mainnet')]
            break
          case 2:
          case 3:
            // add the prefix which is exactly the type
            var pubkey = Buffer.concat([new Buffer([type]), hashOrKey])
            txOut.addresses = [bcoin.utils.hash2addr(bcoin.utils.ripesha(pubkey), 'mainnet')]
            break
          case 4:
          case 5:
            // minus 2 gives the 02 or 03 prefix of the compressed key
            var pubkey = Buffer.concat([new Buffer([type - 2]), hashOrKey])
            // get uncompressed key
            pubkey = new Buffer(ec.keyFromPublic(pubkey).getPublic('hex'), 'hex')
            // get address
            txOut.addresses = [bcoin.utils.hash2addr(bcoin.utils.ripesha(pubkey), 'mainnet')]
            break
          default:
            // not a special type
            // type is actually size minus 6 (because there are 6 special types)
            // var scriptPubKey = stx.slice(off, off+size)
            var outputType = bcoin.script.getOutputType(hashOrKey)
            if (outputType && outputType !== 'nulldata') {
              txOut.addresses = bcoin.script.getAddressesByType(bcoin.script.decode(hashOrKey), { type: outputType, is_output: true, network: 'mainnet'})
            } else {
              off += size
              continue parsingtxouts
            }
        }
        //console.log('address', txOut.address);
        txOuts.push(txOut)
        off += size
      }
    }
    // block height
    var height = msb.read(stx.slice(off)).res.toNumber()
    txOuts.forEach(function (txOut) {
      txOut.height = height
    })
    this.push(txOuts)
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

function getTypeSize (n) {
  // basically a hash160 of a pubkey
  if (n == 0 || n == 1)
      return 20
  // basically a compressed pubkey
  if (n == 2 || n == 3 || n == 4 || n == 5)
      return 32
  // basically the size of the following script minus 6 to reserve space for the special types
  return (n-6);
}
