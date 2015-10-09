module.exports = (function() {
  var providers = require("./plugins/providers");
  var commandline = require("./commandline");
  return {
    updateHint: function(env, cmd, index, context) {
      // by default, return files as hint
      var parsed = commandline.parse(cmd, index);
      providers.file(env, parsed, context, null);
    }
  };
})();
