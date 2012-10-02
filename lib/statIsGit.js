var statSync = require('fs').statSync
  , join = require('path').join

module.exports = statIsGit

function statIsGit (path) {
  try {
    return statSync(join(path, '.git')).isDirectory()
  } catch (err) {
    return false
  }
}
