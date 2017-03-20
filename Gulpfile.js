// All Requires
const gulp = require("gulp");
const postcss = require("gulp-postcss");
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
    .pipe(gulp.dest("distr")));

// Examples pages Style task
gulp.task("examples:style", () =>
  gulp
    .src("examples/stylesheets/example.css")
    .pipe(postcss(require("./examples/postcss.config").plugins))
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
