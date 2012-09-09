// stream paths of all files in a directory recursively

module.exports = cpr

var Reader = require('fstream').Reader
  , Stream = require('stream').Stream

function cpr () {
  var props = {}
    , reader = new Reader(props)
    , stream = new Stream()
  
  stream.writable = false
  stream.readable = true

  return stream
}
