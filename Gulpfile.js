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
const util = require("gulp-util");
const stylus = require("gulp-stylus");
const fs = require("fs");
const path = require("path");
const stripIndent = require("strip-indent");
const zip = require("gulp-zip");
const gzip = require("gulp-gzip");
const tar = require("gulp-tar");
const run = require("gulp-run");
const wait = require("gulp-wait");
const git = require("gift");
const documentation = require("documentation");
const streamArray = require("stream-array");
const runSequence = require("run-sequence");
const repo = git("./");
const webserverPort = 8080;
const isWin = /^win/.test(process.platform);
const appRoot = path.resolve(".");

/* Tasks (will be extracted to separated files) */

/* Sideshow's main stylesheet */
gulp.task("style:main", () =>
  gulp
    .src("stylesheets/sideshow.styl")
    .pipe(stylus())
    .on("error", errorHandler("sideshow_stylesheet_compiling_error"))
    .pipe(autoprefixer())
    .on("error", errorHandler("sideshow_stylesheet_autoprefixing_error"))
    .pipe(rename("sideshow.min.css"))
    .pipe(cssnano({ safe: true }))
    .pipe(gulp.dest("distr/stylesheets")));

gulp.task("style:font", () =>
  gulp
    .src("stylesheets/sideshow-fontface.styl")
    .pipe(stylus())
    .on("error", errorHandler("fontface_stylesheet_compiling_error"))
    .pipe(autoprefixer())
    .on("error", errorHandler("fontface_stylesheet_autoprefixing_error"))
    .pipe(rename("sideshow-fontface.min.css"))
    .pipe(cssnano({ safe: true }))
    .pipe(gulp.dest("distr/fonts")));

gulp.task("style", ["style:main", "style:font"]);

