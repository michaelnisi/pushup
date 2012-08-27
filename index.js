module.exports = push

var EventEmitter = require('events').EventEmitter
  , join = require('path').join
  , pushover = require('pushover')
  , source = '/tmp/repos'
  , target = '/tmp/deploy'
  , repos = pushover(source)
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

function push (props) {
  var me = new EventEmitter()

  if (!props) {
    throw new Error('Props are required.')
    return
  }
  
  var actual = Object.keys(props)
    , valid = false
  
  if (!actual.length) {
    throw new Error('Required properties: port')
  }

  requiredProps.forEach(function (requiredKey) {
    valid = actual.some(function (actualKey) {
      return actualKey === requiredKey
    })

    if (!valid) {
      throw new Error(requiredKey + ' is required.')
    }
  })

  return me
}
