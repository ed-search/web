"use strict";

var gulp = require('gulp');
var debug = require('gulp-debug');

var copyConf = [
  { files: ['node_modules/vue/dist/vue.js'], dist: 'js' }
];

gulp.task('copy', function () {
  return copyConf.forEach(function(item) {
    gulp.src(item.files)
      .pipe(debug())
  		.pipe(gulp.dest('dist/' + item.dist));
  });
});

module.exports = {};