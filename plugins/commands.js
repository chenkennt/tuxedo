module.exports = (function() {
  var fs = require("fs");
  var path = require("path");
  return {
    cd: function(command, env, context) {
      var relPath = command.argr;
      if (relPath === "") {
        context.write(env.cwd());
      } else {
        var absolutePath = path.resolve(env.cwd(), relPath);
        if (!fs.existsSync(absolutePath)) {
          context.error("The system cannot find the path specified.");
        } else if (!fs.lstatSync(absolutePath).isDirectory()) {
          context.error("The directory name is invalid.");
        } else {
          env.chdir(absolutePath);
        }
      }
    }
  };
})();
