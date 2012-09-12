// upload directory recursively to S3

module.exports = cpr

var Reader = require('fstream').Reader
  , fish = require('../lib/fish.js')
  , pushup = require('../lib/index.js')

function cpr (props, path) {
  var opts = { path: path }
  var reader = new Reader(opts)
  
  return reader
    .pipe(fish('path'))
    .pipe(pushup(props))
    .pipe(process.stdout)
}
