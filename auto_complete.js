module.exports = (function() {
  var fs = require("fs");
  var yaml = require("js-yaml");
  var providers = require("./plugins/providers");
  var commandline = require("./commandline");
  function filterInput(input, filter, caseSensitive) {
    // return match level:
    // 0: do not match
    // 1: file contains filter
    // 2: file starts with filter
    if (filter === undefined) return 1;
    if (!caseSensitive) {
      input = input.toLowerCase();
      filter = filter.toLowerCase();
    }
    if (input.slice(0, filter.length) == filter) return 2;
    if (input.indexOf(filter) >= 0) return 1;
    return 0;
  }

  function update(list, filter, context, caseSensitive) {
    var matched = false;
    context.beginUpdate();
    list.forEach(function(item) {
      switch (filterInput(item, filter, caseSensitive)) {
        case 1:
          context.update(item);
          break;
        case 2:
          context.update(item, !matched);
          matched = true;
          break;
      }
    });
    context.endUpdate();
  }

  var currentUpdaters = null;
  var completes = {};
  var complete = yaml.safeLoad(fs.readFileSync("plugins/auto_complete.yml"));
  if (typeof complete.name === "string" && Array.isArray(complete.auto_completes)) {
    completes[complete.name] = complete.auto_completes.filter(function(c) {
      return typeof c.prefix === "object" && typeof c.prefix.regex === "string" && c.prefix.regex !== "";
    }).map(function(c) {
      var provider = Array.isArray(c.values) ? function(env, context, param) {
        return function(cmd) {
          update(c.values, cmd.args[cmd.current], context, c.case_sensitive);
        };
      } : providers[c.provider];
      return {
        prefix: new RegExp(c.prefix.regex + "$", c.prefix.case_sensitive ? "" : "i"),
        provider: provider
      };
    });
    var pos = complete.name.lastIndexOf(".");
    if (pos > 0) completes[complete.name.slice(0, pos)] = completes[complete.name];
  }

  function getProviders(cmd) {
    var complete = completes[cmd.arg0];
    var prefix = cmd.args.slice(1, cmd.current).join(" ");
    if (complete) {
      return complete.filter(function(c) {
        return c.prefix.test(prefix);
      }).map(function(c) {
        return c.provider;
      });
    }
  }

  return {
    init: function(cmd, env, context) {
      var currentProviders = getProviders(cmd);
      if (!currentProviders || currentProviders.length == 0) currentProviders = [providers.file];
      currentUpdaters = currentProviders.map(function(p) {
        return p(env, context, update);
      });
    },
    update: function(cmd, index) {
      if (currentUpdaters !== null) {
        var parsed = commandline.parse(cmd, index);
        currentUpdaters.forEach(function(u) {
          u(parsed);
        });
      }
    }
  };
})();
