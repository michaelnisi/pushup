
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

function Opts (data) {
  if (!(this instanceof Opts)) return new Opts(data)
  util._extend(this, data)
}

Opts.prototype.value = function (fd) {
  return this[path.basename(fd)] || this[path.extname(fd)]
}

function conf (opts, env) {
  return {
    key: opts.key || env.AWS_ACCESS_KEY_ID
  , secret: opts.secret || env.AWS_SECRET_ACCESS_KEY
  , bucket: opts.bucket || env.S3_BUCKET
  , region: opts.region || env.S3_REGION
  , endpoint: opts.endpoint || (env ? env.S3_ENDPOINT : undefined)
  }
}

function defaults (opts) {
  opts = opts || Object.create(null)
  opts.gzip = opts.gzip || Object.create(null)
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
  this.ttl = new Opts(opts.ttl)
  this.gzip = new Opts(opts.gzip)
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
    var read = fs.createReadStream(file)
    var gzip = zlib.createGzip()
    var write = fs.createWriteStream(z)
    var streams = [read, gzip, write]
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
  return !!root && !!file ? path.normalize(file.split(root)[1]) : file
}

Pushup.prototype.client = function () {
  return this._client || (this._client = knox.createClient(this.knox))
}

function local (root, file) {
  return path.join(root || '', file)
}

Pushup.prototype._transform = function (chunk, enc, cb) {
  var dec = new string_decoder.StringDecoder()
    , unzipped = local(this.root, dec.write(chunk))
    , client = this.client()
    , target = remote(this.root, unzipped)
    , me = this
    ;
  function upload (file, headers) {
    var read = fs.createReadStream(file)
    // TODO: How does knox handle errors in read?
    client.putStream(read, target, headers, function (er, res) {
      if (!!er) {
        cb(er)
      } else if (res.statusCode !== 200) {
        var chunks = []
        res.on('readable', function () {
          var chunk
          while (null !== (chunk = res.read())) {
            chunks.push(chunk)
          }
        })
        res.on('end', function () {
          var dec = new string_decoder.StringDecoder()
            , body = new Buffer(chunks.join())
            , er = new Error('AWS replied ' + res.statusCode)
            ;
          er.description = dec.write(body)
          cb(er)
        })
        res.resume()
      } else {
        me.push('pushed: ' + target + '\n')
        cb()
      }
    })
  }
  function age (file) {
    return me.ttl.value(file)
  }
  function go (unzipped, zipped) {
    headers(unzipped, zipped, age(unzipped), function (er, headers) {
      if (er) return cb(er)
      upload(zipped || unzipped, headers)
    })
  }
  function gzip (file) {
    return me.gzip.value(file) !== false
  }
  if (gzip(unzipped) && zippable(unzipped)) {
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
  , Opts
  , conf
  , defaults
  , enc
  , gz
  , headers
  , remote
  , type
  , zippable].forEach(function (f) { module.exports[f.name] = f })
}
