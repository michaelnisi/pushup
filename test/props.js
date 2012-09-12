var test = require('tap').test
  , validateProps = require('../lib/validateProps.js')

test('undefined', function (t) {
  t.same(validateProps(), new Error('props required'))
  t.end()
})

test('null', function (t) {
  t.same(validateProps(null), new Error('props required'))
  t.end()
})

test('empty', function (t) {
  t.same(validateProps({}), new Error('props required'))
  t.end()
})

test('missing', function (t) {
  var props = {
      key: 123
    , secret: 'beep'
    , bucket: 'boop'
    , repo: null
  }

  t.same(validateProps(props), new Error('props.repo required'))
  t.end()
})
