"use strict";

var gulp = require('gulp');
var path = require('path');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

var sassOptions = {
  includePaths: [
    path.join(__dirname, '..', 'node_modules') // npm
  ]
};

gulp.task('build.css', function(){
  return gulp.src('src/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

module.exports = {};
