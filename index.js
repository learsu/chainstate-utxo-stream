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
    // if(txHash.toString('hex') === 'e119767a9a5d2aed1b112334d904dd3a067cc669c01c32df8b6d1a3feedd0604') {
      // // console.log(stx.toString('hex'))
      // console.log('version', stx.slice(0, version.off).toString('hex'))
      // return done()
    // }
    // if(txHash.toString('hex') === '6da2337104c02c9eb014442f2c45b2c7e61ac39ba8f3ee00599f023caff8884c') {
      // // console.log(stx.toString('hex'))
      // console.log('version', stx.slice(0, version.off).toString('hex'))
      // return done()
    // }
    // if(txHash.toString('hex') === '5547d1b6d922c1a1b3f80f8982cce3ea06d63b82261d8c16bf5b5a21f041bc5a') {
      // // console.log(stx.toString('hex'))
      // console.log('version', stx.slice(0, version.off).toString('hex'))
      // return done()
    // }
    // if(txHash.toString('hex') === '042640c1c26977783e5b5b1d227104951983c7222195067bd6723537f06f34aa') {
      // // console.log(stx.toString('hex'))
      // console.log('version', stx.slice(0, version.off).toString('hex'))
      // return done()
    // }
    // if(txHash.toString('hex') === '7a18fb8e8b233319746a67f2b5c7dc0cce13e31270867dd915cefae9cb06f1e3') {
      // // console.log(stx.toString('hex'))
      // console.log('version', stx.slice(0, version.off).toString('hex'))
      // return done()
    // }
    var off = version.off
    count++
      if (count % 1000 === 0) console.log(count)

    // code
    var code = msb.read(stx.slice(off))
    // if(txHash.toString('hex') === 'e119767a9a5d2aed1b112334d904dd3a067cc669c01c32df8b6d1a3feedd0604') {
      // console.log('code', stx.slice(off, off + code.off).toString('hex'))
      // console.log('code', code.res.toNumber())
    // }
    //console.log('code', code.res.toString(), code.off);
    off += code.off
    code = code.res.toNumber()

    // unspentness
    var unspentness = []
    unspentness[0] = (code & 2) != 0
    unspentness[1] = (code & 4) != 0
    //console.log(unspentness);
    // if(txHash.toString('hex') === 'e119767a9a5d2aed1b112334d904dd3a067cc669c01c32df8b6d1a3feedd0604') {
      // console.log('unspentness length', unspentness.length);
    // }
    var nBytes = (code >> 3) + ((code & 6) != 0 ? 0 : 1)
    //console.log('nBytes', nBytes);
    if (nBytes > 0) {
      var bytes = stx.slice(off, off + nBytes)
      //console.log('bytes', bytes.toString('hex'));
      // if(txHash.toString('hex') === 'e119767a9a5d2aed1b112334d904dd3a067cc669c01c32df8b6d1a3feedd0604') {
        // console.log('bytes', stx.slice(off, off + nBytes).toString('hex'))
      // }
      off += nBytes

      for (var j = 0; j < nBytes; j++) {
        for (var i = 0; i < 8; i++) {
          unspentness.push((bytes[j] & (1 << i)) != 0)
        }
      }
    }
    // if(txHash.toString('hex') === 'e119767a9a5d2aed1b112334d904dd3a067cc669c01c32df8b6d1a3feedd0604') {
      // console.log('unspentness length', unspentness.length);
    // }

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
        // if(txHash.toString('hex') === 'e119767a9a5d2aed1b112334d904dd3a067cc669c01c32df8b6d1a3feedd0604') {
          // console.log('amount', stx.slice(off, off + amount.off).toString('hex'));
          // console.log('amount', txOut.amount);
        // }
        off += amount.off
        // var type = stx.readUInt8(off)
        var type = msb.read(stx.slice(off))
        // if(txHash.toString('hex') === 'e119767a9a5d2aed1b112334d904dd3a067cc669c01c32df8b6d1a3feedd0604') {
          // console.log('type', type.res);
        // }
        off += type.off
        //console.log('type', type);
        type = type.res.toNumber()
        var size = getTypeSize(type)
        var hashOrKey = stx.slice(off, off + size)
        switch(type) {
          case 0:
            txOut.addresses = [bcoin.utils.hash2addr(hashOrKey, 'testnet3')]
            break
          case 1:
            txOut.addresses = [bcoin.utils.hash2scriptaddr(hashOrKey, 'testnet3')]
            break
          case 2:
          case 3:
            // add the prefix which is exactly the type
            var pubkey = Buffer.concat([new Buffer([type]), hashOrKey])
            txOut.addresses = [bcoin.utils.hash2addr(bcoin.utils.ripesha(pubkey), 'testnet3')]
            break
          case 4:
          case 5:
            // minus 2 gives the 02 or 03 prefix of the compressed key
            var pubkey = Buffer.concat([new Buffer([type - 2]), hashOrKey])
            // console.log('txHash', txHash.toString('hex'))
            // console.log(hashOrKey.toString('hex'))
            // console.log(stx.toString('hex'))
            // get uncompressed key
            // if(txHash.toString('hex') === 'e119767a9a5d2aed1b112334d904dd3a067cc669c01c32df8b6d1a3feedd0604') {
              // console.log('txHash', type, txHash.toString('hex'))
              // console.log('txHash', type, txHash.reverse().toString('hex'))
              // console.log('pubkey', pubkey.toString('hex'))
              // console.log('stx', stx.toString('hex'))
            // }
            pubkey = new Buffer(ec.keyFromPublic(pubkey).getPublic('hex'), 'hex')
            // get address
            txOut.addresses = [bcoin.utils.hash2addr(bcoin.utils.ripesha(pubkey), 'testnet3')]
            break
          default:
            // not a special type
            // type is actually size minus 6 (because there are 6 special types)
            // var scriptPubKey = stx.slice(off, off+size)
            // if(txHash.toString('hex') === 'e119767a9a5d2aed1b112334d904dd3a067cc669c01c32df8b6d1a3feedd0604') {
              var outputType = bcoin.script.getOutputType(hashOrKey)
              if (outputType && outputType !== 'nulldata') {
                txOut.addresses = bcoin.script.getAddressesByType(bcoin.script.decode(hashOrKey), { type: outputType, is_output: true, network: 'testnet3'})
                // if(txHash.toString('hex') === 'e119767a9a5d2aed1b112334d904dd3a067cc669c01c32df8b6d1a3feedd0604') {
                        // console.log('txHash', txHash.toString('hex'))
                        // console.log('hashOrKey', hashOrKey.toString('hex'))
                        // console.log('stx', bcoin.script.getOutputType(hashOrKey))
                        // console.log(txOut.addresses)
                // }
              } else {
                off += size
                continue parsingtxouts
              }
            // }
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
    // if(txHash.toString('hex') !== 'e119767a9a5d2aed1b112334d904dd3a067cc669c01c32df8b6d1a3feedd0604') {
      this.push(txOuts)
      done()
    // }
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
