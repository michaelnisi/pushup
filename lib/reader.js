module.exports = reader

var spawn = require('child_process').spawn
  , join = require('path').join
  , Stream = require('stream').Stream
  , fstream = require('fstream')
  , fs = require('fs')

function reader (path) {


  var stream = fstream.Reader(path)

  return stream
}
