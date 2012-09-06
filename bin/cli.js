#!/usr/bin/env node

var pushup = require('../index.js')
  , statSync = require('fs').statSync
  , getProps = require('../lib/getProps.js')
  , show = require('../lib/show.js')
  , push = require('../lib/push.js')
  , cp = require('../lib/cp.js')
  , cpr = require('../lib/cpr.js')

;(function () {
  var arg = process.argv.splice(2)
    , props = getProps()
    , repo = arg[0]

  if (!repo || !statSync(repo).isDirectory()) {
    console.error('Usage: pushup path/to/repo')
    return
  }

  push(props, repo)
})()
