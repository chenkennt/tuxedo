module.exports = (function() {
  var path = require("path");
  return {
    "type": function(command, context) {
      var extmap = {
        ".md": "markdown"
      };
      // can only detect file type when typing one file
      if (command.args.length != 2) return;
      if (command.args[1].indexOf("*") >= 0 || command.args[1].indexOf("?") >= 0) return;
      var ext = path.extname(command.args[1]);
      if (extmap.hasOwnProperty(ext)) {
        context.addVisualizer(extmap[ext]);
      }
    }
  };
})();
