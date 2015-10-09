function initialize(element)
{
  var ui = require("./ui");
  var commandManager = require("./command_manager");
  var commandline = require("./commandline");
  var env = require("./environment");
  var autoComplete = require("./auto_complete");
  var screen = ui.create(element, onAutoComplete);
  screen.appendCommandPrompt(env.commandPrompt());

  function onAutoComplete() {
    // clear current arg
    var index = screen.cursor.index();
    var cmd = commandline.parse(screen.cursor.text(), index);
    if (cmd.current !== undefined) {
      screen.cursor.backspace(index - cmd.argsmap[cmd.current][0]);
      screen.cursor.del(cmd.argsmap[cmd.current][1] - index);
    }
    // insert hint
    var focused = screen.autoCompleteWindow.focused();
    if (focused) screen.cursor.insert(focused);
    screen.autoCompleteWindow.hide();
  }

  screen.keydown(function(c) {
    switch (c) {
      case 9: // tab
        if (!screen.autoCompleteWindow.visible()) {
          screen.autoCompleteWindow.clear();
          autoComplete.getHint(env, screen.cursor.text(), screen.cursor.index(), function(item, focus) {
            screen.autoCompleteWindow.add(item, focus, onAutoComplete);
          });
          screen.autoCompleteWindow.show();
        }
        break;
      case 27: // esc
        if (screen.autoCompleteWindow.visible()) {
          screen.autoCompleteWindow.hide();
        } else {
          screen.cursor.clear();
        }
        break;
      case 8: // backspace
        screen.cursor.backspace();
        break;
      case 46: // delete
        screen.cursor.del();
        break;
      case 37: // left arrow
        screen.cursor.left();
        break;
      case 39: // right arrow
        screen.cursor.right();
        break;
      case 36: // home
        screen.cursor.home();
        break;
      case 35: // end
        screen.cursor.end();
        break;
      case 38: // up
        if (screen.autoCompleteWindow.visible()) screen.autoCompleteWindow.focusPrev();
        break;
      case 40: // down
        if (screen.autoCompleteWindow.visible()) screen.autoCompleteWindow.focusNext();
        break;
    }
    screen.scrollToBottom();
  });
  screen.keypress(function(c) {
    if (c == 13) {
      if (screen.autoCompleteWindow.visible()) {
        // auto complete
        onAutoComplete();
      } else {
        // execute command
        var output = screen.appendOutput();
        var text = screen.cursor.text();
        screen.cursor.detach();
        commandManager.exec(text, env, output, function() {
          screen.appendCommandPrompt(env.commandPrompt());
          screen.scrollToBottom();
        });
      }
    } else {
      screen.cursor.insert(String.fromCharCode(c));
      screen.scrollToBottom();
    }
  });
}
