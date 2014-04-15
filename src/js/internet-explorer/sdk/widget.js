/*globals _fiveui_port */

(function() {
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

  function showReport(opts) {
    // TODO:
    // var onClick = opts.onClick;
    // if (onClick) {
    //   _fiveui_port.on('toolbarButtonClick', function() {
    //     if (opts.onClick) {
    //       opts.onClick();
    //     }
    //   });
    // }
  }

  function showOptions(opts, port) {
    _fiveui_port.on('toolbarButtonClick', function() {
      port.emit('showOptions');
    });
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
}());
