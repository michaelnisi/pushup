
// pushup - copy files to S3

module.exports = Pushup

function TTL (data) {
  if (!(this instanceof TTL)) return new TTL(data)
  util._extend(this, data)
}

var path = require('path')

TTL.prototype.age = function (fd) {
  return this[path.basename(fd)] || this[path.extname(fd)]
}

function conf (opts, env) {
  return {
    key: opts.key || env.AWS_ACCESS_KEY_ID
  , secret: opts.secret || env.AWS_SECRET_ACCESS_KEY
  , bucket: opts.bucket || env.S3_BUCKET
  , region: opts.region || env.S3_REGION
  }
}

var util = require('util')
  , stream = require('stream')

function defaults (opts) {
  opts = opts || Object.create(null)
  opts.gzip = opts.gzip || false
  opts.ttl = opts.ttl || Object.create(null)
  opts.root = opts.root || undefined
  opts.tmp = opts.tmp || '/tmp/pushup'
  return opts
}

function Pushup (opts) {
  if (!(this instanceof Pushup)) return new Pushup(opts)
  opts = defaults(opts)
  stream.Transform.call(this, opts)
  this.knox = conf(opts, process.env)
  this.ttl = new TTL(opts.ttl)
  this.gzip = opts.gzip
  this.root = opts.root
  this.tmp = opts.tmp
}
util.inherits(Pushup, stream.Transform)

var zExts = ['.html', '.js', '.css', '.xml', '.txt']
function zippable (file) {
  var extname = path.extname(file)
  return zExts.some(function (ext) { return extname === ext })
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
  if (!!size) this['Content-Length'] = size
  if (!!type) this['Content-Type'] = type
  if (!isNaN(ttl)) this['Cache-Control'] = 'max-age=' + ttl
  if (!!enc) this['Content-Encoding'] = enc
}

var mime = require('mime')

function type (fd) {
  var type = mime.lookup(fd)
    , charset = mime.charsets.lookup(type)
  if (charset) {
    type += '; charset=' + charset;
  }
  return type
}

var fs = require('fs')
  , assert = require('assert')

function headers (unzipped, zipped, ttl, cb) {
  fs.stat(zipped || unzipped, function (er, stat) {
    if (er) return cb(er)
    var t = type(unzipped)
    cb(er, new Headers(stat.size, t, ttl, enc(zipped)))
  })
}

var zlib = require('zlib')

function gz (dir, file) {
  return path.join(dir, [path.basename(file), '.gz'].join(''))
}

function pipfin (streams) {
  streams.forEach(function (stream) {
    stream.removeAllListeners()
  })
}

function piperr (streams, cb) {
  function error (er) {
    pipfin(streams)
    cb(er)
  }
  streams.forEach(function (stream) { stream.on('error', error) })
}

var mkdirp = require('mkdirp')

function zip (dir, file, cb) {
  mkdirp(dir, function (er, made) {
    if (er) return cb(er)
    var z = gz(dir, file)
    var read = fs.createReadStream(file)
      , gzip = zlib.createGzip()
      , write = fs.createWriteStream(z)

    var streams = [read, gzip, write]
    piperr(streams, cb)

    read
     .pipe(gzip)
     .pipe(write)
     .on('finish', function () {
        pipfin(streams)
        cb(er, z)
      })
  })
}

function remote (root, file) {
  if (!!root && !!file) return path.normalize(file.split(root)[1])
  return file
}

var knox = require('knox')

Pushup.prototype.client = function () {
  if (!this._client) this._client = knox.createClient(this.knox)
  return this._client
}

var string_decoder = require('string_decoder')

function decode (chunk) {
  return new string_decoder.StringDecoder().write(chunk)
}

function local (root, file) {
  return path.join(root || '', file)
}

Pushup.prototype._transform = function (chunk, enc, cb) {
  var unzipped = local(this.root, decode(chunk))

  var client = this.client()
    , target = remote(this.root, unzipped)
    , me = this

  function upload (file, headers) {
    var read = fs.createReadStream(file)
      , put = client.put(target, headers)

    var streams = [read, put]
    piperr(streams, cb)

    read.pipe(put)
      .on('finish', function () {
        me.push(['pushed: ', target, '\n'].join(''))
        pipfin(streams)
        cb()
      })
  }
  function age (file) {
    return me.ttl.age(file)
  }
  function go (unzipped, zipped) {
    headers(unzipped, zipped, age(unzipped), function (er, headers) {
      if (er) return cb(er)
      upload(zipped || unzipped, headers)
    })
  }
  if (this.gzip && zippable(unzipped)) {
    zip(this.tmp, unzipped, function (er, zipped) {
      if (er) return cb(er)
      go(unzipped, zipped)
    })
  } else {
    go(unzipped)
  }
}

var rimraf = require('rimraf')

Pushup.prototype._flush = function (cb) {
  rimraf(this.tmp, function (er) {
    cb(er)
  })
}

if (process.env.NODE_TEST) {
  ;[Headers
  , TTL
  , conf
  , defaults
  , enc
  , gz
  , headers
  , remote
  , type
  , zippable].forEach(function (f) { module.exports[f.name] = f })
}
