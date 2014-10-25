#!/usr/bin/env node

var fs = require("fs");
var path = require("path");
var npm = require("npm");
var execSync = require("exec-sync");
var async = require("async");
var demethodize = require("demethodize");

var writeFile = demethodize(fs.writeFile);
var mkdir = demethodize(fs.mkdir);
var npmInstall = demethodize(npm.install);

function spread (fn) {
  return function (arr, ctx) {
    return fn.apply(ctx, arr);
  };
}

function makeProject (projectName, cb) {
  
  if (projectName === undefined) {
    throw new Error("Pass a project name!");
  }

  var projectDir = path.join(process.cwd(), projectName);

  var pkg = require("./pkg-template.json");
  var gitig = fs.readFileSync("./.gitignore");

  var nmDir = path.join(projectDir, "node_modules");
  var libDir = path.join(projectDir, "lib");
  var testDir = path.join(projectDir, "test");

  function makeDirectories (done) {
    async.map([
      nmDir,
      libDir,
      testDir
    ], mkdir, done)
  }

  function writeFiles (done) {
    async.map([
      [path.join(projectName, "package.json"), JSON.stringify(pkg, null, 2)],
      [path.join(projectName, ".gitignore"), gitig],
      [path.join(projectName, "index.js"), "module.exports = require(\"./lib\")"],
      [path.join(libDir, "index.js"), "module.exports = {}"],
      [path.join(testDir, "index.js"), "var lib = require(\"..\")"],
    ], spread(writeFile), done);
  }

  function installDependencies (done) {
    process.chdir(projectDir);
    npm.load({}, function (err) {
      if (err) throw err;
      async.map([
        "mocha",
        "chai"
      ], npmInstall, done)
    });
  }

  fs.mkdirSync(projectDir);

  async.series([
    makeDirectories,
    writeFiles,
    installDependencies
  ], cb)

}

module.exports = makeProject;