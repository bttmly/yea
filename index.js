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
var npmLoad = demethodize(npm.load);

var pkg = require("./pkg-template.json");
var gitig = fs.readFileSync("./.gitignore");

function spread (fn) {
  return function (arr) {
    return fn.apply(this, arr);
  };
}

module.exports = function makeProject (projectName, cb) {
  
  if (projectName === undefined) {
    throw new Error("Pass a project name!");
  }

  var projDir = path.join(process.cwd(), projectName);
  var nmDir = path.join(projDir, "node_modules");
  var libDir = path.join(projDir, "lib");
  var testDir = path.join(projDir, "test");

  var deps = ["mocha", "chai"];

  function makeDirectories (done) {
    async.map([nmDir, libDir, testDir], mkdir, done);
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
    process.chdir(projDir);
    async.map(deps, npmInstall, done);
  }

  async.series([
    fs.mkdir.bind(fs, projDir)
    makeDirectories,
    writeFiles,
    npmLoad,
    installDependencies
  ], cb)

};