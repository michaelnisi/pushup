var http = require('http')
  , pushup = require('../index.js')
  , getProps = require('../lib/getProps.js')
  , lastCommit

http.createServer(function (req, res) {
  var p = pushup(getProps(), function (err, commit) {
    var code = isNotModified(commit) ? 304 : 204
    if (err) code = 500

    lastCommit = commit

    res.writeHead(code)
    res.end()
  })

  p.on('commit', function (commit) {
    if (isNotModified(commit)) {
      p.end()
    }
  })
}).listen(7000)

function isNotModified (commit) {
  return commit === lastCommit
}
