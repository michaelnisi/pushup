module.exports = validateProps

var requiredProps = [ 
    'key'
  , 'secret'
  , 'bucket'
]

function validateProps (props) {
  var actual = props ? Object.keys(props) : []
    , error = null
  
  if (!actual.length) {
    error = new Error('props required')
    return error
  }

  requiredProps.forEach(function (requiredKey) {
    valid = actual.some(function (actualKey) {
      return actualKey === requiredKey && props[requiredKey]
    })

    if (!valid) {
      error = new Error('props.' + requiredKey + ' required')
      return error 
    }
  })

  return error
}
