// emit value for particular key

module.exports = fish

var Stream = require('stream').Stream

function fish (key) {
  var stream = new Stream()
  
  stream.readable = true
  stream.writable = true

  stream.write = function (obj) {
    var value = obj[key]
    if (value) stream.emit('data', value)
  }

  stream.end = function () {
    stream.emit('end')
  }
  
  return stream
}
