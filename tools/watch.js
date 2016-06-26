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
  gulp.watch("src/site/**/*.js", reload('build.js.site'));
  gulp.watch("src/worker/**/*.js", reload('build.js.worker'));
});

module.exports = {};
