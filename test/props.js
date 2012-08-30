var test = require('tap').test
  , validate = require('../lib/validateProps.js')

test('undefined', function (t) {
  t.same(validate(), new Error('props required'))
  t.end()
})

test('null', function (t) {
  t.same(validate(null), new Error('props required'))
  t.end()
})

test('empty', function (t) {
  t.same(validate({}), new Error('props required'))
  t.end()
})

test('missing', function (t) {
  t.same(validate({ key:'123' }), new Error('props.repo required'))
  t.end()
})
