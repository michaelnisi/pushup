module.exports = show

var spawn = require('child_process').spawn
  , es = require('event-stream')

function show (path) { 
  var opts = ['show', '--stat', '--oneline', '--name-only']
    , ps = spawn('git', opts, { cwd: path })
    , stream = ps.stdout.pipe(es.split())

  ps.on('exit', function (code) {
    ps.removeAllListeners()
    ps.kill()
  })

  ps.stderr.on('data', function (data) {
    stream.emit('error', data)
  })
  
  return stream  
}


