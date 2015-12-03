var graph = require('./graph');
var normalizeUri = require('./normalize-uri');
var async = require('async');


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

exports.equivalent = function(query, callback) {
	if (query.id) {
		graph.equivalent(normalizeUri(query.id).normalized, ['_'], function(err, ids) {
          if (err) {
            callback(err);
          } else {
            callback(err, ids);
            // graph.expand(ids, function(err, concepts) { callback(err, concepts); } );
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
		graph.orgsFromPerson(normalizeUri(query.id).normalized, ['tnl:related','tnl:member'], function(err, results) {
          if (err) {
            callback(err);
          } else {
            graph.expand(results["ids"], function(err, concepts) { 
              rel_types = results["types"];
              console.log("concepts:\n", concepts, concepts instanceof Array)
              concepts.forEach( function(element,idx) {
                element["relation_type"] = rel_types[idx];
              });
              callback(err, concepts ); 
            } );
          }
        });
  } else {
    callback('Please supply an `id`');
  }
};
  
exports.orgsFromPerson__z = function(query, callback) {
  	if (query.id) {
  		graph.orgsFromPerson(normalizeUri(query.id).normalized, ['tnl:related','tnl:member'], function(err, results) {
            if (err) {
              callback(err);
            } else {
              graph.expand(results["ids"], function(err, concepts) { 
                rel_types = results["types"];
                console.log("concepts:\n", concepts, concepts instanceof Array)
                concepts.forEach( function(element,idx) {
                  element["relation_type"] = rel_types[idx];
                });
                callback(err, concepts ); 
              } );
            }
          });
    } else {
      callback('Please supply an `id`');
    }  
};

exports.orgsFromPerson = function(query, callback) {
  var results;
  
  return async.waterfall( [
    getOrgsFromPerson,
    expandGraph
  ], done );
  
  function getOrgsFromPerson( cb ) {
    graph.orgsFromPerson( normalizeUri( query.id ).normalized, ['tnl:related','tnl:member'], cb );
  }
  
  function expandGraph( r, cb ) {
    results = r;
    graph.expand( results.ids, cb );
  }
  
  function done( err, concepts ) {
    rel_types = results.types;
    
    concepts.forEach( function( element, index ) {
      element.relation_type = rel_types[ index ];
    } );
    
    callback( null, concepts );
  }
};
