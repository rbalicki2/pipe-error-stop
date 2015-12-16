# Pipe-Error-Stop

> Buffers a pipe until it ends. If the pipe emits an error, will not flush data onward. Otherwise, flushes all data at once.

*Issues should be reported on the [issue tracker](https://github.com/rbalicki2/pipe-error-stop/issues).*

**Note:** The usage changed between 0.0.9 and 0.0.11! The new usage is much more intuitive in my opinion, the code is cleaned up, and the tests are much better.

## Installation

```sh
npm install --save pipe-error-stop
```

## Usage

In this example, if the `gulp-jade` plugin throws an error on any .jade file, then gulp will not write any output, and the gulp process will end successfully. This has the added benefit of keeping `gulp.watch` from breaking.

```js
var pipeErrorStop = require('pipe-error-stop'),
  gulp = require('gulp'),
  jade = require('gulp-jade');

gulp.task('jade', function() {
  return gulp
    .src('src/**/*.jade')
    .pipe(jade())
    .pipe(pipeErrorStop())
    .pipe(gulp.dest('dest'));
});
```

## API

### pipeErrorStop(options)

#### options

##### errorCallback

Type: `function(err)`

If supplied, this callback is executed when an error is encountered. For example, you may want to call `require('gulp-notify').onError` to display a growl error notification.

##### successCallback

Type: `function(err)`

If supplied, this callback is executed when no error is encountered and the previous stream ends. It is called only when data is flushed through the pipe.

## License

MIT.