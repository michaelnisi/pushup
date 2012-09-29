// cpr - upload directory and its entire subtree to S3

module.exports = cpr

var Reader = require('fstream').Reader
  , cop = require('cop')
  , pushup = require('../lib/index.js')

function cpr (props, path) {
  var opts = { path: path }
  var reader = new Reader(opts)
  
  return reader
    .pipe(cop('path'))
    .pipe(pushup(props))
    .pipe(process.stdout)
}
