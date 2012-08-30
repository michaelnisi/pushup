module.exports = pushup

var validateProps = require('./lib/validateProps.js')
  , es = require('event-stream')
  , knox = require('knox')
  , Stream = require('stream').Stream
  , show = require('./lib/show.js')
  , stat = require('fs').stat
  , join = require('path').join

function pushup (props, callback) {
  var stream = new Stream()
    , client = knox.createClient(props)
    , files = show(props.repo)
    , error = validateProps(props, stream)
    , commit

  if (error) {
    if (callback) callback(error)
    return error
  }

  process.chdir(props.repo)

  stream.readable = true
  stream.writable = true

  stream.end = function () {
    stream.emit('end')
    if (callback) callback(error, commit)
  }

  stream.write = function (data) {
    if (!commit) {
      commit = data.split(' ').shift()
      stream.emit('commit', commit)
      return true
    }

    var entry = client.putFile(data, '/' + data, function (err, res) {
      if (err) {
        error = err
        stream.emit('error', err)
        return true
      }

      stream.emit('response', res)
      stream.emit('resume')
    })
    
    entry.name = data

    stream.emit('pause')
    stream.emit('entry', entry)
    
    return true
  }

  files.on('error', function (err) {
    error = err
    stream.emit('error', err)
  })

  return files.pipe(stream)
}
