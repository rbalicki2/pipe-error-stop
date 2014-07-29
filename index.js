var PassThrough = require('stream').PassThrough;

function errorHandler(stream, options) {
  var flushed = false, doneCallback, files = [], error = false;

  if (options === undefined) {
    options = {};
  }

  var delayer = through2.obj(function(file, encoding, done) {
    if (options.log) {
      console.log('Received data from stream.');
    }
    if (!flushed) {
      files.push(file);
    } else {
      this.push(file);
    }
    doneCallback = done;
  });

  function onEnd() {
    if (options.log) {
      if (error) {
        console.log('Stream ended with an error; discontinuing pipe.');
      } else {
        console.log('Stream ended without an error; flushing contents.');
      }
    }
    if (!error) {
      flushed = true;
      for (var i = 0; i < files.length; i++) {
        delayer.push(files[i]);
      }
    }

    doneCallback();
    delayer.emit('close');
    delayer.emit('end');
  }

  function onError() {
    if (options.log) {
      console.log('Stream emitted an error; pipe will be discontinued.');
    }
    error = true;
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

module.exports = errorHandler;