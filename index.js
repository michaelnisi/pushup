module.exports = pushup

var EventEmitter = require('events').EventEmitter
  , join = require('path').join
  , pushover = require('pushover')
  , source = '/tmp/repos'
  , target = '/tmp/deploy'
  , repos = pushover(source)
  , validateProps = require('./lib/validateProps.js')
  , stat = require('./lib/reader.js')
  , fstream = require('fstream')

repos.on('push', function (repo, commit, branch) {
  console.log(
    'received a push to ' + repo + '/' + commit + ' (' + branch + ')'
  )
  
  var dir = join(source, repo)
    , reader = fstream.Reader(dir)
    , writer = fstream.Writer(target)
  
  stat(dir).pipe(reader).pipe(writer)
})

function pushup (props) {
  var me = new EventEmitter()

  validateProps(props)  

  return me
}
