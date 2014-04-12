/*globals _fiveui_port */

(function() {
  exports.Widget = Widget;

  function Widget(opts) {
    var port = mkPort();

    // Top-level windows only
    if (parent === parent.parent) {
      _fiveui_port.on('showOptions', function() {
        port.emit('showOptions');
      });
    }

    return {
      port: port
    };
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
