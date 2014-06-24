
var test = require('tap').test
  , fs = require('fs')
  , dir = '/tmp/pushup-' + Math.floor(Math.random() * (1<<24))

test('setup', function (t) {
  fs.mkdirSync(dir, 0700)
  t.plan(2)
  t.ok(process.env.NODE_TEST)
  t.ok(fs.statSync(dir).isDirectory())
  t.end()
})

var pushup = require('../')

test('opts', function (t) {
  t.plan(3)
  var f = pushup
  ;[null
  , { key:'a' }
  , { key:'a', secret:'b' }
  ].forEach(function (opts) {
    t.throws(function () { f(opts).write('abc') })
  })
  t.end()
})

test('ENOENT', function (t) {
  t.plan(1)
  var f = pushup
  f({ key:'a', secret:'b', bucket:'abc'})
    .on('error', function (er) {
      t.ok(!!er)
      t.end()
    })
    .write('abc')
})

test('remote', function (t) {
  var f = pushup.remote
  t.throws(function () { f('/tmp/pushup', '/path/to/a/thing.js') })
  var wanted = [
    undefined
  , undefined
  , '/thing.js'
  , '/path/to/a/thing.js'
  ]
  ;[
    f()
  , f('/tmp/pushup')
  , f('/tmp/pushup', '/tmp/pushup/thing.js')
  , f('/tmp/pushup', '/tmp/pushup/path/to/a/thing.js')
  ].forEach(function (found, i) {
    t.deepEqual(found, wanted[i])
  })
  t.end()
})

test('gz', function (t) {
  t.plan(3)
  var f = pushup.gz
  t.throws(f)
  var wanted = [
    '/tmp/pushup/pushup_tests.js.gz'
  , '/tmp/pushup/thing.tm.gz'
  ]
  ;[
    f('/tmp/pushup', __filename)
  , f('/tmp/pushup', 'path/to/a/thing.tm')
  ].forEach(function (found, i) {
    t.deepEqual(found, wanted[i])
  })
  t.end()
  // TODO: We have to retain paths for S3
})

test('TTL', function (t) {
  var f = pushup.TTL
  t.plan(3)
  t.is(f().age('index.html'), undefined)
  t.is(f({'.html':3600}).age('index.html'), 3600)
  t.is(f({'.html':3600, 'index.html':7200}).age('index.html'), 7200)
  t.end()
})

var path = require('path')

function write(name, data) {
  var fd = path.join(dir, name)
  fs.writeFileSync(fd, 'console.log("hello")')
  return fd
}

test('headers', function (t) {
  t.plan(2)
  var f = pushup.headers
    , unzipped = write('hello.js', 'console.log("hello\n")')
    , zipped = undefined
  f(unzipped, zipped, 3600, function (er, headers) {
    t.ok(!er)
    var wanted = {
      'Content-Length': 20
    , 'Content-Type': 'application/javascript'
    , 'Cache-Control': 'max-age=3600'
    }
    t.deepEqual(headers, wanted)
    t.end()
  })
})

test('enc', function (t) {
  t.plan(5)
  var f = pushup.enc
  var wanted = [
    undefined
  , undefined
  , undefined
  , undefined
  , 'gzip'
  ]
  ;[
    f()
  , f('')
  , f('some.js')
  , f('/a/thing.css')
  , f('/a/thing.css.gz')
  ].forEach(function (found, i) {
    t.deepEqual(found, wanted[i])
  })
  t.end()
})

test('type', function (t) {
  var f = pushup.type
  t.plan(2)
  t.throws(f)
  t.is(f('index.html'), 'text/html; charset=UTF-8')
  t.end()
})

test('Headers', function (t) {
  t.plan(5)
  var f = pushup.Headers
  var wanted = [
    Object.create(null)
  , { 'Content-Length': 128 }
  , { 'Content-Type': 'text/css' }
  , { 'Cache-Control': 'max-age=3600' }
  , { 'Cache-Control': 'max-age=0', 'Content-Encoding': 'gzip' }
  ]
  ;[
    f()
  , f(128)
  , f(null, 'text/css')
  , f(null, undefined, 3600)
  , f(null, undefined, 0, 'gzip')
  ].forEach(function (found, i) {
    t.deepEqual(found, wanted[i])
  })
  t.end()
})

test('zippable', function (t) {
  t.plan(8)
  var f = pushup.zippable
  var wanted = [
    false
  , true
  , true
  , true
  , true
  , true
  , true
  , false
  ]
  ;[
    f('')
  , f('index.html')
  , f('/elsewhere/index.html')
  , f('such.css')
  , f('such.js')
  , f('such.txt')
  , f('such.xml')
  , f('such.jpg')
  ].forEach(function (found, i) {
    t.deepEqual(found, wanted[i])
  })
  t.end()
})

test('defaults', function (t) {
  t.plan(6)
  var f = pushup.defaults
  t.ok(!!f())
  t.is(f().gzip, false)
  t.ok(!!f().ttl)
  t.ok(!!f({}))
  t.is(f({gzip:true}).gzip, true)
  t.ok(!!f({}).ttl)
  t.end()
})

test('conf', function (t) {
  t.plan(4)
  var f = pushup.conf
  t.throws(f)
  var env = {
    AWS_ACCESS_KEY_ID: 'a'
  , AWS_SECRET_ACCESS_KEY: 'b'
  , S3_BUCKET: 'c'
  , S3_REGION: 'd'
  , S3_ENDPOINT: 'e'
  }
  function opts (key, secret, bucket, region, endpoint) {
    return {
      key: key
    , secret: secret
    , bucket: bucket
    , region: region
    , endpoint: endpoint
    }
  }
  t.deepEqual(f({}, env), opts('a', 'b', 'c', 'd', 'e'))
  t.deepEqual(f(opts('a', 'b', 'c', 'd')), opts('a', 'b', 'c', 'd'))
  t.deepEqual(f({key:'aa', secret:'bb'}, env), opts('aa', 'bb', 'c', 'd', 'e'))
  t.end()
})

var rimraf = require('rimraf').sync

test('teardown', function (t) {
  t.plan(1)
  rimraf(dir)
  fs.stat(dir, function (er) {
    t.ok(!!er, 'should clean up after ourselves')
    t.end()
  })
})
