# pushup - upload to S3

[![Build Status](https://secure.travis-ci.org/michaelnisi/pushup.png)](http://travis-ci.org/michaelnisi/pushup)

## Description

The pushup node module uploads files to a [S3](http://aws.amazon.com/s3/) bucket. Its main purpose is to upload the content of the latest commit (in a git repository), however, it can also be used to upload files and directories.

## CLI Usage

    pushup git-repo
    pushup file ...
    pushup directory

In the first synopsis form, pushup uploads the content of git-repo's latest commit. In the second synopsis form, a list of files is copied to S3; while in the third form, a directory and its entire subtree is copied. 

Pushup's CLI retrieves the AWS security credentials from its environment; thus, you have to export them:

    export AWS_ACCESS_KEY_ID=123
    export AWS_SECRET_ACCESS_KEY=42
    export S3_BUCKET=kahuna

## Library Usage

The `pushup` function returns a Through-Stream, to which you can write filenames, and from which you can read target URLs. A target URL is emitted for each successful upload to S3.

### Push latest commit to S3

    var show = require('../lib/show.js')
      , pushup = require('../index.js')
      , path = 'path/to/repo'

    var props = {
      , key: 256
      , secret: 42
      , bucket: 'kahuna'
    }
    
    show(path)
      .pipe(pushup(props))
      .pipe(process.stdout)

### Copy files to S3

    var es = require('event-stream')
      , pushup = require('../index.js')
      , files = ['path/to/file-1', 'path/to/file-2']

    var props = {
      , key: 256
      , secret: 42
      , bucket: 'kahuna'
    }

    es.readArray(files)
      .pipe(pushup(props))
      .pipe(process.stdout)

### Copy directory and its entire subtree to S3

    var props = {
      , key: 256
      , secret: 42
      , bucket: 'kahuna'
    }

    var Reader = require('fstream').Reader
      , cop = require('cop')
      , pushup = require('../index.js')
      , relative = require('path').relative
      , path = 'path/to/directory'
      , opts = { path: path }
      , reader = new Reader(opts)

    process.chdir(path)

    reader
      .pipe(cop(relativize))
      .pipe(pushup(props))
      .pipe(process.stdout)

    function relativize (obj) {
      return relative(process.cwd(), obj.path)
    }

## Events

The `pushup` function returns a readable `Stream` that emits following events:

### Event:'error'

    function (err) {}

Emitted if an error occured.

### Event:'entry'

    function (entry) {}

Emitted when uploading of a file begins. The file is streamed to S3. The `entry` objects emit 'progress' events with following properties: `written`, `total`, and `percent`.

### Event:'end'

    function () {}

Emitted when the upload is complete.

### Event:'data'

    function (response) {}

The 'data' event emits the url response from S3 when uploading of a file completes.

## Installation

Install with [npm](http://npmjs.org/):

    npm install pushup

To `pushup` from the command-line:

    npm install -g pushup

## License

[MIT License](https://raw.github.com/michaelnisi/pushup/master/LICENSE)
