
var test = require('tap').test
  , pushup = require('../')
  , es = require('event-stream')
  , path = require('path')
  , fs = require('fs')
  , dir = '/tmp/pushup-' + Math.floor(Math.random() * (1<<24))

test('setup', function (t) {
  fs.mkdirSync(dir, 0700)

  var filename = path.join(dir, 'hello.js')
  fs.writeFileSync(filename, 'console.log("Hello World!")')

  t.end()
})

test('files', function (t) {
  var files = [path.join(dir, 'hello.js')]
  es.readArray(files)
    .pipe(pushup())
    .pipe(es.writeArray(function (er, actual) {
      t.equal(actual.length, 1)
      t.end()
    }))
})



