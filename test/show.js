var test = require('tap').test
  , es = require('event-stream')
  , show = require('../lib/show.js')

test('lines', function (t) {
  t.end()
  var dir = '/tmp/troubled-site'
  
  show(dir)
    .pipe(es.writeArray(function (err, lines) {
      t.equals(lines.length, 3)
      t.end()
    })
  )
})
