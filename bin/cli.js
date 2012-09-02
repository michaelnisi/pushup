#!/usr/bin/env node

var pushup = require('../index.js')
  , statSync = require('fs').statSync
  , getProps = require('../lib/getProps.js')
  , show = require('../lib/show.js')

  ;(function () {
  var arg = process.argv.splice(2)
    , props = getProps()
    , repo = arg[0]

  if (!repo || !statSync(repo).isDirectory()) {
    console.error('Usage: pushup path/to/repo')
    return
  }

  props.repo = repo
  
  show(repo)
    .pipe(pushup(props))
    .pipe(process.stdout)
})()
