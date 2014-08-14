var test = require('tape'),
  pipeErrorStop = require('../'),
  through2 = require('through2'),
  spy = require('through2-spy'),
  gulp = require('gulp'),
  gutil = require('gulp-util');

tests = [];

tests.push(function() {
  test('should pass all data (only after end) when no error is emitted', function(t) {
    t.plan(2);

    var testStringsInput = [
      'You say yes',
      'I say no',
      'You say why',
      'I say I don\'t know, whoa-oh'
    ];
    var testStringsOutput = [];

    var inputStream = spy.obj(function() {});

    dataReceived = false;

    inputStream.pipe(
      pipeErrorStop
      (spy.obj(function() {})
    ))
    .pipe(
      through2.obj(function(file, enc, done) {
        dataReceived = true;
        testStringsOutput.push(file.contents.toString());
        done();
      }).on('end', function() {
        var anyMissing = false;
        for (var i = 0 && !anyMissing; i < testStringsInput.length; i++) {
          anyMissing = testStringsOutput.indexOf(testStringsInput[i]) === -1;
        }

        if (anyMissing) {
          t.fail('at least one file did not pass through');
        } else {
          t.pass('all files passed through');
        }
        t.end();
      })
    )
    .pipe(
      spy.obj(function() { })
    );

    for (var i = 0; i < testStringsInput.length; i++) {
      inputStream.write(
        new gutil.File({
          path: i + '.txt',
          contents: Buffer(testStringsInput[i])
        })
      );
    }

    setTimeout(function() {
      if (dataReceived) {
        t.fail('data received before stream end');
      } else {
        t.pass('no data received before stream end');
      }
      inputStream.end();
    })
  });
});

tests.push(function() {
  var throwError = [true, false];
  for (var i = 0; i < 2; i++) (function(i) {
    test(throwError[i] ? 'should not pass any data if stream throws an error' : 'should pass data if no error is thrown', function(t) {

      var testStrings = [
        'abra',
        'ca',
        'dabra'
      ];

      var inputStream = spy.obj(function() {});
      var dataReceived = false;

      inputStream.pipe(
        pipeErrorStop(through2.obj(function(file, enc, cb) {
          if (file.contents.toString() === 'ca' && throwError[i]) {
            this.emit('error')
          } else {
            this.push(file);
          }
          cb();
        }))
      )
      .pipe(
        through2.obj(function(file, enc, cb) {
          dataReceived = true;
        })
      );

      setTimeout(function() {
        if (dataReceived && throwError[i]) {
          t.fail('error thrown, yet data received - bad');
        } else if (dataReceived && !throwError[i]) {
          t.pass('no error thrown and data received - good');
        } else if (!dataReceived && throwError[i]) {
          t.pass('error thrown and no error received - good');
        } else if (!dataReceived && !throwError[i]) {
          t.fail('no error thrown and no data received - bad');
        }
      });


      for (var j = 0; j < testStrings.length; j++) {
        inputStream.write(
          new gutil.File({
            path: j + '.txt',
            contents: Buffer(testStrings[j])
          })
        );
      }
      inputStream.end();


      t.plan(1);
    }); 
  })(i);
});

for (var i = 0; i < tests.length; i++) {
  tests[i]();
}