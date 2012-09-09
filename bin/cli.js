#!/usr/bin/env node

var getProps = require('../lib/getProps.js')
  , push = require('./push.js')
  , statIsGit = require('./statIsGit.js')
  , cp = require('./cp.js')

;(function () {
  var arg = process.argv.splice(2)
    , props = getProps()
    , path = arg[0]
  
  if (statIsGit(path)) { 
    push(props, path)
  } else {
    cp(arg).pipe(pushup)
  }
})()


