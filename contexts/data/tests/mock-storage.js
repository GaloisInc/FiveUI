
var MockStorage = function() {
  this.store = {};
};

_.extend(MockStorage.prototype, {

  getItem: function(key) {
    return this.store[key];
  },

  setItem: function(key,value) {
    this.store[key] = value;
  },

  removeItem: function(key,value) {
    delete this.store[key];
  },

});
