module.exports = (function() {
  var marked = require("marked");
  return {
    "markdown": function(context, tab) {
      var content = $("<div class='tuxedo_text'></div>");
      tab.append(content);
      var text = "";
      context.on("out", function(data) {
        text += data;
      });
      context.on("close", function(data) {
        content.html(marked(text));
        tab.flush();
      });
    },
    "text": function(context, tab) {
      context.on("out", function(data) {
        tab.append($("<span></span>").text(data));
        tab.flush();
      });
      context.on("error", function(data) {
        tab.append($("<span></span>").text(data));
        tab.flush();
      });
    }
  };
})();
