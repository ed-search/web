"use strict";

var gulp = require('gulp');
var runSequence = require('run-sequence');
var requireDir = require('require-dir');

var tools = requireDir('./tools');

/**
 * Build
 */
gulp.task('build', function() {
  return runSequence(
    'clean',
    'build.html',
    'copy',
    'build.js',
    'build.css'
  );
});

/**
 * Serve
 */
gulp.task('serve', function() {
  return runSequence(
    'clean',
    'build.html',
    'copy',
    'build.js',
    'build.css',
    'serve.dist'
  );
});

/**
 * Serve
 */
gulp.task('serve.watch', function() {
  return runSequence(
    'clean',
    'build.html',
    'copy',
    'build.js',
    'build.css',
    'serve.dist',
    'watch'
  );
});