//Examples pages Style task
gulp.task("examples:style", () =>
  gulp
    .src("examples/stylesheets/styl/example.styl")
    .pipe(stylus())
    .on("error", errorHandler("examples_stylesheet_compiling_error"))
    .pipe(autoprefixer())
    .on("error", errorHandler("examples_stylesheet_autoprefixing_error"))
    .pipe(rename("example.min.css"))
    .pipe(cssnano({ safe: true }))
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

//Clean task
gulp.task("clean", () => del(["distr/*.js", "docs/**/*"]));

//Watch Task
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

//Webserver task
gulp.task("webserver", () => {
  serve(__dirname, { port: webserverPort });
});

//Default task
gulp.task("default", cb => {
  runSequence(["examples:style", "style", "watch"], "webserver", cb);
});

gulp.task("update-version", () => {
  updateVersionNumberReferences();
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

gulp.task("prepare-build", ["update-version", "clean"], () => {
  console.log(
    "Remember to edit the CHANGELOG file before doing a complete build."
  );
});

gulp.task("complete-build", ["examples:style", "style"], cb => {
  runSequence("build-scripts", "generate-docs", cb);
});

gulp.task("compress:zip", () =>
  gulp
    .src(["./distr/**/*", "./examples/**/*", "example.html"])
    .pipe(zip("sideshow.zip"))
    .pipe(gulp.dest("./")));

gulp.task("compress:tgz", () =>
  gulp
    .src(["./distr/**/*", "./examples/**/*", "example.html"])
    .pipe(tar("sideshow.tar"))
    .pipe(gzip())
    .pipe(gulp.dest("./")));

gulp.task("pack", ["compress:zip", "compress:tgz"], () => {
  var target = util.env.target || "all";

  del(["*.gem", "*.nupkg"]).then(() => {
    repo.status((err, status) => {
      if (Object.keys(status.files).length > 0) {
        console.log(
          "Before packing a new version you must commit your changes."
        );
        return;
      }

      const versionFilePath = path.join(appRoot, "VERSION");

      fs.readFile(versionFilePath, "utf8", (err, version) => {
        const versionNumber = version.match(/[\d.]+/);

        if (target === "all" || target === "github") {
          console.log("Generating git tag and push everything.");
          gulp
            .src("./")
            .pipe(run(`git tag -a ${version} -m '${version}'`))
            .pipe(wait(5000))
            .pipe(run("git push --all origin"))
            .pipe(run("git push --tags origin"));
        }

        if (target === "all" || target === "gem") {
          console.log("Building and pushing Sideshow gem");
          gulp
            .src("./")
            .pipe(run("gem build sideshow.gemspec"))
            .pipe(wait(5000))
            .pipe(run(`gem push sideshow-${versionNumber}.gem`));
        }

        if (isWin && (target === "all" || target === "nuget")) {
          console.log("Packing and pushing Sideshow nuget package");
          gulp
            .src("./")
            .pipe(run("nuget pack sideshow.nuspec"))
            .pipe(wait(5000))
            .pipe(run(`nuget push sideshow.${versionNumber}.nupkg`));
        }
      });
    });
  });
});

function updateVersionNumberReferences() {
  if (!util.env.version) {
    throw new Error(
      "A version number must be passed. Please inform the '--version' argument."
    );
  }
  if (!util.env.name) {
    throw new Error(
      "A version name must be passed. Please inform the '--name' argument."
    );
  }

  const version = util.env.version;
  const name = util.env.name;
  const appRoot = path.resolve(".");
  const versionFilePath = path.join(appRoot, "VERSION");
  const gemspecFilePath = path.join(appRoot, "sideshow.gemspec");
  const nuspecFilePath = path.join(appRoot, "sideshow.nuspec");
  const packageJsonFilePath = path.join(appRoot, "package.json");
  const changelogFilePath = path.join(appRoot, "CHANGELOG.md");
  const copyrightInfoFilePath = path.join(appRoot, "src", "copyright_info.js");
  const variablesFilePath = path.join(
    appRoot,
    "src",
    "general",
    "variables.js"
  );
  const releaseDate = new Date().toISOString().slice(0, 10);

  //VERSION file
  fs.readFile(versionFilePath, "utf8", function(err, data) {
    if (err) throw err;

    fs.writeFile(versionFilePath, `v${version}-${name}`);
  });

  //package.json
  fs.readFile(packageJsonFilePath, "utf8", function(err, data) {
    if (err) throw err;

    const json = JSON.parse(data);
    json.version = version;

    fs.writeFile(packageJsonFilePath, JSON.stringify(json, null, 2));
  });

  //sideshow.gemspec
  fs.readFile(gemspecFilePath, "utf8", function(err, data) {
    if (err) throw err;

    fs.writeFile(
      gemspecFilePath,
      data.replace(/(s.version\s+=\s+)('[\d.]+')/, `$1'${version}'`)
    );
  });

  //copyright_info.js
  fs.readFile(copyrightInfoFilePath, "utf8", function(err, data) {
    if (err) throw err;

    fs.writeFile(
      copyrightInfoFilePath,
      data
        .replace(/(Version: )([\d.]+)/, `$1${version}`)
        .replace(/(Date: )([\d-]+)/, `$1${releaseDate}`)
    );
  });

  //CHANGELOG file
  fs.readFile(changelogFilePath, "utf8", function(err, data) {
    if (err) throw err;

    if (data.indexOf(`#Version ${version}`) == -1) {
      var versionChangelogText = stripIndent(
        `
        #Version ${version} ${name} (${releaseDate})
        
        ##General
        
        ##Fixes
        
        ${Array(61).join("-")}
        
      `
      );

      fs.writeFile(changelogFilePath, versionChangelogText + data);
    }
  });

  fs.readFile(variablesFilePath, "utf8", function(err, data) {
    if (err) throw err;

    fs.writeFile(
      variablesFilePath,
      data.replace(
        /(get VERSION\(\) {\s+return )("[\d.]+")/,
        '$1"' + version + '"'
      )
    );
  });

  fs.readFile(nuspecFilePath, "utf8", function(err, data) {
    if (err) throw err;

    fs.writeFile(
      nuspecFilePath,
      data.replace(/(<version>)([\d.]+)(<\/version>)/, "$1" + version + "$3")
    );
  });
}

function errorHandler(title) {
  return function(error) {
    console.log((title || "Error") + ": " + error.message);
  };
}
