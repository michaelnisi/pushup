
// cp - copy files to S3

var es = require('event-stream')
  , pushup = require('../')

module.exports = function (props, files) {
  return es.readArray(files)
    .pipe(pushup(props))
    .pipe(process.stdout)
}
