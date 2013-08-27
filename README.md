# pushup - upload to S3

## Description

The pushup [Node.js](http://nodejs.org/) module uploads files to a [S3](http://aws.amazon.com/s3/) bucket. Its main purpose is to upload the content of the latest commit (in a git repository); however, you can also use it to simply copy files or directories to S3.

## CLI Usage

    pushup git-repo
    pushup file ...
    pushup directory

In the first synopsis form, pushup uploads the content of the git-repo's latest commit. In the second synopsis form, a list of files is copied to S3; while in the third form, a directory and its entire subtree is copied. If you `pushup` without arguments, the current directory will be used. 

As `pushup` attempts to get the AWS security credentials from its environment, you may export them:

    export AWS_ACCESS_KEY_ID=256
    export AWS_SECRET_ACCESS_KEY=42
    export S3_BUCKET=kahuna
    export S3_REGION=us-standard

## Library Usage

The `pushup` function returns a Through-Stream, to which you can write filenames, and from which you can read target URLs. A target URL is emitted for each successful upload to S3.

### Push latest commit to S3

    var show = require('pushup/lib/show')
      , pushup = require('pushup')
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
      , pushup = require('pushup')
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
      , pushup = require('pushup')
      , relative = require('path').relative
      , path = 'path/to/directory'
      , reader = new Reader({ path:'.'} )
   
    process.chdir(path)
      
    reader
      .pipe(cop(filter))
      .pipe(pushup(props))
      .pipe(process.stdout)

    function filter (obj) {
      var isFile = obj.type === 'File'
      return isFile ? relative(process.cwd(), obj.path) : undefined
    }

### pushup(opts)

The `pushup` function returns a readable and writable [Stream](http://nodejs.org/api/stream.html) that emits following events:

### Event:'entry'

The 'entry' event is emitted when uploading of a file begins. The file is streamed to S3. The `entry` objects emit 'progress' events with following properties: `written`, `total`, and `percent`.

## Installation

With [npm](http://npmjs.org/) do:

    npm install pushup

To `pushup` from the command-line:

    npm install -g pushup

[![NPM](https://nodei.co/npm/pushup.png)](https://npmjs.org/package/pushup)

## License

[MIT License](https://raw.github.com/michaelnisi/pushup/master/LICENSE)
