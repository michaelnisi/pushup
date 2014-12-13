
# pushup - copy files to S3

[![Build Status](https://secure.travis-ci.org/michaelnisi/pushup.svg)](http://travis-ci.org/michaelnisi/pushup)

The **pushup** [Node](http://nodejs.org/) module copies local files to an [Amazon S3](http://aws.amazon.com/s3/) bucket. It is designed to deploy static websites hosted on S3 providing some configuration to harness [Amazon CloudFront](https://aws.amazon.com/cloudfront/) content delivery web service.

## Usage

**Pushup** is a [Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform) stream to which you write filenames of files you want to copy to S3. If you export your S3 credentials to your process environment, you can neglect the options object.

```js
var pushup = require('pushup')

var push = pushup()
push.write('/some/file')
push.write('/some/other/file')
push.end()
```

Options let you control compression, caching, and the root of the path in the bucket.

```js
function ttl() {
  return { 'file': 3600 * 24 * 30 }
}

function opts () {
  return {
    gzip: true
  , ttl: ttl()
  , root: '/some'
  }
}

var pushup = require('pushup')

var push = pushup(opts())
push.write('/some/file')
push.write('/some/other/file')
push.end()
```

## types

### ttl()

An optional bag of settings to configure `Cache-Control` [headers](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html) by file extension or filename in (max-age) delta-seconds. For example:
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

This would copy the files to `/file` and `/other/file` in you S3 bucket. If `root` is `undefined` or your defined `root` is not part of the given file path, the entire path will be replicated.

### opts()
- `gzip` `Boolean()` If set to `true` **pushup** compresses text files before they get uploaded using gzip and sets proper `content/encoding` headers.
- `ttl` `ttl()`
- `root` `root()`
- `tmp` `String()` A directory to store temporary files used if `gzip` is `true`. The directory is deleted when the stream ends. It defaults to `'/tmp/pushup'`.
- `key` `String()` defaults to `process.env.AWS_ACCESS_KEY_ID`
- `secret` `String()` defaults to `process.env.AWS_SECRET_ACCESS_KEY`
- `bucket` `String()` defaults to `process.env.S3_BUCKET`
- `region` `String()` defaults to `process.env.S3_REGION`

## exports

### pushup([opts()])

A Transform stream that consumes filenames and emits paths of files copied to S3 using [knox](https://github.com/LearnBoost/knox).

## Installation

With [npm](https://www.npmjs.com/package/pushup) do:

```
$ npm install pushup
```

## License

[MIT License](https://raw.github.com/michaelnisi/pushup/master/LICENSE)
