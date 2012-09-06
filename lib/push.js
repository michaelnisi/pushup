var show = require('./show.js')
  , pushup = require('../index.js')

module.exports = push

function push (props, repo) {
  show(repo)
    .pipe(pushup(props))
    .pipe(process.stdout)
}
