module.exports = pushup

var EventEmitter = require('events').EventEmitter
  , join = require('path').join
  , pushover = require('pushover')
  , source = '/tmp/repos'
  , target = '/tmp/deploy'
  , repos = pushover(source)
  , validateProps = require('./lib/validateProps.js')
  , reader = require('./lib/reader.js')
  , fstream = require('fstream')
  , writer = fstream.Writer(target)

var requiredProps = [ 
    'port'
  , 'accessKeyId'
  , 'secretAccessKey'
  , 'bucket'
  , 'region'
  , 'baseDir'
]

repos.on('push', function (repo, commit, branch) {
  console.log(
    'received a push to ' + repo + '/' + commit + ' (' + branch + ')'
  )
  
  var dir = join(source, repo)

  reader(dir).on('item', function (item) {
    console.log(item)
  })

  reader.pipe(writer)
})

function pushup (props) {
  var me = new EventEmitter()

  validateProps(props)  

  return me
}
