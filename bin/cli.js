#!/usr/bin/env node

var pushup = require('../index.js')
  , statSync = require('fs').statSync
  , getProps = require('../lib/getProps.js')

;(function () {
  var arg = process.argv.splice(2)
    , props = getProps()
    , repo = arg[0]

  if (!repo || !statSync(repo).isDirectory()) {
    console.error('Usage: pushup path/to/repo')
    return
  }

  props.repo = repo
  
  pushup(props)
    .on('entry', function (entry) {
      console.log(entry.name)
    })
    .on('error', function (err) {
      console.error(err)
    })
    .on('end', function () {
      console.log('OK')
    })  
})()
