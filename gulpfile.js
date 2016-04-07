// Load Gulp
var gulp = require('gulp');
var gutil = require('gulp-util');
var plugins = require('gulp-load-plugins')({
    rename: {
        'gulp-live-server': 'serve'
    }
});
var args = require('yargs').argv;

gulp.task('default', ['watch']);

gulp.task('server', ['serve', 'watch']);

gulp.task('deploy', ['sass', 'js', 'eb-deploy']);

gulp.task('sass', function() {
  return gulp.src('./assets/sass/**/*.scss')
  .pipe(plugins.plumber())
  .pipe(plugins.sass({
    includePaths: [
      './assets/vendor',
      './assets/vendor/bootstrap-sass/assets/stylesheets'
    ]
  }))
  .on('error', function(err) {
      gutil.log(err);
      this.emit('end');
  })
  .pipe(plugins.if(!args.dev, plugins.cssmin()))
  .pipe(gulp.dest('./public/css'));
});

gulp.task('js', function() {
  return gulp.src([
    './assets/vendor/bootstrap/dist/js/bootstrap.min.js',
    './assets/vendor/bootstrap-material-design/dist/js/material.min.js',
    './assets/vendor/bootstrap-material-design/dist/js/ripples.min.js'
  ])
  .pipe(plugins.concat('bootstrap.js'))
  .pipe(gulp.dest('./public/js'));
});

gulp.task('eb-deploy', plugins.shell.task('eb deploy'));

// Default task
gulp.task('watch', function() {
    gulp.watch('assets/js/libs/**/*.js', ['squish-jquery']);
    gulp.watch('assets/js/*.js', ['build-js']);
    gulp.watch('assets/sass/**/*.scss', ['sass']);
});

gulp.task('serve', function() {
  var server = plugins.express;
  server.run(['./bin/www']);
  gulp.watch(['./public/css/*', './public/js/*'], function(file) {
    server.notify.apply(server, [file]);
  });
});
