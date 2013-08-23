#!/usr/bin/env node

var opts = require('../lib/opts.js')
  , push = require('../lib/push.js')
  , cp = require('../lib/cp.js')
  , cpr = require('../lib/cpr.js')
  , isgit = require('isgit')
  , statSync = require('fs').statSync

;(function () {
  var arg = process.argv.splice(2)
    , opts = opts()
    , path = arg[0] || process.cwd()

  if (isgit(path)) {
    push(opts, path)
  } else if (statSync(path).isFile()) {
    cp(opts, arg)
  } else {
    cpr(opts, path)
  }
})()
