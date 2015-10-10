module.exports = (function() {
  function div() {
    return $("<div></div>");
  }

  function span() {
    return $("<span></span>");
  }

  function initializeCursor(cursor) {
    var caret = div().addClass("tuxedo_caret");
    cursor.empty().append(caret).addClass("tuxedo_cursor");
    var input = null;
    // animate cursor
    setInterval(function() {
      caret.toggleClass("invisible");
    }, 500);

    function detach() {
      if (input !== null) {
        input.find("span").unbind("click");
        cursor.detach();
        input = null;
      }
    }

    return {
      attach: function(element) {
        detach();
        // attach will create an input div that wraps the cursor
        input = div().addClass("tuxedo_input").append(cursor);
        element.append(input);
      },
      detach: detach,
      insert: function(text) {
        for (var i = 0; i < text.length; i++) {
          span().text(text.charAt(i)).click(function(e) {
            cursor.detach().insertBefore(this);
            e.stopPropagation();
          }).insertBefore(cursor);
        }
      },
      backspace: function(count) {
        for (var i = 0; i < (count || 1); i++) {
          var prev = cursor.prev();
          if (prev.length > 0) prev.remove();
        }
      },
      del: function(count) {
        for (var i = 0; i < (count || 1); i++) {
          var next = cursor.next();
          if (next.length > 0) next.remove();
        }
      },
      left: function() {
        var prev = cursor.prev();
        if (prev.length > 0) cursor.detach().insertBefore(prev);
      },
      right: function() {
        var next = cursor.next();
        if (next.length > 0) cursor.detach().insertAfter(next);
      },
      home: function() {
        var first = cursor.siblings().first();
        if (first.length > 0) cursor.detach().insertBefore(first);
      },
      end: function() {
        var last = cursor.siblings().last();
        if (last.length > 0) cursor.detach().insertAfter(last);
      },
      text: function() {
        return cursor.siblings().text();
      },
      clear: function() {
        cursor.siblings().remove();
      },
      index: function() {
        return cursor.prevAll().length;
      }
    };
  }

  function createAutoCompleteWindow(cursor, click) {
    var autoCompleteWindow = div().addClass("tuxedo_auto_complete invisible");
    var clickCallback = click;
    cursor.append(autoCompleteWindow);
    var focused = null;
    var pendingShow = false;

    function ensureVisible() {
      if (focused === null) return;
      var top = focused.position().top;
      var bottom = top + focused.height();
      var height = focused.parent().height();
      if (top < 0) focused.parent().scrollTop(focused.parent().scrollTop() + top);
      if (bottom > height) focused.parent().scrollTop(focused.parent().scrollTop() + bottom - height);
    }

    function focus(item) {
      if (focused !== null) focused.removeClass("tuxedo_auto_complete_item_focused");
      focused = item.addClass("tuxedo_auto_complete_item_focused");
      ensureVisible();
    }

    function itemClicked(e) {
      focus($(this));
      if (clickCallback !== undefined) clickCallback();
    }

    return {
      show: function() {
        // if there is no item in the list, delay showing window until there're at least two items in the window.
        if (autoCompleteWindow.children().length > 0) {
          autoCompleteWindow.css("top", cursor.parent().height());
          autoCompleteWindow.removeClass("invisible");
          pendingShow = false;
        } else {
          pendingShow = true;
        }
      },
      hide: function() {
        autoCompleteWindow.addClass("invisible");
        pendingShow = false;
      },
      visible: function() {
        return !autoCompleteWindow.hasClass("invisible");
      },
      active: function() {
        return this.visible() || pendingShow;
      },
      beginUpdate: function() {
        autoCompleteWindow.children().attr("unvisited", "1");
      },
      endUpdate: function() {
        if (autoCompleteWindow.children().length > 0 && focused === null) focus(autoCompleteWindow.children().first());
        autoCompleteWindow.children("[unvisited]").remove();
        // if nothing is focused, focus the first item
        if (pendingShow && autoCompleteWindow.children().length == 1 && clickCallback !== undefined) clickCallback();
        pendingShow = false;
      },
      update: function(text, isFocus, order) {
        var curr = autoCompleteWindow.children().first();
        while (curr.length > 0 && curr.text() < text) curr = curr.next();
        var item;
        if (curr.text() == text) item = curr;
        else {
          item = div().attr("title", text).addClass("tuxedo_auto_complete_item").text(text).click(itemClicked);
          if (curr.length == 0) autoCompleteWindow.append(item);
          else item.insertBefore(curr);
        }
        item.attr("unvisited", null);
        if (isFocus) focus(item);
        // for pending show, only show the window when there're at least two items (single item can be immediately inserted without popping up the window)
        if (pendingShow && autoCompleteWindow.children().length == 2) {
          this.show();
          pendingShow = false;
        }
      },
      focused: function() {
        if (focused !== null) return focused.text();
      },
      focusPrev: function() {
        var prev = null;
        if (focused !== null) prev = focused.prev();
        if (prev === null || prev.length == 0) prev = autoCompleteWindow.children().last();
        if (prev.length > 0) focus(prev);
      },
      focusNext: function() {
        var next = null;
        if (focused !== null) next = focused.next();
        if (next === null || next.length == 0) next = autoCompleteWindow.children().first();
        if (next.length > 0) focus(next);
      },
      clear: function() {
        autoCompleteWindow.empty();
        focused = null;
      }
    }
  }

  function createScreen(element, onAutoComplete) {
    var screenBuffer = div().addClass("tuxedo_buffer");
    var screenWindow = $(element).addClass("tuxedo_console").empty().append(screenBuffer);
    var cursor = div();
    var keypressCallback = null;
    var keydownCallback = null;
    // setup keyboard event hook
    screenWindow.keypress(function(e) {
      if (keypressCallback !== null) keypressCallback(e.keyCode);
    }).keydown(function(e) {
      if (keydownCallback !== null) keydownCallback(e.keyCode);
      switch (e.keyCode) {
        // for up, down, home, end, page up, page down, prevent default behavior (scroll)
        case 33: // page up
        case 34: // page down
        case 36: // home
        case 35: // end
        case 38: // up
        case 40: // down
        // for tab, also prevent default behavior (switch focus)
        case 9:  // tab
          e.preventDefault();
          break;
      }
    });

    return {
      cursor: initializeCursor(cursor),
      autoCompleteWindow: createAutoCompleteWindow(cursor, onAutoComplete),
      append: function(frame) {
        screenBuffer.append(frame);
      },
      scrollToBottom: function() {
        screenWindow.scrollTop(screenBuffer.height());
      },
      clear: function() {
        screenBuffer.empty();
      },
      keypress: function(callback) {
        keypressCallback = callback;
      },
      keydown: function(callback) {
        keydownCallback = callback;
      },
      appendCommandPrompt: function(promptText) {
        var frame = div().append(span().text(promptText));
        this.cursor.attach(frame);
        screenBuffer.append(frame);
      },
      appendOutput: function() {
        var next = $("<span title='next' class='glyphicon glyphicon-repeat tuxedo_output_toolbar_button' aria-hidden='true'></span>");
        var copy = $("<span title='copy' class='glyphicon glyphicon-copy tuxedo_output_toolbar_button' aria-hidden='true'></span>");
        var buttons = div().addClass("tuxedo_output_toolbar_buttons").append(next).append(copy);
        var toolbar = div().addClass("tuxedo_output_toolbar").append(buttons);
        var frame = div();
        var active = null;
        next.click(function(e) {
          if (active !== null) {
            var newTab = active.next();
            if (newTab.length == 0) newTab = active.siblings().first();
            if (newTab.length > 0) {
              active.addClass("invisible");
              active = newTab;
              active.removeClass("invisible");
            }
          }
        });
        screenBuffer.append(div().addClass("tuxedo_output").append(frame).append(toolbar));
        var that = this;
        return {
          createTab: function() {
            var tab = div();
            frame.append(tab);
            // hide previous active and make this one active
            if (active !== null) active.addClass("invisible");
            active = tab;
            return {
              append: function(control) {
                tab.append(control);
              },
              flush: function() {
                that.scrollToBottom();
              }
            }
          }
        };
      }
    };
  }

  return {
    create: createScreen
  };
})();
