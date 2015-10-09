module.exports = (function() {
  var spawn = require("child_process").spawn;
  return {
    // an executor using child_process module and call command by cmd.exe
    cmd: function(command, env, context) {
      var options = {
        cwd: env.cwd()
      };
      var process = spawn("cmd.exe", [ "/c", command.raw ], options);
      process.stdout.on("data", function(data) {
        context.write("" + data);
      });
      process.stderr.on("data", function(data) {
        context.error("" + data);
      });
      process.on("close", function() {
        context.close();
      });

      // return false to prevent session from being closed
      return false;
    }
  };
})();
