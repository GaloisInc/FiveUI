
(function() {

/**
 * Create a new Url Pattern to map urls to Rule Sets.
 *
 * @constructor
 * @param {!number} id New id for this UrlPat.
 * @param {!string} regex The pattern that is used to match Urls.
 * @param {!number} rule_id Unique id of the RuleSet to use for matching URLs.
 */
fiveui.UrlPat = function(id, regex, rule_id) {
  this.id = id;
  this.regex = regex;
  this.rule_id = rule_id;
};

/**
 * Create a Url Pattern from a JSON object.
 *
 * @param {!number} id The id to use for the restored object.
 * @param {!Object} obj The object to take settings from.
 * @return {!fiveui.UrlPat} A populated UrlPat object.
 */
fiveui.UrlPat.fromJSON = function(id, obj) {
  return new fiveui.UrlPat(id, obj.regex, obj.rule_id);
};

/**
 * Create a regular expression from a globbed pattern.
 *
 * @param {!string} str The globbed url.
 * @return {!RegExp} A compiled regular expression.
 */
fiveui.UrlPat.compile = function(str) {
  var regex = str.replace(/\./g, '\.')
                 .replace(/\*/g, '.*');
  return new RegExp(regex);
};

/**
 * Test a string Url against the regular expression held in a Url Pattern.
 *
 * @param {!string} url The Url the string to test.
 * @return {!boolean} If the Url matched the regular expression.
 */
fiveui.UrlPat.prototype.match = function(url) {
  var pat = fiveui.UrlPat.compile(this.regex);
  return pat.test(url);
};



fiveui.UrlPatModel = Backbone.Model.extend({

  defaults: {
    id:       null,
    regex:    '',
    rule_id:  null,
  },

  sync:function(method, model, options) {
    _.defaults(options, {
      success:function() {},
      error:function() {}
    });

    var msg = model.url;
    var id  = model.get('id');

    switch(method) {
      case 'read':
        msg.send('getUrlPat', id, function(pat) {
          model.set(pat);
          options.success();
        });
        break;

      case 'update':
        msg.send('updateUrlPat', _.clone(model.attributes), options.success);
        break;

      case 'create':
        msg.send('addUrlPat', _.clone(model.attributes), options.success);
        break;

      case 'delete':
        msg.send('remUrlPat', id, function(res) {
          if(res) {
            options.success({});
          } else {
            options.error({});
          }
        });
        break;
    }
  }

}, {

  fromUrlPat: function(pat, msg) {
    return new fiveui.UrlPatModel({
      id:      pat.id,
      regex:   pat.regex,
      rule_id: pat.rule_id
    }, { url : msg });
  }

});


fiveui.UrlPats = Backbone.Collection.extend({

  model: fiveui.UrlPatModel,

  sync:function(method, collection, options) {

    _.defaults(options, {
      success:function() {},
      error:function() {}
    });

    var msg = this.url;

    switch(method) {

      case 'read':
        msg.send('getUrlPats', null, function(pats) {
          options.success(_.map(pats, function(pat) {
            return fiveui.UrlPatModel.fromUrlPat(pat, msg);
          }));
        });
        break;
    }

  }

});

})();
