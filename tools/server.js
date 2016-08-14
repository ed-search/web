"use strict";

var gulp = require('gulp');
var browserSync = require('browser-sync').create();

function listen() {
  browserSync.init({
      server: "dist"
  });
}

function reload() {
  browserSync.reload()
}

gulp.task('reload', function() {
  reload()
});

module.exports = {
  listen: listen
};
