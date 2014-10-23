#!/usr/bin/env node

var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec;

// or 2?
var projectName = process.argv[1];

var projectDir = path.join(__dirname, projectName);
var libDir = path.join(projectDir, "lib");
var testDir = path.join(projectDir, "test");

// create directory
fs.mkdirSync(projectPath);
fs.mkdirSync(libDir);
fs.mkdirSync(testDir);

