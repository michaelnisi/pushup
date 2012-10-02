// push - push latest commit to S3

var show = require('../lib/show.js')
  , pushup = require('../index.js')

module.exports = push

function push (props, path) {
  show(path)
    .pipe(pushup(props))
    .pipe(process.stdout)
}
