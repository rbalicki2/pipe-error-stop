# Pipe-Error-Stop

> Buffers a pipe until it ends. If the pipe emits an error, will not flush data onward. Otherwise, flushes all data at once.

*Issues should be reported on the [issue tracker](https://github.com/rbalicki2/pipe-error-stop/issues).*

## Installation

```sh
npm install --save-dev pipe-error-stop
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

### pipeErrorStop(options)

#### options

##### log

Type: `boolean`
Default: `false`

Whether to log notes such as `'Stream ended with an error; discontinuing pipe.'`

##### errorCallback

Type: `function(errArray)`

If supplied, `errorCallback` is called with first parameter `errArray`, containing an array of all errors returned.

##### successCallback

Type: `function()`

If supplied, `successCallback` is called when data is flushed through the pipe.

## License

Do whatever you want.