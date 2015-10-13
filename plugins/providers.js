module.exports = (function() {
  var fs = require("fs");

  return {
    "file": function(env, context, defaultUpdater, param) {
      var fileCache = {};
      return function(cmd) {
        var cwd = env.cwd();
        if (fileCache[cwd] === undefined) {
          fs.readdir(cwd, function(err, files) {
            if (files) {
              fileCache[cwd] = files;
              defaultUpdater(files, cmd.args[cmd.current], context, false);
            }
          });
        } else {
          defaultUpdater(fileCache[cwd], cmd.args[cmd.current], context, false);
        }
      };
    },
    "branch": function(env, context, defaultUpdater, param) {
      return function(cmd) {
        // to be implemented later, hard code for now
        defaultUpdater([ "master", "develop" ], cmd.args[cmd.current], context, true);
      };
    }
  };
})();
