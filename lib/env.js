
// opts - read options from environment

module.exports = function () {
  var env = process.env
  var opts = {
    key: env.AWS_ACCESS_KEY_ID
  , secret: env.AWS_SECRET_ACCESS_KEY
  , bucket: env.S3_BUCKET
  , region: env.S3_REGION
  }
  return opts
}
