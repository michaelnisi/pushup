// upload directory recursively to S3

module.exports = cpr

var Reader = require('fstream').Reader
  , fish = require('../lib/fish.js')
  , pushup = require('../lib/index.js')

function cpr (props, path) {
  return new Reader({ path:path })
    .pipe(fish('path'))
    .pipe(pushup(props))
}
