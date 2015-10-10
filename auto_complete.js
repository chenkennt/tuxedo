module.exports = (function() {
  var providers = require("./plugins/providers");
  var commandline = require("./commandline");
  var currentProvider = null;
  return {
    init: function(env, context) {
      // by default use file provider
      currentProvider = providers.file(env, context);
    },
    update: function(cmd, index) {
      if (currentProvider !== null) {
        var parsed = commandline.parse(cmd, index);
        currentProvider(parsed);
      }
    }
  };
})();
