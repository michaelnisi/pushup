module.exports = validateProps

var requiredProps = [ 
    'key'
  , 'secret'
  , 'bucket'
  , 'repo'
]

function validateProps (props) {
  var actual = props ? Object.keys(props) : []
    , valid = false
  
  if (!actual.length) {
    throw new Error('props required')
  }

  requiredProps.forEach(function (requiredKey) {
    valid = actual.some(function (actualKey) {
      return actualKey === requiredKey
    })

    if (!valid) {
      throw new Error('props.' + requiredKey + ' required')
    }
  })

  return valid
}
