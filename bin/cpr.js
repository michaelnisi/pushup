// cpr - upload directory and its entire subtree to S3

module.exports = cpr

var Reader = require('fstream').Reader
  , cop = require('cop')
  , pushup = require('../index.js')
  , relative = require('path').relative

function cpr (props, path) {
 var opts = { path: path }
   , reader = new Reader(opts)
  
  process.chdir(path)
  
  return reader
    .pipe(cop(relativize))
    .pipe(pushup(props))
    .pipe(process.stdout)
}

function relativize (obj) {
  return relative(process.cwd(), obj.path)
}
