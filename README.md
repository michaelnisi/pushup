# pushup - upload to S3

[![Build Status](https://secure.travis-ci.org/michaelnisi/pushup.png)](http://travis-ci.org/michaelnisi/pushup)

## Description

Pushup uploads files to a [S3](http://aws.amazon.com/s3/) bucket.

## CLI Usage

    pushup file

    pushup file-1 ... file-n
    
    pushup directory

    pushup git-repo

To use pushup you need to export your AWS security credentials:

    export AWS_ACCESS_KEY_ID=123
    export AWS_SECRET_ACCESS_KEY=42
    export S3_BUCKET=kahuna

## Library Usage

    var pushup = require('pushup')
    
    var props = { 
      , key: 123
      , secret: 42
      , bucket: 'kahuna'
    }

    var files = ['index.html', 'css/style.css', 'js/main.js']
    
    pushup(props, files, function (err) {
      console.log('OK')
    })

`pushup` returns a readable `Stream` that emits following events:

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
