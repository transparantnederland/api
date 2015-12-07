var graph = require('./graph');
var normalizeUri = require('./normalize-uri');
var async = require('async');


// localhost:3001/peopleFromOrgsFromPerson?id=overheidsorganisaties/124740
exports.peopleFromOrgsFromPerson = function(query, callback) {
  var relations = ['tnl:related','tnl:member'];
  var organizations = query.type || ["tnl:Organization","tnl:Public","tnl:PoliticalParty","tnl:Commercial","tnl:NonProfit"];
  
	if (query.id) {
		graph.peopleFromOrgsFromPerson(normalizeUri(query.id).normalized, relations, organizations, function(err, ids) {
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
  var results;
  var relations = ['tnl:related','tnl:member'];
  
  return async.waterfall( [
    getpeopleFromOrg,
    expandGraph
  ], done );
  
  function getpeopleFromOrg( cb ) {
    graph.peopleFromOrg( normalizeUri( query.id ).normalized, relations, cb );
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

exports.orgsFromPerson = function(query, callback) {
  var results;
  var organizations = query.type || ["tnl:Organization","tnl:Public","tnl:PoliticalParty","tnl:Commercial","tnl:NonProfit"];
  var relations = ['tnl:related','tnl:member'];
  
  return async.waterfall( [
    getOrgsFromPerson,
    expandGraph
  ], done );
  
  function getOrgsFromPerson( cb ) {
    graph.orgsFromPerson( normalizeUri( query.id ).normalized, relations,organizations, cb );
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
