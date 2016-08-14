"use strict";

var gulp = require('gulp');
var debug = require('gulp-debug');

var copyConf = [
  { files: ['node_modules/vue/dist/vue.js', 'node_modules/vue/dist/vue.min.js', 'node_modules/vue/dist/vue.min.js.map'], dist: '' },
  { files: ['node_modules/rx/dist/rx.lite.js', 'node_modules/rx/dist/rx.lite.min.js', 'node_modules/rx/dist/rx.lite.map'], dist: '' },
  { files: ['node_modules/rx-dom/dist/rx.dom.js', 'node_modules/rx-dom/dist/rx.dom.min.js', 'node_modules/rx-dom/dist/rx.dom.map'], dist: '' },
  { files: ['node_modules/lunr/lunr.min.js'], dist: '' },
  { files: ['node_modules/bootstrap-sass/assets/fonts/bootstrap/*'], dist: 'fonts' },
  { files: ['src/site/img/**/*'], dist: 'img' }
];

gulp.task('copy', function () {
  return copyConf.forEach(function(item) {
    gulp.src(item.files)
      .pipe(debug())
  		.pipe(gulp.dest('dist/' + item.dist));
  });
});

module.exports = {};
