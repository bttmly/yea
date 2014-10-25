#!/usr/bin/env node

var fs = require("fs");
var path = require("path");
var npm = require("npm");
var execSync = require("exec-sync");
var async = require("async");
var demethodize = require("demethodize");

function handleError (err) {
  if (err) throw err;
}

function spread (fn, ctx) {
  ctx = ctx || null;
  return function (arr) {
    return fn.apply(ctx, arr);
  };
}

// or 2?
var projectName = process.argv[2];

var projectDir = path.join(process.cwd(), projectName);

var writeFile = demethodize(fs.writeFile);
var mkdir = demethodize(fs.mkdir);



var pkg = require("./pkg-template.json");
var gitig = fs.readFileSync("./.gitignore");

var nmDir = path.join(projectDir, "node_modules");
var libDir = path.join(projectDir, "lib");
var testDir = path.join(projectDir, "test");

// main directory
fs.mkdirSync(projectDir);

function makeDirectories (done) {
  async.map([
    nmDir,
    libDir,
    testDir
  ], fs.mkdir, done)
}

function writeFiles (done) {
  async.map([
    [path.join(projectName, "package.json"), JSON.stringify(pkg, null, 2)],
    [path.join(projectName, ".gitignore"), gitig],
    [path.join(projectName, "index.js"), "module.exports = require(\"./lib\")"],
    [path.join(libDir, "index.js"), "module.exports = {}"],
    [path.join(testDir, "index.js"), "var lib = require(\"..\")"],
  ], spread(fs.writeFile), done);
}

function installDependencies (done) {
  process.chdir(projectDir);
  npm.load({}, function (err) {
    if (err) throw err;
    async.map([
      "mocha",
      "chai"
    ], npm.install.bind(npm), done)
  });
}

async.series([
  makeDirectories,
  writeFiles,
  installDependencies
], function (err) {
  if (err) throw err;
  console.log(done);
});