var makeProject = require('./');

var projectName = process.argv[1];

makeProject(projectName, function (err) {
  if (err) throw err;
  console.log("Project created.");
});