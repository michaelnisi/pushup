# pushup - push last commit to S3

[![Build Status](https://secure.travis-ci.org/michaelnisi/pushup.png)](http://travis-ci.org/michaelnisi/pushup)

## Description

Pushup uploads the latest commit of a git repository to S3.

## CLI Usage

Create a repository, and add a file:

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
