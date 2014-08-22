


var PassThrough = require('stream').PassThrough,
  through = require('through');

function pipeErrorStop(stream, options) {
  var files = [], errors = [];

  options === undefined ? options = {} : null;

  var delayer = through(bufferContents, endStream);

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

  function bufferContents(file, encoding, done) {
    if (file.isNull()) {
      return;
    }
    files.push(file);
  }

  function endStream() {
    if (!errors.length) {
      if (options.log) {
        console.log('[pipe-error-stop] Stream finished without errors. Flushing.')
      }
      for (var i = 0; i < files.length; i++) {
        this.emit('data', files[i]);
      }
    } else {
      if (options.log) {
        console.log('[pipe-error-stop] Stream finished, but emitted errors. Discontinuing.')
      }
    }
    this.emit('end');
    combined.emit('end');
    combined.transformStream.emit('end');
    if (!errors.length) {
      if (options.successCallback) {
        options.successCallback();
      }
    } else {
      if (options.allErrorsCallback) {
        options.allErrorsCallback(errors);
      }
    }
  }

  function onError(err) {
    if (options.log) {
      console.log('[pipe-error-stop] Stream emitted an error; pipe will be discontinued.');
    }
    errors.push(err);
    if (options.eachErrorCallback) {
      options.eachErrorCallback(err);
    }
  }
}

module.exports = pipeErrorStop;