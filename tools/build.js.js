"use strict";

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('build.js', function(){
  return gulp.src(['src/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/'));
});

module.exports = {};
