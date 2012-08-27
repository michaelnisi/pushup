module.exports = reader

var spawn = require('child_process').spawn
  , join = require('path').join
  , Stream = require('stream').Stream

function reader (path) {
  var stream = new Stream()
    , ps = spawn('git', ['show', '--name-only'], { cwd: path })

  ps.on('exit', function (code) {
    ps.removeAllListeners()
    ps.kill()
    stream.emit('end')
  })
  
  ps.stdout.on('data', function (data) {
    stream.emit('data', data)
  })

  ps.stderr.on('data', function (data) {
    stream.emit('error', data)
  })

  stream.readable = true
  stream.writable = false

  return stream
}
