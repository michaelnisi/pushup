#!/usr/bin/env node

var pushup = require('../index.js')
  , statSync = require('fs').statSync
  , getProps = require('../lib/getProps.js')
  , show = require('../lib/show.js')
  , statIsGit = require('../lib/statIsGit.js')
  , push = require('../lib/push.js')
  , cp = require('../lib/cp.js')
  , cpr = require('../lib/cpr.js')

;(function () {
  var arg = process.argv.splice(2)
    , props = getProps()
    , path = arg[0]

  
  
  if (statIsGit(path)) { 
    push(props, path)
  } else {
    console.log('Not implemented yet')
  }
})()

function isGit (path) {
}
