#!/usr/bin/env node

var getProps = require('../lib/getProps.js')
  , push = require('./push.js')
  , statIsGit = require('./statIsGit.js')

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
