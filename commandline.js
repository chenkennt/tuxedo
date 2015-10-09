module.exports = {
  parse: function(cmd, index) {
    var currentArg;
    var args = [];
    var argsmap = [];
    var quote = false;
    var curr = 0, start = 0;
    for (;curr < cmd.length; curr++) {
      switch (cmd[curr]) {
        case '"': quote = !quote; break;
        case ' ': if (!quote) {
          if (start != curr) {
            if (index >= start && index <= curr) currentArg = args.length;
            args.push(cmd.slice(start, curr));
            argsmap.push([start, curr]);
          }
          start = curr + 1;
        }
      }
    }
    if (start != curr) {
      if (index >= start && index <= curr) currentArg = args.length;
      args.push(cmd.slice(start, curr));
      argsmap.push([start, curr]);
    }
    var arg0 = "", argr = "";
    if (args.length > 0) {
      arg0 = args[0];
      argr = args.length == 2 ? args[1] : cmd.slice(arg0.length).trim();
    }
    return {
      raw: cmd,
      arg0: arg0,
      argr: argr,
      args: args,
      argsmap: argsmap,
      current: currentArg
    };
  }
};
