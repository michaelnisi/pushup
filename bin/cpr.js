// cpr - upload directory and its entire subtree to S3

module.exports = cpr

var Reader = require('fstream').Reader
  , fish = require('fish')
  , pushup = require('../lib/index.js')

function cpr (props, path) {
  var opts = { path: path }
  var reader = new Reader(opts)
  
  return reader
    .pipe(fish('path'))
    .pipe(pushup(props))
    .pipe(process.stdout)
}
