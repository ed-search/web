"use strict";

var gulp = require('gulp');
var flatten = require('gulp-flatten');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('build.js', function(){
  return gulp.src(['src/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/'));
});

module.exports = {};
