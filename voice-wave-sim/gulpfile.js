const gulp = require('gulp');
const less = require('gulp-less');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const detectPort = require('detect-port');

const paths = {
  less: 'src/less/**/*.less',
  js: 'src/js/**/*.js',
  html: '*.html'
};

function styles() {
  return gulp.src('src/less/main.less')
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
}

function scripts() {
  return gulp.src(paths.js)
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream());
}

function watch() {
  gulp.watch(paths.less, styles);
  gulp.watch(paths.js, scripts);
  gulp.watch(paths.html).on('change', browserSync.reload);
}

async function serve() {
  const defaultPort = 3000;
  const port = await detectPort(defaultPort);
  
  browserSync.init({
    server: {
      baseDir: './'
    },
    port: port,
    notify: false,
    open: true
  });
}

const build = gulp.parallel(styles, scripts);
const dev = gulp.series(build, gulp.parallel(serve, watch));

exports.styles = styles;
exports.scripts = scripts;
exports.build = build;
exports.serve = serve;
exports.watch = watch;
exports.dev = dev;
exports.default = dev;
