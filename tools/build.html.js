"use strict";

var process = require('process');
var path = require('path');
var gulp = require('gulp');
var replace = require('gulp-replace');
var fs = require('fs');


var argv = require('yargs')
    .default('database', 'https://raw.githubusercontent.com/ed-search/database/data/')
    .argv
;

gulp.task('build.html', function() {
  console.log('Using database ' + argv.database);
  return gulp.src('src/**/*.html')
    .pipe(replace('@@envConfig', JSON.stringify({database: argv.database})))
    .pipe(gulp.dest('dist'));
});

module.exports = {};
