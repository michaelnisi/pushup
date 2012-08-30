var test = require('tap').test
  , fs = require('fs')
  , join = require('path').join
, es = require('event-stream')
, show = require('../lib/show.js')
, dir = '/tmp/pushup-' + Math.floor(Math.random() * (1<<24))
, seq = require('seq')
, spawn = require('child_process').spawn

test('setup', function (t) {
  fs.mkdirSync(dir, 0700)
  process.chdir(dir)
  t.end()
})

test('git init', function (t) {
  var ps = spawn('git', ['init'])
  ps.stderr.pipe(process.stderr, { end:false })
  ps.on('exit', function () {
    t.ok(true, 'init should be ok')
    t.end()    
  })
})

test('write', function (t) {
  var file = join(dir, 'hello.js')
  fs.writeFile(file, 'console.log("Hello World!")', function (err) {
    t.ok(err ? false : true, 'write should be ok')
    t.end()
  })
})

test('git add', function (t) {
  spawn('git', [ 'add', 'hello.js' ]).on('exit', function (err) {
    t.ok(err ? false : true, 'add should be ok')
    t.end()
  })
})

test('git commit', function (t) {
  spawn('git', [ 'commit', '-m', '"Add hello.js"' ])
    .on('exit', function (err) {
      t.ok(err ? false : true, 'commit should be ok')
      t.end()  
    })
})

test('lines', function (t) {
  show(dir)
    .pipe(es.writeArray(function (err, lines) {
      t.equals(lines.length, 2)
      t.end()
    })
  )
})

test('teardown', function (t) {
  // clean up, will ya?
  t.end()
})

