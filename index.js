
// pushup - copy files to S3

var knox = require('knox')
  , Transform = require('stream').Transform
  , opts = require('./lib/opts.js')

module.exports = function (opts) {
  opts = opts || opts()

  var stream = new Transform()
    , client = knox.createClient(opts)

  stream._transform = function (chunk, enc, cb) {
    var file = chunk.toString()
    var entry = client.putFile(file, '/' + file, function (er, res) {
      if (er) {
        stream.emit('error', er)
      }
      stream.push(res.socket._httpMessage.url)
      entry.name = file
      stream.emit('entry', entry)
      cb()
    })
  }

  return stream
}
