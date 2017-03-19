// All Requires
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const livereload = require("gulp-livereload");
const del = require("del");
const serve = require("serve");
const rollup = require("rollup").rollup;
const stylus = require("gulp-stylus");
const documentation = require("documentation");
const streamArray = require("stream-array");
const runSequence = require("run-sequence");

// Sideshow's main stylesheet
gulp.task("style:main", () =>
  gulp
    .src("stylesheets/sideshow.styl")
    .pipe(stylus())
    .pipe(autoprefixer())
    .pipe(cssnano({ safe: true }))
    .pipe(rename("sideshow.min.css"))
    .pipe(gulp.dest("distr/stylesheets")));

gulp.task("style:font", () =>
  gulp
    .src("stylesheets/sideshow-fontface.styl")
    .pipe(stylus())
    .pipe(autoprefixer())
    .pipe(cssnano({ safe: true }))
    .pipe(rename("sideshow-fontface.min.css"))
    .pipe(gulp.dest("distr/fonts")));

gulp.task("style", ["style:main", "style:font"]);

// Examples pages Style task
gulp.task("examples:style", () =>
  gulp
    .src("examples/stylesheets/styl/example.styl")
    .pipe(stylus())
    .pipe(autoprefixer())
    .pipe(cssnano({ safe: true }))
    .pipe(rename("example.min.css"))
    .pipe(gulp.dest("examples/stylesheets")));

gulp.task("bundle:rollup", () => {
  const config = require("./rollup.config");
  return rollup(config).then(bundle =>
    Promise.all(config.targets.map(bundle.write, bundle)));
});

gulp.task("bundle:minify", ["bundle:rollup"], () =>
  gulp
    .src("./distr/sideshow.js")
    .pipe(rename({ suffix: ".min" }))
    .pipe(uglify())
    .pipe(gulp.dest("./distr/")));

gulp.task("bundle-scripts", ["bundle:rollup", "bundle:minify"]);

// Clean task
gulp.task("clean", () => del(["distr/*.js", "docs/**/*"]));

// Watch Task
gulp.task("watch", () => {
  gulp.watch("src/**/*.js", ["bundle-scripts"]);
  gulp.watch("stylesheets/**/*.styl", ["style", "examples:style"]);
  gulp.watch("examples/stylesheets/styl/**/*.styl", ["examples:style"]);

  // Create LiveReload server
  livereload.listen();

  // Watch any files in distr/, reload on change
  gulp
    .watch(["examples/stylesheets/example.min.css", "distr/**"])
    .on("change", () => {
      livereload.changed();
    });
});

// Webserver task
gulp.task("webserver", () => {
  serve(__dirname);
});

// Default task
gulp.task("default", cb => {
  runSequence(["examples:style", "style", "watch"], "webserver", cb);
});

gulp.task("generate-docs", done => {
  documentation.build("src/**/*.js", {}, (err, res) => {
    if (err) return done(err);
    documentation.formats.html(res, {}, (err, output) => {
      if (err) return done(err);

      streamArray(output).pipe(gulp.dest("./docs")).on("end", done);
    });
  });
});

gulp.task("complete-build", ["examples:style", "style"], cb => {
  runSequence("build-scripts", "generate-docs", cb);
});
