var show = require('../lib/show.js')
  , pushup = require('../index.js')
  , getProps = require('../lib/getProps.js')
  , props = getProps()
  , latestCommit = show(props.repo)
  , s3 = pushup(props)
  , es = require('event-stream')
  , files = ['index.html', 'likes.html']

show(props.repo).pipe(s3).pipe(process.stdout)

