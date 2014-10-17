var us = require('./index')
var level = require('level')
var spy = require('through2-spy')

var db = level('chainstate', { keyEncoding: 'hex', valueEncoding: 'hex' })
var ws = db.createReadStream({ limit: 2, gte: '\x63', lt: '\x64' })
ws.pipe(us()).pipe(spy.obj(function (data) {
  console.log(data);
}))
