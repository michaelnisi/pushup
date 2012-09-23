var pushup = require('pushup')

var props = { 
  , key: 123
  , secret: 42
  , bucket: 'kahuna'
}

var files = ['index.html', 'css/style.css', 'js/main.js']

pushup(props, files, function (err) {
  err ? console.error(err) : console.log('OK')
})
