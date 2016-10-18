'use strict'

// pushup_tests - test pushup module basics

const dir = '/tmp/pushup-' + Math.floor(Math.random() * (1 << 24))
const fs = require('fs')
const path = require('path')
const pushup = require('../')
const semver = require('semver')
const test = require('tap').test

test('setup', (t) => {
  fs.mkdirSync(dir)
  t.plan(2)
  t.ok(process.env.NODE_TEST)
  t.ok(fs.statSync(dir).isDirectory())
})

test('opts', (t) => {
  const f = pushup
  const opts = [
    null,
    { key: 'a' },
    { key: 'a', secret: 'b' }
  ]
  t.plan(opts.length)
  opts.forEach((o) => {
    t.throws(() => { f(o).write('abc') })
  })
})

test('init', (t) => {
  t.throws(() => pushup())
  t.end()
})

test('ENOENT', (t) => {
  t.plan(2)
  var f = pushup
  f('europe', 'abc', 'a', 'b')
    .on('error', (er) => {
      t.ok(er instanceof Error)
      t.is(er.code, 'ENOENT')
    })
    .write('abc')
})

test('remote', (t) => {
  var f = pushup.remote
  t.throws(() => { f('/tmp/pushup', '/path/to/a/thing.js') })
  var wanted = [
    undefined,
    undefined,
    '/thing.js',
    '/path/to/a/thing.js'
  ]
  ;[
    f(),
    f('/tmp/pushup'),
    f('/tmp/pushup', '/tmp/pushup/thing.js'),
    f('/tmp/pushup', '/tmp/pushup/path/to/a/thing.js')
  ].forEach((found, i) => {
    t.deepEqual(found, wanted[i])
  })
  t.end()
})

test('gz', (t) => {
  t.plan(3)
  var f = pushup.gz
  t.throws(f)
  var wanted = [
    '/tmp/pushup/pushup_tests.js.gz',
    '/tmp/pushup/thing.tm.gz'
  ]
  ;[
    f('/tmp/pushup', __filename),
    f('/tmp/pushup', 'path/to/a/thing.tm')
  ].forEach((found, i) => {
    t.deepEqual(found, wanted[i])
  })
  t.end()
  // TODO: We have to retain paths for S3
})

test('MetaData', (t) => {
  var f = pushup.MetaData
  t.plan(3)
  t.is(f().value('index.html'), undefined)
  t.is(f({'.html': 3600}).value('index.html'), 3600)
  t.is(f({'.html': 3600, 'index.html': 7200}).value('index.html'), 7200)
  t.end()
})

function write (name, data) {
  var fd = path.join(dir, name)
  fs.writeFileSync(fd, 'console.log("hello")')
  return fd
}

test('headers', (t) => {
  t.plan(2)
  var f = pushup.headers
  var unzipped = write('hello.js', 'console.log("hello\n")')
  var zipped
  f(unzipped, zipped, 3600, (er, headers) => {
    t.ok(!er)
    var wanted = {
      'Content-Length': 20,
      'Content-Type': 'application/javascript',
      'Cache-Control': 'max-age=3600'
    }
    t.deepEqual(headers, wanted)
    t.end()
  })
})

test('enc', (t) => {
  var f = pushup.enc

  var v = process.versions.node
  if (semver.satisfies(v, '>=6')) {
    t.throws(() => { f() })
  }

  var wanted = [
    undefined,
    undefined,
    undefined,
    'gzip'
  ]
  ;[
    f(''),
    f('some.js'),
    f('/a/thing.css'),
    f('/a/thing.css.gz')
  ].forEach((found, i) => {
    t.deepEqual(found, wanted[i])
  })

  t.end()
})

test('type', (t) => {
  var f = pushup.type
  t.plan(2)
  t.throws(f)
  t.is(f('index.html'), 'text/html; charset=UTF-8')
  t.end()
})

test('Headers', (t) => {
  t.plan(5)
  var f = pushup.Headers
  var wanted = [
    Object.create(null),
    { 'Content-Length': 128 },
    { 'Content-Type': 'text/css' },
    { 'Cache-Control': 'max-age=3600' },
    { 'Cache-Control': 'max-age=0', 'Content-Encoding': 'gzip' }
  ]
  ;[
    f(),
    f(128),
    f(null, 'text/css'),
    f(null, undefined, 3600),
    f(null, undefined, 0, 'gzip')
  ].forEach((found, i) => {
    t.deepEqual(found, wanted[i])
  })
  t.end()
})

test('zippable', (t) => {
  t.plan(8)
  var f = pushup.zippable
  var wanted = [
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    false
  ]
  ;[
    f(''),
    f('inde,x.html'),
    f('/elsewhere/index.html'),
    f('such.css'),
    f('such.js'),
    f('such.txt'),
    f('such.xml'),
    f('such.jpg')
  ].forEach((found, i) => {
    t.deepEqual(found, wanted[i])
  })
  t.end()
})

test('defaults', (t) => {
  var f = pushup.Opts.defaults

  t.plan(5)
  t.ok(f())
  t.ok(f().gzip)
  t.ok(f().ttl)
  t.ok(f({}))
  t.ok(f({}).ttl)

  t.end()
})

var rimraf = require('rimraf').sync

test('teardown', (t) => {
  t.plan(1)
  rimraf(dir)
  fs.stat(dir, (er) => {
    t.ok(!!er, 'should clean up after ourselves')
    t.end()
  })
})
