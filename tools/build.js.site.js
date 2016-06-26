"use strict";

var gulp = require('gulp');
var buildJs = require('./utils/build.js');

gulp.task('build.js.site', function(){
  return buildJs('site');
});

module.exports = {};
