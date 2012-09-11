// stream paths of all files in a directory recursively

module.exports = cpr

var Reader = require('fstream').Reader
  , readProps = require('../lib/readProps.js')

function cpr () {
  var props = {}
    , reader = new Reader(props)
      
  return reader.pipe(readProps('path'))
}
