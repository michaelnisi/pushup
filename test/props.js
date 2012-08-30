var test = require('tap').test
  , validate = require('../lib/validateProps.js')

test('undefined', function (t) {
  var fn = function () {
    validate()
  }
  
  t.throws(fn, new Error('props required'))
  t.end()
})

test('null', function (t) {
  var fn = function () {
    validate(null)
  }
  
  t.throws(fn, new Error('props required'))
  t.end()
})

test('empty', function (t) {
  var fn = function () {
    validate({})
  }
  
  t.throws(fn, new Error('props required'))
  t.end()
})

test('missing', function (t) {
  var fn = function () {
    validate({ key:'123' })
  }
  
  t.throws(fn, new Error('props.secret required'))
  t.end()
})
