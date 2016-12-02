var svnsync = require('./index'),
  rimraf = require('rimraf');

rimraf('./out/code', function() {
  svnsync({
    'dest': './out',
    'repo': 'https://codevault2.foreseeresults.com/implementation/Clients R/REI/tags/18.4.11',
    'localfolder': 'code',
    "username": "alexei.white",
    "password": "Foresee2016"
  }, function() {
    console.log("Test complete.");
  });
});
