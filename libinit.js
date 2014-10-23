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

function spread (fn) {
  return function (arr) {
    return fn.apply(null, arr);
  }
}

// or 2?
var projectName = process.argv[2];

var projectDir = path.join(process.cwd(), projectName);

var writeFile = demethodize(fs.writeFile);
var mkdir = demethodize(fs.mkdir);



var pkg = require("./pkg-template.json");
var gitig = fs.readFileSync("./.gitignore");

// main directory
fs.mkdirSync(projectDir);

function makeDirectories (done) {
  async.map([
    path.join(projectDir, "node_modules"),
    path.join(projectDir, "lib"),
    path.join(projectDir, "test")
  ], fs.mkdir, done )
}

function writeFiles (done) {
  async.map([
    path.join(projectName, "package.json"), JSON.stringify(pkg), done),
    path.join(projectName, ".gitignore"), gitig, done),
    path.join(projectName, "index.js"), "module.exports = require(\"./lib\")", done),
    path.join(libDir, "index.js"), "module.exports = {}"),
    path.join(testDir, "index.js"), "var lib = require(\"..\")", done)
  ], fs.writeFile, done );
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
})