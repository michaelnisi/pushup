
var join = require('path').join
  , pushover = require('pushover')
  , source = '/tmp/repos'
  , target = '/tmp/deploy'
  , repos = pushover(dir)
  , reader = require('./reader.js')
  , fstream = require('fstream')
  , writer = fstream.Writer(target)

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

repos.listen(7000)
