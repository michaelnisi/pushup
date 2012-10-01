// show - emit filenames of changed files in latest commit

module.exports = show

var spawn = require('child_process').spawn
  , es = require('event-stream')
  , Stream = require('stream').Stream

function show (path) { 
  var opts = ['show', '--oneline', '--name-only']
    , ps = spawn('git', opts, { cwd: path })
    , stream = new Stream()
    , commit = null 
    
  stream.readable = true
  stream.writable = true
  
  stream.write = function (name) {
    if (!commit) { 
      commit = name
      stream.emit('commit', commit)
      return true
    }

    stream.emit('data', name)
  }

  stream.end = function () {
    stream.emit('end')
  }
      
  ps.on('exit', function (code) {
    ps.removeAllListeners()
    ps.kill()
  })

  ps.stderr.on('data', function (data) {
    stream.emit('error', data)
  })
  
  return ps.stdout.pipe(es.split()).pipe(stream)
}


