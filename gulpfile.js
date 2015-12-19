'use strict';

var
	browserify	= require('browserify'),
	gulp				= require('gulp'),
  karma       = require('gulp-karma'),
  runSequence = require('run-sequence'),
	sourcemaps	= require('gulp-sourcemaps'),
	transform		= require('vinyl-transform'),
	tslint			= require('gulp-tslint'),
	ts					= require('gulp-typescript'),
	uglify			= require('gulp-uglify');

var tsProject = ts.createProject({
	removeComments: true,
	noImplicitAny: true,
	target: 'ES3',
	module: 'commonjs',
	declarationFiles: false
});

var tsTestProject = ts.createProject({
	removeComments: true,
	noImplicitAny: true,
	target: 'ES3',
	module: 'commonjs',
	declarationFiles: false
});

var browserified = transform(function(filename){
	var b = browserify({entries: filename, debug: true});
	return b.bundle();
});

gulp.task = ('lint', function(){
	return gulp.src([
		'./source/ts/**/**.ts', './test/**/**.test.ts'
	]).pipe(tslint())
		.pipe(tslint.report('verbose'));
});

gulp.task('tsc', function(){
	return gulp.src('./source/ts/**/**.ts')
		.pipe(ts(tsProject))
		.js.pipe(gulp.dest('./temp/source/js'));
});

gulp.task('tsc-tests', function(){
	return gulp.src('./test/**/**.test.ts')
		.pipe(ts(tsTestProject))
		.js.pipe(gulp.dest('./temp/test/'));
});

gulp.task('bundle-js', function(){
	return gulp.src('./temp/source/js/main.js')
		.pipe(browserified)
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist/source/js/'));
});

gulp.task('bundle-test', function(){
  return gulp.src('./temp/test/**/**.test.js')
    .pipe(browserified)
    .pipe(gulp.dest('./dist/test'));
});

gulp.task('karma', function(cb){
  gulp.src('./dist/test/**/**.test.js')
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('end', cb)
    .on('error', function(err){
      throw err;
    });
});

gulp.task('default', function(cb){
  runSequence(
    'lint',  // lint
    ['tsc', 'tsc-tests'],  // complie
    ['bundle-js', 'bundle-test'],  // optimize
    'karma',  // test
    'browser-sync',  // serve
    cb  // callback
  );
});
