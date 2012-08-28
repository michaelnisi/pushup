var test = require('tap').test
  , es = require('event-stream')
  , reader = require('../lib/reader.js')

test('reader', function (t) {
  var dir = '/tmp/troubled-site'
  
  reader(dir)
    .pipe(es.split())
    .pipe(es.writeArray(function (err, lines) {
      t.equals(lines.length, 3)
      console.error(lines)
      t.end()
    })
  )
})
