// cp - copy files to S3

var es = require('event-stream')
  , pushup = require('../index.js')

module.exports = cp

function cp (props, files) {
  return es.readArray(files)
    .pipe(pushup(props))
    .pipe(process.stdout)
}
