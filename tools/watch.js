"use strict";

var gulp = require('gulp');
var runSequence = require('run-sequence');

function reload(task) {
  return function() {
    runSequence(
      task,
      'reload'
    );
  };
}

gulp.task('watch', function() {
  gulp.watch("src/**/*.html", reload('build.html'));
  gulp.watch("src/**/*.scss", reload('build.css'));
  gulp.watch("src/**/*.js", reload('build.js'));
});

module.exports = {};
