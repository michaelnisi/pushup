
// cpr - copy directory and its entire subtree to S3

var Reader = require('fstream').Reader
  , cop = require('cop')
  , pushup = require('../index.js')
  , relative = require('path').relative

module.exports = function (props, path) {
  process.chdir(path)

  var reader = new Reader({ path: '.', filter: function (entry) {
      return !entry.basename.match(/^\./)
    }
  })

  return reader
    .pipe(cop(relate))
    .pipe(pushup(props))
    .pipe(process.stdout)
}

function relate (obj) {
  var isFile = obj.type === 'File'
  return isFile ? relative(process.cwd(), obj.path) : undefined
}
