"use strict";

var gulp = require('gulp');
var del = require('del');

gulp.task('clean', function () {
  return del([
    'dist/css/',
    'dist/fonts/',
    'dist/img',
    'dist/*.js',
		'dist/*.map',
		'dist/*.html',
		'dist/*.css*'
  ]);
});

module.exports = {};
