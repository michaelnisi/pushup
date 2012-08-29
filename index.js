module.exports = pushup

var validateProps = require('./lib/validateProps.js')
  , es = require('event-stream')
  , knox = require('knox')
  , Stream = require('stream').Stream
  , show = require('./lib/show.js')
  , stat = require('fs').stat
  , join = require('path').join

function pushup (props) {
  var stream = new Stream()
    , client = knox.createClient(props)
    , files = show(props.repo)
  
  process.chdir(props.repo)

  stream.readable = true
  stream.writable = true

  stream.end = function () {
    stream.emit('end')
  }

  stream.write = function (file) {
    stat(file, function (err, stats) {
     if (err || !stats.isFile()) {
        return true // just skip it
      }
    
      var entry = client.putFile(file, '/' + file, function (err, res) {
        if (err) {
          stream.emit('error', err)
          return
        }

        stream.emit('response', res)
        stream.emit('resume')
      })
      
      entry.name = file

      stream.emit('pause')
      stream.emit('entry', entry)
      
      return true
    })
  }

  return files.pipe(stream)
}
