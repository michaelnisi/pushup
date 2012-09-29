module.exports = getProps

function getProps (arg) {
  var props = {
    key: process.env.AWS_ACCESS_KEY_ID
  , secret: process.env.AWS_SECRET_ACCESS_KEY
  , bucket: process.env.S3_BUCKET
  }

  return props
}
