var pushup = require('../index.js')
  , statSync = require('fs').statSync
  , show = require('../lib/show.js')

module.exports = push

function push (props, repo) {
  show(repo)
    .pipe(pushup(props))
    .pipe(process.stdout)
}
