module.exports = (function() {
  var fs = require("fs");
  function filterFile(file, filter) {
    // return match level:
    // 0: do not match
    // 1: file contains filter
    // 2: file starts with filter
    if (filter === undefined) return 1;
    if (file.slice(0, filter.length) == filter) return 2;
    if (file.indexOf(filter) >= 0) return 1;
    return 0;
  }

  return {
    "file": function(env, cmd, context, param) {
      var matched = false;
      context.beginUpdate();
      fs.readdir(env.cwd(), function(err, files) {
        if (files) {
          for (var i = 0; i < files.length; i++) {
            switch (filterFile(files[i], cmd.args[cmd.current])) {
              case 1:
                context.update(files[i]);
                break;
              case 2:
                context.update(files[i], !matched);
                matched = true;
                break;
            }
          }
        }
        context.endUpdate();
      });
    }
  };
})();
