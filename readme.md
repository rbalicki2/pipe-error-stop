# Pipe-Error-Stop

> Buffers a pipe until it ends. If the pipe emits an error, will not flush data onward. Otherwise, flushes all data at once.

*Issues should be reported on the [issue tracker](https://github.com/rbalicki2/pipe-error-stop/issues).*

## Installation

```sh
npm install --save pipe-error-stop
```

## Usage

In this example, if the typescript compiler throws an error on any .ts file, then gulp will not write any output (i.e. leave javascript files as they are.)

```js
var pipeErrorStop = require('pipe-error-stop'),
  gulp = require('gulp'),
  tsc = require('gulp-tsc');

gulp.task('ts', function() {
  return gulp
    .src('typescript-src/**/*.ts')
    .pipe(pipeErrorStop(tsc({
      module: 'commonjs',
      sourcemap: false,
      target: 'ES3'
    })))
    .pipe(gulp.dest('javascript'));
});
```

## API

### pipeErrorStop(stream, options)

#### stream

Type: `stream`  
Required: `true`

The stream to buffer and whose information to flush when it emits an `'end'` event.

#### options

##### log

Type: `boolean`  
Default: `false`

Whether to `console.log` notes such as `'Stream ended with an error; discontinuing pipe.'`

##### allErrorsCallback

Type: `function(errArray)`

If supplied, `allErrorCallback` is called when the data would have been flushed (i.e. when `stream` emits an `'end'` event.) `errArray` contains an array of all errors returned.

##### eachErrorCallback

Type: `function(err)`

If supplied, whenever the stream emits an error, this function is called with the error as the first parameter. Note that some streams may emit only the first error, or not emit errors at all. `tsc` in the above example emits at most one error. YMMV.

##### successCallback

Type: `function()`

If supplied, `successCallback` is called when data is flushed through the pipe (i.e. when `stream` emits and `'end'` event.) This will not be called if an error has been emitted. This will be called if no data was received.

## License

MIT.