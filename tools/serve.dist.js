"use strict";

var gulp = require('gulp');
var server = require('./server');

gulp.task('serve.dist', function() {
  server.listen();
});

module.exports = {};
