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

// TODO: Rename to something more expressive
function Opts (data) {
  if (!(this instanceof Opts)) return new Opts(data)
  util._extend(this, data)
}

Opts.prototype.value = function (fd) {
  return this[path.basename(fd)] || this[path.extname(fd)]
}

function defaults (opts) {
  const o = Object.create(null)
  o.gzip = opts.gzip || Object.create(null)
  o.region = opts.region || undefined
  o.root = opts.root || undefined
  o.tmp = opts.tmp || os.tmpdir()
  o.ttl = opts.ttl || Object.create(null)
  return o
}

function Pushup (bucket, opts) {
  if (!(this instanceof Pushup)) return new Pushup(bucket, opts)
  assert(typeof bucket === 'string', 'bucket not set')
  opts = defaults(opts)
  stream.Transform.call(this, opts)

  this.bucket = bucket
  this.root = opts.root
  this.tmp = opts.tmp

  this.ttl = new Opts(opts.ttl)
  this.gzip = new Opts(opts.gzip)

  this.decoder = new StringDecoder()

  AWS.config.region = opts.region
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

Pushup.prototype.client = function () {
  if (!this._client) this._client = new AWS.S3()
  return this._client
}

function local (root, file) {
  return path.join(root || '', file)
}

Pushup.prototype._transform = function (chunk, enc, cb) {
  const bucket = this.bucket
  const client = this.client()

  const unzipped = local(this.root, this.decoder.write(chunk))
  const key = remote(this.root, unzipped)

  const me = this

  function upload (file, headers) {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: fs.createReadStream(file)
    }
    client.putObject(params, (er, data) => {
      if (er instanceof Error) return cb(er)
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
  module.exports.Opts = Opts
  module.exports.defaults = defaults
  module.exports.enc = enc
  module.exports.gz = gz
  module.exports.headers = headers
  module.exports.remote = remote
  module.exports.type = type
  module.exports.zippable = zippable
}
