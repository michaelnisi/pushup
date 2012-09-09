var es = require('event-stream')

module.exports = cp

function cp (files) {
  return es.readArray(files)
}
