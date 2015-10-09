module.exports = (function() {
  var providers = require("./plugins/providers");
  var commandline = require("./commandline");
  return {
    getHint: function(env, cmd, index, callback) {
      // by default, return files as hint
      var parsed = commandline.parse(cmd, index);
      providers.file(env, parsed, callback, null);
    }
  };
})();
