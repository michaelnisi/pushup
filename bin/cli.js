#!/usr/bin/env node

var env = require('../lib/env.js')
  , push = require('../lib/push.js')
  , cp = require('../lib/cp.js')
  , cpr = require('../lib/cpr.js')
  , statSync = require('fs').statSync

;(function () {
  var arg = process.argv.splice(2)
    , opts = env()
    , path = arg[0] || process.cwd()

  if (isGit(path)) {
    push(opts, path)
  } else if (statSync(path).isFile()) {
    cp(opts, arg)
  } else {
    cpr(opts, path)
  }
})()

function isGit () {
  try {
    return statSync(join(dir, '.git')).isDirectory()
  } catch (err) {
    return false
  }
}
