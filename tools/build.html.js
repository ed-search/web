"use strict";

var gulp = require('gulp');

gulp.task('build.html', function(){
  return gulp.src('src/site/**/*.html')
    .pipe(gulp.dest('dist'));
});

module.exports = {};
