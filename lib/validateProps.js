module.exports = validateProps

var requiredProps = [ 
    'port'
  , 'accessKeyId'
  , 'secretAccessKey'
  , 'bucket'
  , 'region'
  , 'baseDir'
]

function validateProps (props) {
  if (!props) {
    throw new Error('Props are required.')
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
}
