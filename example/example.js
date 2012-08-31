var pushup = require('../index.js')
  , getProps = require('../lib/getProps.js')

var p = pushup(getProps(), function (err, commit) {
  err ? console.error(err) : console.log(commit)    
})

p.on('entry', function (entry) {
  entry.on('progress', function (prog) {
    console.log('%s %d',  entry.name, prog.percent)
  })
})

p.on('error', function (err) {
  console.error(err)
})

p.on('data', function (res) {
  res.on('end', function () {
    console.log('OK')
  })
})

p.on('commit', function (commit) {
  console.log(commit)
})
