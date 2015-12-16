/* global describe, it, beforeEach */
'use strict';

var pipeErrorStop = require('../'),
    should = require('should'),
    gutil = require('gulp-util'),
    through2 = require('through2'),
    sinon = require('sinon');

require('mocha');

describe('pipe-error-stop', function () {
  var fakeFile,

      // streams
      inStream,
      pes,
      outStream,
      totalStream,

      // callbacks and spy
      successCallback,
      errorCallback,
      outStreamSpy,
      onErrorSpy,
      oldOn;

  beforeEach(function () {
    fakeFile = getFakeFile('hello world');
    outStreamSpy = sinon.spy();
    successCallback = sinon.spy();
    errorCallback = sinon.spy();
    onErrorSpy = sinon.spy();

    inStream = through2.obj();

    oldOn = inStream.on;
    inStream.on = function onStub (event) {
      oldOn.apply(inStream, arguments);

      if (event === 'error') {
        onErrorSpy.apply(inStream, arguments);
      }
    };

    pes = pipeErrorStop({
      successCallback: successCallback,
      errorCallback: errorCallback
    });
    outStream = through2.obj(outStreamSpy);

    totalStream = inStream.pipe(pes).pipe(outStream);
  });

  it('should pass files through once the stream ends, but not sooner', function (done) {
    inStream.write('data', fakeFile);
    setTimeout(function () {
      outStreamSpy.callCount.should.equal(0);
      inStream.end();
      setTimeout(function () {
        outStreamSpy.callCount.should.equal(1);
        done();
      });
    });
  });

  it('should not pass files through if an error occurs', function () {
    inStream.write('data', fakeFile);
    inStream.emit('error');
    inStream.end();
    setTimeout(function () {
      outStreamSpy.callCount.should.equal(0);
    });
  });

  it('should call the success callback', function () {
    inStream.end();
    setTimeout(function () {
      successCallback.callCount.should.equal(1);
    });
  });

  it('should call the error callback when the previous pipe errors', function () {
    inStream.emit('error');
    inStream.end();
    setTimeout(function () {
      successCallback.callCount.should.equal(0);
      errorCallback.callCount.should.equal(1);
    });
  });

  it('should add an error handler to the previous stream', function () {
    onErrorSpy.callCount.should.equal(1);
  });
});


function getFakeFile (fileContent) {
  return new gutil.File({
    path: './test/fixture/file.js',
    cwd: './test/',
    base: './test/fixture/',
    contents: new Buffer(fileContent || '')
  });
}
