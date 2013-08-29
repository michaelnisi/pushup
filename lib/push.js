
// push - push latest commit to S3

var showf = require('showf')
  , pushup = require('../')

module.exports = function (props, path) {
  showf(path)
    .pipe(pushup(props))
    .pipe(process.stdout)
}
