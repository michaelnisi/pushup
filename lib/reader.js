module.exports = reader

var spawn = require('child_process').spawn
  , join = require('path').join
  , Stream = require('stream').Stream

function reader (path) {
  var stream = new Stream()
    , opts = ['show', '--stat', '--oneline', '--name-only']
    , ps = spawn('git', opts, { cwd: path })

  ps.on('exit', function (code) {
    ps.removeAllListeners()
    ps.kill()
    stream.emit('end')
  })
  
  ps.stdout.on('data', function (data) {
    stream.emit('data', data.toString())
  })

  ps.stderr.on('data', function (data) {
    stream.emit('error', data.toString())
  })

  stream.readable = true
  stream.writable = false

  return stream
}
