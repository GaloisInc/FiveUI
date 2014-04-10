

(function() {

Set = function() {
  this.elems = {};
};

_.extend(Set.prototype, {

  add: function(obj) {
    var hash = this._getHash(obj);
    if(this.elems[hash] == undefined) {
      this.elems[hash] = obj;
    }
  },

  remove: function(obj) {
    var hash = this._getHash(obj);
    if(this.elems[hash]) {
      delete this.elems[hash];
    }
  },

  member: function(obj) {
    var hash = this._getHash(obj);
    return !!this.elems[hash];
  },

  contains: function(obj) {
    return this.member(obj);
  },

  size: function () {
    return _.size(this.elems);
  },

  isEmpty: function() {
    return this.size() == 0;
  },

  each: function(k, cxt) {
    _.each(this.elems, k, cxt);
  },

  _getHash: function(obj) {
    var str = obj.toString();

    // the same hash function that java uses for String.hashCode
    return _.reduce(str, function(hash, c) {
      hash = ((hash << 5) - hash) + c.charCodeAt();
      return hash & hash;
    }, 0);
  }

});

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = Set;
  }
  exports.Set = Set;
}

})();
