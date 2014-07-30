var PassThrough = require('stream').PassThrough,
  through = require('through');

function pipeErrorStop(stream, options) {
  var flushed = false, files = [], errors = [];

  if (options === undefined) {
    options = {};
  }

  function bufferContents(file, encoding, done) {
    if (file.isNull()) {
      return;
    }
    files.push(file);
  }

  function endStream() {
    if (!errors.length) {
      for (var i = 0; i < files.length; i++) {
        this.emit('data', files[i]);
      }
    }
    this.emit('end');
    if (!errors.length) {
      if (options.successCallback) {
        options.successCallback();
      }
    } else {
      if (options.allErrorsCallback) {
        options.allErrorsCallback();
      }
    }
  }

  var delayer = through(bufferContents, endStream);

  function onError(err) {
    if (options.log) {
      console.log('[pipe-error-stop] Stream emitted an error; pipe will be discontinued.');
    }
    errors.push(err);
    if (options.eachErrorCallback) {
      options.eachErrorCallback(err);
    }
  }

  var combined = new PassThrough();

  combined.on('pipe', function(source) {
    source.unpipe(this);
    this.transformStream = source.pipe(stream)
      .on('error', onError)
      .pipe(delayer);
  });

  combined.pipe = function(dest, options) {
    return this.transformStream.pipe(dest, options);
  }

  return combined;
}

module.exports = pipeErrorStop;