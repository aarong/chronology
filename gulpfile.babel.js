import gulp from "gulp";
import del from "del";
import sourcemaps from "gulp-sourcemaps";
import rename from "gulp-rename";
import replace from "gulp-replace";
import browserify from "browserify";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import babel from "gulp-babel";
import uglify from "gulp-uglify";
import path from "path";

const clean = () => del(path.join(__dirname, "build"));

const browserBundleWithmaps = () => {
  const b = browserify({
    entries: path.join(__dirname, "src/main.browser.js"),
    debug: true,
    standalone: "chronology"
  });

  return b
    .transform("babelify", {
      presets: [["@babel/preset-env"]] // Uses browserslist config in package.json
    })
    .bundle()
    .pipe(source("bundle.withmaps.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true })) // Browserify source maps are piped in
    .pipe(babel({ plugins: ["add-module-exports"] })) // No .default
    .pipe(uglify())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(path.join(__dirname, "build")));
};

const browserBundleNomaps = () =>
  gulp
    .src("build/bundle.withmaps.js")
    .pipe(replace("//# sourceMappingURL=bundle.withmaps.js.map\n", ""))
    .pipe(rename("bundle.js"))
    .pipe(gulp.dest("build/"));

const nodeTranspile = () =>
  gulp
    .src(["src/*.js", "!src/main.browser.js"]) // Don't transpile the browser entry-point
    .pipe(sourcemaps.init())
    .pipe(babel({ plugins: ["add-module-exports"] })) // No .default
    .pipe(sourcemaps.mapSources(sourcePath => `../src/${sourcePath}`))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/"));

const copy1 = () =>
  gulp
    .src("./index.build.js")
    .pipe(rename("index.js"))
    .pipe(gulp.dest("build/"));

const copy2 = () =>
  gulp.src("./{package.json,LICENSE,README.md}").pipe(gulp.dest("build/"));

export const build = gulp.series(
  // eslint-disable-line import/prefer-default-export
  clean,
  browserBundleWithmaps,
  browserBundleNomaps,
  nodeTranspile,
  copy1,
  copy2
);
