'use strict';

module.exports = pipeErrorStop;

//////////////////

var through2 = require('through2'),
    _ = require('lodash');

function pipeErrorStop (config) {
  var files = [],
      pipe,
      stream,
      errorInPipe;

  config = _.extend(getDefaultConfig(), config);

  stream = through2.obj(encounteredFile, allFilesDone);

  stream.once('pipe', function addErrorHandlerToSource (source) {
    source.on('error', encounteredError);
  });

  return stream;

  //////////////

  function encounteredFile (file, enc, done) {
    files.push(file);
    done();
  }

  function allFilesDone (done) {
    // jshint validthis: true
    if (!errorInPipe) {
      files.forEach(this.push.bind(this));
      config.successCallback();
    }

    done();
  }

  function encounteredError (err) {
    errorInPipe = true;
    stream.end();
    config.errorCallback(err);
  }
}

function getDefaultConfig () {
  return {
    errorCallback: function () {},
    successCallback: function () {}
  };
}