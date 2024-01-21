/* eslint-disable import/no-extraneous-dependencies, no-console */
import * as babel from "@babel/core";
import { promises as fs } from "fs";
import { glob } from "glob";
import webpack from "webpack";
import util from "util";
import path from "path";
import targets from "./targets";

(async function main() {
  // Clear the build folder
  await fs.rm("./build", { recursive: true, force: true });
  await fs.mkdir("./build");

  // Copy files to build folder
  await Promise.all(
    ["package.json", "LICENSE", "README.md"].map(file =>
      fs.copyFile(file, `build/${file}`)
    )
  );
  fs.copyFile("index.build.js", "build/index.js");

  // Transpile for Node (except the browser entrypoint)
  // In Babel, setting sourceMaps: true seems like it should produce external
  // source maps and link them:
  // https://babeljs.io/docs/options#source-map-options
  // But it doesn't:
  // https://github.com/babel/babel/issues/5261
  // You can only produce external sourcemaps using the CLI, so I write
  // the maps to file myself and append a reference in the transpiled source
  const srcFiles = await glob("!(main.browser).js", { cwd: "src" });
  await Promise.all(
    srcFiles.map(file =>
      (async () => {
        console.log(`Transpiling ${file}`);

        // Transpile and produce source maps
        const transpile = await babel.transformFileAsync(`src/${file}`, {
          presets: [["@babel/preset-env", { targets: targets.node }]],
          plugins: ["add-module-exports"], // No .default()
          sourceMaps: true,
          sourceRoot: "../src"
        });

        // Write transpiled source
        await fs.writeFile(
          `build/${file}`,
          `${transpile.code}\n//# sourceMappingURL=${file}.map\n`
        );

        // Write source maps
        await fs.writeFile(
          `build/${file}.map`,
          JSON.stringify(Object.assign(transpile.map, { file }))
        );
      })()
    )
  );

  // Create browser bundles
  console.log("Bundling for the browser");
  const createWebpackConfig = sourceMaps => ({
    entry: "./src/main.browser.js",
    mode: "production",

    module: {
      rules: [
        {
          test: /\.js$/,

          // Bundle will not work if you transpile webpack or core-js polyfills
          // https://stackoverflow.com/questions/57361439/how-to-exclude-core-js-using-usebuiltins-usage
          // https://github.com/zloirock/core-js/issues/743
          exclude: [
            /\bnode_modules[\\/]{1}core-js\b/, // Allow slash or backslash
            /\bnode_modules[\\/]{1}webpack\b/
          ],

          use: {
            loader: "babel-loader",
            options: {
              // Specify all Babel configuration here
              babelrc: false,

              // Fixes "TypeError: __webpack_require__(...) is not a function"
              // https://github.com/webpack/webpack/issues/9379#issuecomment-509628205
              // https://babeljs.io/docs/en/options#sourcetype
              sourceType: "unambiguous",

              presets: [
                [
                  "@babel/preset-env",
                  {
                    // Webpack supports ES modules out of the box
                    // Do not transform to CJS or anything else or you break tree-shaking
                    modules: false,

                    // Adds specific imports for polyfills when they are used
                    useBuiltIns: "usage",
                    corejs: {
                      version: "3",
                      proposals: true
                    },

                    targets: targets.browsers

                    // Verbose preset-env output
                    // debug: true
                  }
                ]
              ]
            }
          }
        }
      ]
    },

    output: {
      filename: sourceMaps ? "bundle.withmaps.js" : "bundle.js",
      path: path.resolve(__dirname, "build"),
      library: "chronology",
      libraryExport: "default", // No .default()
      libraryTarget: "umd",
      globalObject: "this"
    },

    optimization: {
      minimize: true
    },

    // If you use the "source-map" option you get correct line number references
    // but names in stack traces are the minified ones
    // If you use "eval-source-map" you get correct names in stack traces but
    // size is large and the bundle fails on older browsers
    devtool: sourceMaps ? "eval-source-map" : false,

    // Suppress file size warnings
    performance: {
      maxAssetSize: sourceMaps ? 4000000 : 400000,
      maxEntrypointSize: sourceMaps ? 4000000 : 400000
    }

    // Detailed Webpack info
    // stats: "verbose"
  });
  let webpackStats;
  try {
    // With and without sourcemaps
    webpackStats = await util.promisify(webpack)(createWebpackConfig(false));
    webpackStats = await util.promisify(webpack)(createWebpackConfig(true));
  } catch (e) {
    console.log("Webpack threw an error");
    console.log(e.toString());
    return; // Stop
  }
  if (webpackStats.hasErrors()) {
    console.log("Webpack reported one or more compilation errors");
    console.log(webpackStats.toString());
    process.exit(1); // Return failure
  }
  if (webpackStats.hasWarnings()) {
    console.log("Webpack reported one or more warnings");
    console.log(webpackStats.toString());
  }

  console.log("Done");
})();
