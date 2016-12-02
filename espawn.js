var configurable = require('config-obj'),
  util = require('util'),
  spawn = require('child_process').spawn;

/**
 * Check success
 * @param outputData
 * @param code
 * @param errorData
 * @returns {boolean}
 */
function checkSuccess (outputData, code, errorData) {
  return code === 0 && errorData === '';
}

/**
 * Constructor
 * @param options
 * @constructor
 */
var Spawn = function(options) {
  var defaultOptions = {
    program: null,
    cwd: null,
    silent: false
  };

  this.option(options);
};

/**
 * Combine params
 * @returns {Array}
 */
Spawn.joinParams =function() {
  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i] !== undefined && arguments[i] !== null) {
      if (util.isArray(arguments[i])) {
        result = result.concat(arguments[i]);
      }
      else {
        result.push(arguments[i]);
      }
    }
  }

  return result;
};

/**
 * Prototype
 * @type {{cmd: Spawn.cmd}}
 */
Spawn.prototype = {
  cmd: function(cmd, callback) {
    if (!util.isArray(cmd)) {
      cmd = [cmd];
    }

    var options = this.getOption(),
      program,
      s,
      cwd = options.cwd,
      outputData = [],
      errorData = [];

    if (typeof options.program === 'string') {
      program = options.program;
    }
    else {
      program = cmd.shift();
    }

    if (typeof cwd === 'string') {
      s = spawn(program, cmd,
        {
          cwd: cwd
        }, function() {}
      );
    }
    else {
      s = spawn(program, cmd, function() {});
    }

    s.on('error', function(err) {
      callback && callback(err);
    });

    // Do not use "exit" event here, because "Note that the child process stdio streams might still be open."
    s.on('close', function(code, signal) {
      var check;

      if ('check' in options && typeof options.check === 'function') {
        check = options.check;
      }
      else {
        check = checkSuccess;
      }

      var outputDataString = outputData.join(''),
        errorDataString = errorData.join('');

      // success
      if (check(outputDataString, code, errorDataString)) {
        callback && callback(null, outputDataString);
      } else {
        var e = new Error(errorDataString);
        e.code = code;
        e.output = outputDataString;
        callback && callback(e);
      }
    });

    s.stdout.on('data', function(data) {
      if (!options.silent) {
        process.stdout.write(data, function() {});
      }
      outputData.push(data);
    });

    s.stderr.on('data', function(data) {
      if (!options.silent) {
        process.stderr.write(data, function() {});
      }
      errorData.push(data);
    });

    this.endSession();

    return this;
  }
};

configurable(Spawn);

module.exports = Spawn;