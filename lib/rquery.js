var graph = require('./graph');
var normalizeUri = require('./normalize-uri');


// localhost:3001/peopleFromOrgsFromPerson?id=overheidsorganisaties/124740
exports.peopleFromOrgsFromPerson = function(query, callback) {
	if (query.id) {
		graph.peopleFromOrgsFromPerson(normalizeUri(query.id).normalized, ['tnl:related','tnl:member'], function(err, ids) {
          if (err) {
            callback(err);
          } else {
            graph.expand(ids, function(err, concepts) { callback(err, concepts); } );
          }
        });
  } else {
    callback('Please supply an `id`');
  }
};


exports.peopleFromOrg = function(query, callback) {
	if (query.id) {
		graph.peopleFromOrg(normalizeUri(query.id).normalized, ['tnl:related','tnl:member'], function(err, ids) {
          if (err) {
            callback(err);
          } else {
            graph.expand(ids, function(err, concepts) { callback(err, concepts); } );
          }
        });
  } else {
    callback('Please supply an `id`');
  }
};

exports.orgsFromPerson = function(query, callback) {
	if (query.id) {
		graph.orgsFromPerson(normalizeUri(query.id).normalized, ['tnl:related','tnl:member'], function(err, ids) {
          if (err) {
            callback(err);
          } else {
            graph.expand(ids, function(err, concepts) { callback(err, concepts); } );
          }
        });
  } else {
    callback('Please supply an `id`');
  }
};
