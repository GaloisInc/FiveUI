/*globals _fiveui_port, _fiveui_top */

(function($) {
  exports.Widget = Widget;

  function Widget(opts) {
    var port = mkPort();
    // Top-level windows only
    if (parent === parent.parent) {
      switch (opts.id) {
        case 'FiveUI-Icon':    showReport(opts, port);  break;
        case 'FiveUI-Options': showOptions(opts, port); break;
      }
    }
    return {
      port: port
    };
  }

  function showReport(opts, port) {
    var onClick = opts.onClick;
    var button  = _fiveui_top._fiveui_button;
    if (!button) {
      button = fiveUIButton(_fiveui_top.document);
      _fiveui_top._fiveui_button = button;
    }

    button.on('click', function(event) {
      event.preventDefault();
      if (onClick) { onClick(); }
    });

    port.on('setDisabled', function() {
      button.hide();
    });

    port.on('setEnabled', function(problems) {
      if (problems && problems > 0) {
        button.text(problems);
        button.show();
      }
      else {
        button.hide();
      }
    });
  }

  function showOptions(opts, port) {
    _fiveui_port.on('toolbarButtonClick', function() {
      port.emit('showOptions');
    });
  }

  function fiveUIButton(doc) {
    var button = $('<div></div>', doc);
    button.text('0');
    button.css({
      'position':         'fixed',
      'right':            '15px',
      'bottom':           '15px',
      'padding':          '0.2em',
      'opacity':          '0.8',
      'background-color': 'white',
      'color':            'red',
      'font-size':        '18pt',
      'font-weight':      'bold',
      'border':           '2px solid red',
      'cursor':           'pointer'
    });
    button.hide();
    button.appendTo(doc.body);
    return button;
  }

  function mkPort(/* flags... */) {
    var flags = arguments;
    var listeners = {};
    return {
      on: function on(eventType, fn) {
        var callbacks = listeners[eventType] || $.Callbacks.apply($, flags);
        callbacks.add(fn);
        listeners[eventType] = callbacks;
      },
      emit: function emit(eventType, data) {
        var callbacks = listeners[eventType];
        if (callbacks) {
          callbacks.fire(data);
        }
      }
    };
  }
}(jQuery));
