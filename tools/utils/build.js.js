"use strict";

var gulp = require('gulp');
var flatten = require('gulp-flatten');
var sourcemaps = require('gulp-sourcemaps');

function buildJs(folder) {
  return gulp.src(['src/' + folder + '/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(flatten({ subPath: [1, -1]}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/'));
}

module.exports = buildJs;
