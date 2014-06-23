
// pushup - copy files to S3

module.exports = Pushup

var assert = require('assert')
  , fs = require('fs')
  , knox = require('knox')
  , mime = require('mime')
  , mkdirp = require('mkdirp')
  , path = require('path')
  , rimraf = require('rimraf')
  , stream = require('stream')
  , string_decoder = require('string_decoder')
  , util = require('util')
  , zlib = require('zlib')
  ;

function TTL (data) {
  if (!(this instanceof TTL)) return new TTL(data)
  util._extend(this, data)
}

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

function type (fd) {
  var type = mime.lookup(fd)
    , charset = mime.charsets.lookup(type)
    ;
  if (charset) {
    type += '; charset=' + charset;
  }
  return type
}

function headers (unzipped, zipped, ttl, cb) {
  fs.stat(zipped || unzipped, function (er, stat) {
    if (er) return cb(er)
    cb(er, new Headers(stat.size, type(unzipped), ttl, enc(zipped)))
  })
}

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
    cb(er)
  }
  streams.forEach(function (stream) { stream.on('error', error) })
}

function zip (dir, file, cb) {
  mkdirp(dir, function (er, made) {
    if (er) return cb(er)
    var z = gz(dir, file)
      , read = fs.createReadStream(file)
      , gzip = zlib.createGzip()
      , write = fs.createWriteStream(z)
      , streams = [read, gzip, write]
      ;
    piperr(streams, cb)
    read
     .pipe(gzip)
     .pipe(write)
     .on('finish', function () {
        cb(er, z)
        pipfin(streams)
      })
  })
}

function remote (root, file) {
  if (!!root && !!file) return path.normalize(file.split(root)[1])
  return file
}

Pushup.prototype.client = function () {
  if (!this._client) this._client = knox.createClient(this.knox)
  return this._client
}

function local (root, file) {
  return path.join(root || '', file)
}

Pushup.prototype.decode = function (chunk) {
  this.decoder = (this.decoder || new string_decoder.StringDecoder())
  return this.decoder.write(chunk)
}

Pushup.prototype._transform = function (chunk, enc, cb) {
  var unzipped = local(this.root, this.decode(chunk))
    , client = this.client()
    , target = remote(this.root, unzipped)
    , me = this
    ;
  function upload (file, headers) {
    var read = fs.createReadStream(file)
      , put = client.put(target, headers)
      , streams = [read, put]
      ;
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
