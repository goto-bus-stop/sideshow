// All Requires
const path = require('path')
const http = require('http')
const gulp = require('gulp')
const postcss = require('gulp-postcss')
const cssnano = require('cssnano')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const livereload = require('gulp-livereload')
const del = require('del')
const ecstatic = require('ecstatic')
const rollup = require('rollup').rollup
const documentation = require('documentation')
const streamArray = require('stream-array')

// Sideshow's main stylesheet
gulp.task('style', () =>
  gulp
    .src('stylesheets/sideshow.css')
    .pipe(postcss())
    .pipe(gulp.dest('distr'))
    .pipe(postcss([cssnano({ safe: true })]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('distr')))

gulp.task('scripts:rollup', () => {
  const config = require('./rollup.config')
  return rollup(config).then(bundle =>
    Promise.all(config.targets.map(bundle.write, bundle)))
})

gulp.task('scripts:minify', () =>
  gulp
    .src('./distr/sideshow.js')
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('./distr/')))

gulp.task('scripts', gulp.series('scripts:rollup', 'scripts:minify'))

gulp.task('sideshow', gulp.series('scripts', 'style'))

// Examples
gulp.task('examples:style', () =>
  gulp
    .src('examples/stylesheets/example.css')
    .pipe(postcss(require('./examples/postcss.config').plugins))
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest('./examples'))
    .pipe(postcss([cssnano({ safe: true })]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./examples'))
    .pipe(livereload()))

gulp.task('examples:rollup', () => {
  const config = require('./examples/rollup.config')
  return rollup(config).then(bundle => bundle.write(config))
})

gulp.task('examples:minify', () =>
  gulp
    .src('./examples/bundle.js')
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('./examples'))
    .pipe(livereload()))

gulp.task('examples:scripts', gulp.series('examples:rollup', 'examples:minify'))

gulp.task('examples', gulp.parallel('examples:style', 'examples:scripts'))

// Clean task
gulp.task('clean', () => del(['distr/*.js', 'docs/**/*']))

// Watch Task
gulp.task('watch', () => {
  gulp.watch('src/**/*.js', gulp.series('scripts', 'examples:scripts'))
  gulp.watch('stylesheets/**/*.css', gulp.series('style', 'examples:style'))
  gulp.watch('examples/scripts/**/*.js', gulp.series('examples:scripts'))
  gulp.watch('examples/stylesheets/**/*.css', gulp.series('examples:style'))

  // Create LiveReload server
  livereload.listen()

  gulp.watch('examples/index.html', () => {
    livereload.changed('examples/index.html')
  })
})

// Webserver task
gulp.task('webserver', (done) => {
  http.createServer(ecstatic(path.join(__dirname, 'examples')))
    .listen(5000, done)
})

// Docs

gulp.task('docs', done => {
  documentation.build('src/**/*.js', {}, (err, res) => {
    if (err) return done(err)
    documentation.formats.html(res, {}, (err, output) => {
      if (err) return done(err)

      streamArray(output).pipe(gulp.dest('./docs')).on('end', done)
    })
  })
})

gulp.task('default', gulp.series('sideshow', 'examples'))
gulp.task('full', gulp.series('clean', 'default', 'docs'))

gulp.task('dev', gulp.parallel('default', 'watch', 'webserver'))
