"use strict";

var gulp = require('gulp');
var buildJs = require('./utils/build.js');

gulp.task('build.js.worker', function(){
  return buildJs('worker');
});

module.exports = {};
