#!/usr/bin/env node

var getProps = require('../lib/getProps.js')
  , push = require('./push.js')
  , statIsGit = require('./statIsGit.js')
  , cp = require('./cp.js')
  , cpr = require('./cpr.js')
  , statSync = require('fs').statSync

// If the first argument is the path to git repository, the latest commit 
// gets pushed to S3; if the first argument is path to a plain directory
// the directory and its contents gets pushed to S3 recursively. Otherwise // the arguments are interpreted as a list of files which get pushed to S3.

// It's a bit weird that the cp and cpr modules are not really doing
// what their names suggest.

;(function () {
  var arg = process.argv.splice(2)
    , props = getProps()
    , path = arg[0]
  
  if (statIsGit(path)) { 
    push(props, path)
  } else if (statSync(path).isDirectory()) {
    cpr(props, path)
  } else {
    cp(props, arg)
  }
})()
