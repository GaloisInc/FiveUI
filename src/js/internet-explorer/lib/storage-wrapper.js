/*globals _fiveui_store */

(function() {
  function StorageWrapper() {}

  jQuery.extend(StorageWrapper.prototype, {
    key: function(idx) { return _fiveui_store.key(idx); },
    getItem: function(key) { return _fiveui_store.getItem(key); },
    setItem: function(key, val) { _fiveui_store.setItem(key, val); },
    removeItem: function(key) { _fiveui_store.removeItem(key); },
    clear: function() { _fiveui_store.clear(); },
  });

  Object.defineProperty(StorageWrapper.prototype, 'length', {
    get: function() {
      return _fiveui_store.size();
    },
    enumerable: false
  });

  exports.StorageWrapper = StorageWrapper;
}());
