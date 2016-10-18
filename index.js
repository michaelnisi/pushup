'use strict'

// pushup - copy files to S3

module.exports = Pushup

const AWS = require('aws-sdk')
const StringDecoder = require('string_decoder').StringDecoder
const assert = require('assert')
const fs = require('fs')
const mime = require('mime')
const mkdirp = require('mkdirp')
const os = require('os')
const path = require('path')
const rimraf = require('rimraf')
const stream = require('readable-stream')
const util = require('util')
const zlib = require('zlib')

function MetaData (data) {
  if (!(this instanceof MetaData)) return new MetaData(data)
  util._extend(this, data)
}

MetaData.prototype.value = function (fd) {
  return this[path.basename(fd)] || this[path.extname(fd)]
}

function Opts (endpoint, gzip, root, tmp, ttl, encoding, highWaterMark) {
  this.endpoint = endpoint
  this.gzip = gzip || Object.create(null)
  this.root = root
  this.tmp = tmp || os.tmpdir()
  this.ttl = ttl || Object.create(null)

  this.encoding = encoding || 'utf8'
  this.highWaterMark = highWaterMark
}

Opts.defaults = function (opts) {
  opts = opts || Object.create(null)
  return new Opts(
    opts.endpoint,
    opts.gzip,
    opts.root,
    opts.tmp,
    opts.ttl,
    opts.encoding,
    opts.highWaterMark
  )
}

function Pushup (region, bucket, key, secret, opts) {
  if (!(this instanceof Pushup)) {
    return new Pushup(region, bucket, key, secret, opts)
  }

  ;[region, bucket, key, secret].forEach((p) => {
    assert(typeof p === 'string', 'should be string')
  })

  opts = Opts.defaults(opts)

  stream.Transform.call(this, {
    encoding: opts.encoding,
    highWaterMark: opts.highWaterMark
  })

  this.decoder = new StringDecoder(opts.encoding)

  this.bucket = bucket
  this.root = opts.root
  this.tmp = opts.tmp
  this.ttl = new MetaData(opts.ttl)
  this.gzip = new MetaData(opts.gzip)

  const conf = new AWS.Config({
    accessKeyId: key,
    secretAccessKey: secret,
    region: opts.region
  })
  this.client = new AWS.S3(conf)
}
util.inherits(Pushup, stream.Transform)

var zExts = ['.html', '.js', '.css', '.xml', '.txt']
function zippable (file) {
  const extname = path.extname(file)
  return zExts.some((ext) => { return extname === ext })
}

function enc (fd) {
  if (path.extname(fd) === '.gz') return 'gzip'
}

// - size the size of the entity-body in decimal number of octets
// - type the media type of the entity-body
// - ttl the maximum age in seconds
// - enc the modifier to the media-type
function Headers (size, type, ttl, enc) {
  if (!(this instanceof Headers)) return new Headers(size, type, ttl, enc)
  if (size) this['Content-Length'] = size
  if (type) this['Content-Type'] = type
  if (!isNaN(ttl)) this['Cache-Control'] = 'max-age=' + ttl
  if (enc) this['Content-Encoding'] = enc
}

function type (fd) {
  let type = mime.lookup(fd)
  const charset = mime.charsets.lookup(type)
  if (typeof charset === 'string') {
    type += '; charset=' + charset
  }
  return type
}

function headers (unzipped, zipped, ttl, cb) {
  const p = zipped || unzipped
  fs.stat(p, (er, stat) => {
    if (er) return cb(er)
    cb(er, new Headers(stat.size, type(unzipped), ttl, enc(p)))
  })
}

function gz (dir, file) {
  return path.join(dir, [path.basename(file), '.gz'].join(''))
}

function pipfin (streams) {
  streams.forEach((stream) => { stream.removeAllListeners() })
}

function piperr (streams, cb) {
  function error (er) { cb(er) }
  streams.forEach((stream) => { stream.on('error', error) })
}

function zip (dir, file, cb) {
  mkdirp(dir, function (er, made) {
    if (er) return cb(er)
    const z = gz(dir, file)
    const read = fs.createReadStream(file)
    const gzip = zlib.createGzip()
    const write = fs.createWriteStream(z)
    const streams = [read, gzip, write]
    piperr(streams, cb)
    read.pipe(gzip).pipe(write).on('finish', () => {
      cb(er, z)
      pipfin(streams)
    })
  })
}

function remote (root, file) {
  return !!root && !!file ? path.normalize(file.split(root)[1]) : file
}

function local (root, file) {
  return path.join(root || '', file)
}

// A subset of AWS putObject parameters, which in fact uses uppercase property
// names.
function PutParams (
  bucket,
  key,
  body,
  cacheControl,
  contentEncoding,
  contentType,
  expires
) {
  this.Bucket = bucket
  this.Key = key
  this.Body = body
  // These are optional:
  this.CacheControl = cacheControl
  this.ContentEncoding = contentEncoding
  this.ContentType = contentType
  this.Expires = expires
}

Pushup.prototype._transform = function (chunk, enc, cb) {
  const bucket = this.bucket
  const client = this.client

  const unzipped = local(this.root, this.decoder.write(chunk))
  const key = remote(this.root, unzipped)

  const me = this

  function upload (file, headers) {
    const body = fs.createReadStream(file)

    // TODO: Pass all parameters
    const params = new PutParams(bucket, key, body)

    client.putObject(params, (er, data) => {
      if (er) return cb(er)
      me.push(key)
      cb()
    })
  }
  function age (file) {
    return me.ttl.value(file)
  }
  function go (unzipped, zipped) {
    headers(unzipped, zipped, age(unzipped), (er, headers) => {
      if (er) return cb(er)
      upload(zipped || unzipped, headers)
    })
  }
  function gzip (file) {
    return me.gzip.value(file) !== false
  }
  if (gzip(unzipped) && zippable(unzipped)) {
    zip(this.tmp, unzipped, (er, zipped) => {
      if (er) return cb(er)
      go(unzipped, zipped)
    })
  } else {
    go(unzipped)
  }
}

Pushup.prototype._flush = function (cb) {
  this._client = null
  this.decoder.end()
  this.decoder = null
  this.ttl = null
  this.gzip = null
  rimraf(this.tmp, (er) => { cb(er) })
}

if (process.env.NODE_TEST) {
  module.exports.Headers = Headers
  module.exports.MetaData = MetaData
  module.exports.Opts = Opts
  module.exports.enc = enc
  module.exports.gz = gz
  module.exports.headers = headers
  module.exports.remote = remote
  module.exports.type = type
  module.exports.zippable = zippable
}
