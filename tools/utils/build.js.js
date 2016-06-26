"use strict";

var gulp = require('gulp');
var flatten = require('gulp-flatten');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json', {
  typescript: require('typescript')
});

function buildJs(folder) {
  return gulp.src(['typings/index.d.ts', 'src/' + folder + '/**/*.ts'])
    .pipe(sourcemaps.init())
    .pipe(ts(tsProject))
    .pipe(flatten({ subPath: [1, -1]}))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist/js'));
}

module.exports = buildJs;
