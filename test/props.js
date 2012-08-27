var test = require('tap').test
  , push = require('../index.js')

test('undefined', function (t) {
  var fn = function () {
    push()
  }
  
  t.throws(fn, new Error('Props are required.'))
  t.end()
})

test('null', function (t) {
  var fn = function () {
    push(null)
  }
  
  t.throws(fn, new Error('Props are required.'))
  t.end()
})

test('empty', function (t) {
  var fn = function () {
    push({})
  }
  
  t.throws(fn, new Error('Required properties: port'))
  t.end()
})

test('missing', function (t) {
  var fn = function () {
    push({ accessKeyId:'123' })
  }
  
  t.throws(fn, new Error('port is required.'))
  t.end()
})
