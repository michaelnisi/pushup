// cpr - copy directory and its entire subtree to S3

module.exports = cpr

var Reader = require('fstream').Reader
  , cop = require('cop')
  , pushup = require('../index.js')
  , relative = require('path').relative

function cpr (props, path) {
  process.chdir(path)
  
  return new Reader({ path:'.' })
    .pipe(cop(filter))
    .pipe(pushup(props))
    .pipe(process.stdout)
}

function filter (obj) {
  var isFile = obj.type === 'File'
  return isFile ? relative(process.cwd(), obj.path) : undefined

}
