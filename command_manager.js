module.exports = (function() {
  var util = require("util");
  var EventEmitter = require('events').EventEmitter;
  var executors = require("./executors");
  var commandline = require("./commandline");
  var commands = require("./plugins/commands");
  var classifiers = require("./plugins/classifiers");
  var visualizers = require("./plugins/visualizers");

  function ExecutionContext(frame) {
    this.addVisualizer = function(type) {
      if (visualizers.hasOwnProperty(type)) {
        // create a new tab for the visualizer
        var tab = frame.createTab();
        visualizers[type](this, tab);
      }
    }
  }

  util.inherits(ExecutionContext, EventEmitter);

  ExecutionContext.prototype.write = function(data) {
    this.emit("out", data);
  }

  ExecutionContext.prototype.writeln = function(data) {
    this.write(data + "\n");
  }

  ExecutionContext.prototype.error = function(data) {
    this.emit("error", data);
  }

  ExecutionContext.prototype.close = function() {
    this.emit("close");
  }

  function getExecutor(command) {
    if (command.args.length > 0) {
      if (commands.hasOwnProperty(command.args[0])) {
        // first try internal commands
        return commands[command.args[0]];
      } else {
        // for others using cmd to execute
        return executors.cmd;
      }
    }
  }

  function initializeClassifier(command, context) {
    if (classifiers.hasOwnProperty(command.args[0])) {
      var classifier = classifiers[command.args[0]];
      classifier(command, context);
    }
  }

  return {
    exec: function(commandText, env, frame, callback) {
      var command = commandline.parse(commandText);
      var executor = getExecutor(command);
      var context = new ExecutionContext(frame);
      context.on("close", callback);
      var returns;
      if (executor !== undefined) {
        // always add a default visualizer to display raw output
        context.addVisualizer("text");
        initializeClassifier(command, context);
        returns = executor(command, env, context);
      }

      // if func returns nothing, context will automatically be closed after it returns.
      // to avoid context from being closed (e.g. in async mode), return something from func (usually a false).
      if (returns === undefined) context.close();
    }
  };
})();
