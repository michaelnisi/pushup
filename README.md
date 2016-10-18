# pushup - copy files to S3

The **pushup** [Node.js](http://nodejs.org/) package copies local files to a [S3](http://aws.amazon.com/s3/) bucket. Its API is a sole [Transform stream](https://nodejs.org/api/stream.html#stream_class_stream_transform), which lets you write filenames of local files to copy, and read keys of objects, successfully copied to the bucket. This streaming API is handy, of course, if you have a readable stream of freshly generated artifacts or a diff of some kind as input, enabling you to pipe directly to your S3 bucket. The intial purpose of **pushup** is to deploy file trees to S3, including optional [gzip](http://www.gzip.org/) compression and `Cache-Control` headers, configurable for file types or specific filenames.

[![Build Status](https://secure.travis-ci.org/michaelnisi/pushup.svg)](http://travis-ci.org/michaelnisi/pushup)

## Usage

**pushup** is a [Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform) stream to which you write filenames of files you want to copy to S3. If you export your S3 credentials to your process environment, you can neglect the options object.

```js
const pushup = require('pushup')

let p = pushup('my.aws.bucket')
p.write('/some/file')
p.end('/some/other/file')
```

Options let you control compression, caching, and the root of the path in the bucket.

```js
function gzip () {
  return { '.xml': false }
}

function ttl () {
  return { 'file': 3600 * 24 }
}

function opts () {
  return {
    gzip: gzip(),
    ttl: ttl(),
    root: '/some'
  }
}

var pushup = require('pushup')

var push = pushup(opts())
push.write('/some/file')
push.write('/some/other/file')
push.end()
```

## Types

### gzip()

An optional bag of settings to toggle gzip compression by filename or extension as `Boolean()` (defaults to `true`). **pushup** compresses text files using gzip and sets proper `content/encoding` headers. The following would compress all but XML files:

```js
{ '.xml': false }
```

### ttl()

Optional settings to configure `Cache-Control` [headers](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html) by filename or extension in (max-age) delta-seconds. For example:

```js
{ '.html': 3600 * 24 * 30, '.css': 3600 * 24 * 30, 'hot.html': 3600 }
```

### root()

With the `root` option you can control the root of the replicated file tree in your bucket. For example:

```js
var pushup = require('pushup')

var push = pushup({root:'/some')
push.write('/some/file')
push.write('/some/other/file')
push.end()
```

This would copy the files to `'/file'` and `'/other/file'` in your S3 bucket, using `'some'` as root. If `root` is `undefined` or not a node of the given file path, the entire tree’d be replicated.

### opts()

Some optional parameters you might want to use.

- `endpoint` `String()` Alternative endpoint URL.
- `gzip` [gzip()](#gzip) | `undefined` | `null`
- `root` [root()](#root) | `undefined` | `null`
- `tmp` `String()` Directory to store temporary files. Defaults to `'os.tmpdir()/pushup'`.
- `ttl` [ttl()](#ttl)
- `encoding` `String()` Passed to `stream.Readable()`. Defaults to `'utf8'`.
- `highWaterMark` `Number()` Passed directly to `stream.Readable()`.

## Exports

### pushup(region, bucket, key, secret, opts)

- `region` `String()` The region to send service requests to.
- `bucket` `String()` The name of the bucket.
- `key` `String()` Your AWS access key ID.
- `secret` `String()` Your AWS secret access key.
- `opts` [opts()](#opts) | `undefined` | `null`

A Transform stream that consumes filenames and emits paths of files copied to a S3.

## Installation

With [npm](https://www.npmjs.com/package/pushup), do:

```
$ npm install pushup
```

## License

[MIT License](https://raw.github.com/michaelnisi/pushup/master/LICENSE)
