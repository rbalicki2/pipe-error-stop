var PassThrough = require('stream').PassThrough,
  through2 = require('through2');

function pipeErrorStop(stream, options) {
  console.log('')
  var flushed = false, callbacks = [], files = [], errors = [];

  if (options === undefined) {
    options = {};
  }

  var delayer = through2.obj(function(file, encoding, done) {
    if (options.log) {
      console.log('[pipe-error-stop] Received data from stream.');
    }
    if (!flushed) {
      files.push(file);
    } else {
      this.push(file);
    }
    callbacks.push(done);
  }, function() {
    console.log('flush function in delayer');
    console.log(arguments);
  });

  function onEnd() {
    if (options.log) {
      if (errors.length) {
        console.log('[pipe-error-stop] Stream ended with an error; discontinuing pipe.');
      } else {
        console.log('[pipe-error-stop] Stream ended without an error; flushing contents.');
      }
    }
    if (!errors.length) {
      flushed = true;
      for (var i = 0; i < files.length; i++) {
        delayer.push(files[i]);
      }
    }

    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i]();
    }
    delayer.emit('close');
    delayer.emit('end');

    if (errors.length) {
      if (options.allErrorsCallback) {
        options.allErrorsCallback(errors);
      }
    } else {
      if (options.successCallback) {
        options.successCallback();
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

  var combined = new PassThrough();

  combined.on('pipe', function(source) {
    source.unpipe(this);
    this.transformStream = source.pipe(stream)
      .on('error', onError)
      .on('end', onEnd)
      .pipe(delayer);
  });

  combined.pipe = function(dest, options) {
    return this.transformStream.pipe(dest, options);
  }

  return combined;
}

module.exports = pipeErrorStop;