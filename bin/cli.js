#!/usr/bin/env node

var getProps = require('../lib/getProps.js')
  , push = require('../lib/push.js')
  , statIsGit = require('../lib/statIsGit.js')
  , cp = require('../lib/cp.js')
  , cpr = require('../lib/cpr.js')
  , statSync = require('fs').statSync

;(function () {
  var arg = process.argv.splice(2)
    , props = getProps()
    , path = arg[0] || process.cwd()

  if (statIsGit(path)) {
    push(props, path)
  } else if (statSync(path).isFile()) {
    cp(props, arg)
  } else {
    cpr(props, path)
  }
})()
