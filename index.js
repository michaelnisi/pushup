
// pushup - copy files to S3

var knox = require('knox')
  , Transform = require('stream').Transform
  , env = require('./lib/env.js')
  , path = require('path')

module.exports = function (opts) {
  opts = opts || env()

  var stream = new Transform()
    , client = knox.createClient(opts)

  stream._transform = function (chunk, enc, cb) {
    var file = chunk.toString()
    var entry = client.putFile(file, '/' + file, function (er, res) {
      if (er) stream.emit('error', er)
      res.on('error', function (er) {
        stream.emit('error', er)
      })
      res.on('end', function () {
        stream.push(res.socket._httpMessage.path + '\n')
        cb()
      })
      res.resume()
    })
    stream.emit('entry', entry)
  }

  return stream
}
