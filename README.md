# pushup - upload to S3

[![David DM](https://david-dm.org/michaelnisi/pushup.png)](http://david-dm.org/michaelnisi/pushup)

The pushup [Node.js](http://nodejs.org/) module uploads files to a [S3](http://aws.amazon.com/s3/) bucket. Its main purpose is to upload the changed files in the last commit (of a [git](http://git-scm.com/) repository). However, you can also use it to simply copy files or directories to S3. Pushup wraps the [putFile](https://github.com/LearnBoost/knox#put) function of [knox](https://github.com/LearnBoost/knox) into a [Transform stream](http://nodejs.org/api/stream.html#stream_class_stream_transform).

## CLI Usage

    pushup git-repo
    pushup file ...
    pushup directory

In the first synopsis form, pushup uploads the content of the git-repo's latest commit. In the second synopsis form, a list of files is copied to S3; while in the third form, a directory and its entire subtree is copied. If you `pushup` without arguments, the current directory will be used. 

As `pushup` attempts to get the AWS security credentials from its environment, you may export them:

    export AWS_ACCESS_KEY_ID=<api-key-here>
    export AWS_SECRET_ACCESS_KEY=<secret-here>
    export S3_BUCKET=bigkahuna
    export S3_REGION=us-standard

## Library Usage

### Push latest commit to S3

    var showf = require('showf')
      , pushup = require('pushup')
      , repo = 'path/to/repo'

    var opts = {
      , key: '<api-key-here>'
      , secret: '<secret-here>'
      , bucket: 'bigkahuna'
      , region: 'us-standard'
    }

    showf(repo)
      .pipe(pushup(opts))
      .pipe(process.stdout)

### Copy files to S3

    var es = require('event-stream')
      , pushup = require('pushup')
      , files = ['path/to/file-1', 'path/to/file-2']

    es.readArray(files)
      .pipe(pushup(opts)) // opts like above
      .pipe(process.stdout)

### Copy directory and its entire subtree to S3

    var Reader = require('fstream').Reader
      , cop = require('cop')
      , pushup = require('pushup')
      , relative = require('path').relative
      , path = 'path/to/directory'
      , reader = new Reader({ path:'.'} )
    
    process.chdir(path)
      
    reader
      .pipe(cop(filter))
      .pipe(pushup(opts)) // opts like above
      .pipe(process.stdout)

    function filter (obj) {
      var isFile = obj.type === 'File'
      return isFile ? relative(process.cwd(), obj.path) : undefined
    }

## pushup(opts)

The `pushup` module exports a single function that returns a [Transform stream](http://nodejs.org/api/stream.html#stream_class_stream_transform), to which you can write filenames, and from which you can read target URLs. A target URL is emitted for each successful upload to S3.

- `opts` 
    - `key` Access key ID (a 20-character, alphanumeric string).
    - `secret` Secret access key (a 40-character string).
    - `bucket` Amazon S3 bucket name.
    - `region` AWS region.

The options are passed to [knox](https://github.com/LearnBoost/knox). See [here](https://github.com/LearnBoost/knox#client-creation-options) for further information.

## Event:'entry'

This event fires when uploading of a file begins. The file is streamed to S3. The `entry` objects, provided by [knox](https://github.com/LearnBoost/knox), emit 'progress' events with following properties: `written`, `total`, and `percent`.

## Installation

[![NPM](https://nodei.co/npm/pushup.png)](https://npmjs.org/package/pushup)

To `pushup` from the command-line:

    npm install -g pushup

## License

[MIT License](https://raw.github.com/michaelnisi/pushup/master/LICENSE)
