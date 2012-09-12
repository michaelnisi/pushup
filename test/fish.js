var test = require('tap').test
  , es = require('event-stream')
  , fish = require('../lib/fish.js')

test('fish', function(t) {
  var objs = [
    { name: 'Moe' }
  , { name: 'Larry' }
  , { name: 'Curly' }
  , { id: '123' } 
  ]

  var expected = ['Moe', 'Larry', 'Curly']

  es.readArray(objs)
    .pipe(fish('name'))
    .pipe(es.writeArray(function (err, lines) {
      t.equals(3, lines.length)
      t.deepEquals(lines, expected, 'should be array of names')      
      t.end()
    }))
})
