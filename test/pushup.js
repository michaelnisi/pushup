
var test = require('tap').test
  , pushup = require('../')
  , es = require('event-stream')
  , rimraf = require('rimraf')
  , path = require('path')
  , fs = require('fs')

var dir = '/tmp/pushup-' + Math.floor(Math.random() * (1<<24))
  , file = path.join(dir, 'hello.js')

test('setup', function (t) {
  fs.mkdirSync(dir, 0700)
  fs.writeFileSync(file, 'console.log("Hello World!")')
  t.end()
})

test('files', function (t) {
  var files = [file]
  es.readArray(files)
    .pipe(pushup())
    .pipe(es.writeArray(function (er, actual) {
      t.equal(actual.length, 1)
      t.end()
    }))
})

test('teardown', function (t) {
  rimraf(dir, function (err) {
    fs.stat(dir, function (err) {
      t.ok(!!err, 'should clean up after ourselves')
      t.end()
    })
  })
})
