var http = require('http')
  , pushup = require('../index.js')
  , getProps = require('../lib/getProps.js')
  , commit

http.createServer(function (req, res) {
  var p = pushup(getProps(), function (err, c) {
    var code = isNotModified(c) ? 304 : 204

    commit = c

    res.writeHead(code)
    res.end()
  })

  p.on('commit', function (c) {
    if (isNotModified(c)) {
      p.end()
    }
  })
}).listen(7000)

function isNotModified (c) {
  return c === commit
}
