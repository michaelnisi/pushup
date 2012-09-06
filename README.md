# pushup - upload to S3

[![Build Status](https://secure.travis-ci.org/michaelnisi/pushup.png)](http://travis-ci.org/michaelnisi/pushup)

## Description

Pushup uploads files to a [S3](http://aws.amazon.com/s3/) bucket.

## CLI Usage

    pushup file

    pushup file-1 ... file-n
    
    pushup directory

    pushup git-repo

    pushup file directory repo file-1 ... file-n

Create repo, and add a file:

    mkdir site
    cd site
    git init
    echo Hello > index.html
    git add .
    git commit -m 'Add index.html'
    cd
    
Export your AWS security credentials:

    export AWS_ACCESS_KEY_ID=123
    export AWS_SECRET_ACCESS_KEY=42
    export S3_BUCKET=kahuna
    
Upload latest commit to S3:

    pushup site

## Library Usage

    var pushup = require('pushup')
    
    var props = { 
      , key: 123
      , secret: 42
      , bucket: 'kahuna'
      , repo: 'path/to/repo'
    }
    
    pushup(props, function (err, commit) {
      console.log('%s uploaded', commit)
    })

`pushup` returns a readable `Stream` that emits following events:

### Event:'error'

    function (err) {}

Emitted if there was an error.

### Event:'entry'

    function (entry) {}

Emitted when uploading of a file begins. The file is streamed to S3. The `entry` objects emit 'progress' events with following properties: `written`, `total`, and `percent`.

### Event:'commit'

    function (commit) {}

Emitted when the abbreviated commit object name is written to the Stream.   

### Event:'end'

    function () {}

Emitted when the upload is complete.

### Event:'data'

    function (response) {}

The 'data' event emits the response from S3 when uploading of a file completes.

## Installation

Install with [npm](http://npmjs.org/):

    npm install pushup

To `pushup` from the command-line:
    
    npm install -g pushup

## License

[MIT License](https://raw.github.com/michaelnisi/pushup/master/LICENSE)
