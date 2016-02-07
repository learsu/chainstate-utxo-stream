var utils = require('bcoin-core').utils
var level = require('level')
var db = level('./chainstate', { keyEncoding: 'hex', valueEncoding: 'hex' })
db.get('42', function (err, res) {
  console.log(err, utils.revHex(res))
})
