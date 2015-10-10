module.exports = (function() {
  var fs = require("fs");
  function filterFile(file, filter) {
    // return match level:
    // 0: do not match
    // 1: file contains filter
    // 2: file starts with filter
    if (filter === undefined) return 1;
    var lowerFile = file.toLowerCase();
    var lowerFilter = filter.toLowerCase();
    if (lowerFile.slice(0, lowerFilter.length) == lowerFilter) return 2;
    if (lowerFile.indexOf(lowerFilter) >= 0) return 1;
    return 0;
  }
  
  function update(files, filter, context) {
    var matched = false;
    context.beginUpdate();
    for (var i = 0; i < files.length; i++) {
      switch (filterFile(files[i], filter)) {
        case 1:
          context.update(files[i]);
          break;
        case 2:
          context.update(files[i], !matched);
          matched = true;
          break;
      }
    }
    context.endUpdate();
  }

  return {
    "file": function(env, context, param) {
      var fileCache = {};
      return function(cmd) {
        var cwd = env.cwd();
        if (fileCache[cwd] === undefined) {
          fs.readdir(cwd, function(err, files) {
            if (files) {
              fileCache[cwd] = files;
              update(files, cmd.args[cmd.current], context);
            }
          });
        } else {
          update(fileCache[cwd], cmd.args[cmd.current], context);
        }
      };
    }
  };
})();
