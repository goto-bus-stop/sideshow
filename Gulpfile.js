// All Requires
const path = require("path");
const gulp = require("gulp");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const livereload = require("gulp-livereload");
const del = require("del");
const serve = require("serve");
const rollup = require("rollup").rollup;
const documentation = require("documentation");
const streamArray = require("stream-array");
const runSequence = require("run-sequence");

// Sideshow's main stylesheet
gulp.task("style", () =>
  gulp
    .src("stylesheets/sideshow.css")
    .pipe(postcss())
    .pipe(gulp.dest("distr"))
    .pipe(postcss([cssnano({ safe: true })]))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("distr")));

gulp.task("scripts:rollup", () => {
  const config = require("./rollup.config");
  return rollup(config).then(bundle =>
    Promise.all(config.targets.map(bundle.write, bundle)));
});

gulp.task("scripts:minify", ["scripts:rollup"], () =>
  gulp
    .src("./distr/sideshow.js")
    .pipe(rename({ suffix: ".min" }))
    .pipe(uglify())
    .pipe(gulp.dest("./distr/")));

gulp.task("scripts", ["scripts:rollup", "scripts:minify"]);

gulp.task("sideshow", ["scripts", "style"]);

// Examples
gulp.task("examples:style", () =>
  gulp
    .src("examples/stylesheets/example.css")
    .pipe(postcss(require("./examples/postcss.config").plugins))
    .pipe(rename("bundle.css"))
    .pipe(gulp.dest("./examples/stylesheets"))
    .pipe(postcss([cssnano({ safe: true })]))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./examples/stylesheets"))
    .pipe(livereload()));

gulp.task("examples:rollup", () => {
  const config = require("./examples/rollup.config");
  config.entry = path.join("./examples", config.entry);
  config.dest = path.join("./examples", config.dest);

  return rollup(config).then(bundle => bundle.write(config));
});

gulp.task("examples:minify", ["examples:rollup"], () =>
  gulp
    .src("./examples/bundle.js")
    .pipe(rename({ suffix: ".min" }))
    .pipe(uglify())
    .pipe(gulp.dest("./examples"))
    .pipe(livereload()));

gulp.task("examples:scripts", ["examples:rollup", "examples:minify"]);

gulp.task("examples", ["examples:style", "examples:scripts"]);

// Clean task
gulp.task("clean", () => del(["distr/*.js", "docs/**/*"]));

// Watch Task
gulp.task("watch", () => {
  gulp.watch("src/**/*.js", ["scripts", "examples:scripts"]);
  gulp.watch("stylesheets/**/*.css", ["style", "examples:style"]);
  gulp.watch("examples/scripts/**/*.js", ["examples:scripts"]);
  gulp.watch("examples/stylesheets/**/*.css", ["examples:style"]);

  // Create LiveReload server
  livereload.listen();

  gulp.watch("examples/index.html", () => {
    livereload.changed("examples/index.html");
  });
});

// Webserver task
gulp.task("webserver", () => {
  serve(path.join(__dirname, "examples"));
});

// Docs

gulp.task("docs", done => {
  documentation.build("src/**/*.js", {}, (err, res) => {
    if (err) return done(err);
    documentation.formats.html(res, {}, (err, output) => {
      if (err) return done(err);

      streamArray(output).pipe(gulp.dest("./docs")).on("end", done);
    });
  });
});

gulp.task("complete-build", ["examples:style", "style"], cb => {
  runSequence("scripts", "docs", cb);
});

gulp.task("default", ["sideshow", "examples"]);

gulp.task("dev", cb => {
  runSequence(["default", "watch", "webserver"], cb);
});
