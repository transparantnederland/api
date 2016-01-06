var graph = require('./graph');
var normalizeUri = require('./normalize-uri');
var async = require('async');
var fs = require('fs');
// http://localhost:3001/peopleFromOrgsFromPerson?id=dbpedia_sg/V1Y4VAZZtj8x
// http://localhost:3001/peopleFromOrgsFromPerson?id=nevenfuncties/E1ShlRdWS2ze

// https://api.transparantnederland.nl/peopleFromOrgsFromPerson?id=http://nl.dbpedia.org/resource/Rita_Verdonk

exports.peopleFromOrgsFromPerson = function(query, callback) {
  var organizations = query.type || ["tnl:Organization","tnl:Public","tnl:PoliticalParty","tnl:Commercial","tnl:NonProfit"];
  var relations = ['tnl:related','tnl:member','tnl:boardmember','tnl:advisor','tnl:commissioner','tnl:employee','tnl:lobbyist'];
  
	if (query.id) {
		graph.peopleFromOrgsFromPerson(normalizeUri(query.id).normalized, relations, organizations, function(err, results) {
          if (err) {
            callback(err);
          } else {
            
            console.log("total results: " + results.ids.length)
            
            graph.expand(results.ids, function(err, concepts) {
              var idx = 0;
              rel_types = results.types;
              rel_orgs = results.orgs;
              
              // fs.writeFile("concepts.json", JSON.stringify(concepts))
              // fs.writeFile("rel_types.json", JSON.stringify(rel_types))
              // fs.writeFile("rel_orgs.json", JSON.stringify(rel_orgs))
              // concepts.forEach( function( element ) {
              //   element.forEach( function( e ) {
              //     idx += 1;
              //   } );
              // } );
              
              // console.log("total pits: " + idx)
             //  console.log("total rel_types: " + rel_types.length)
             //  console.log("total rel_orgs: " + rel_orgs.length)
              
              // idx = 0;
              
              concepts.forEach( function( element ) {
                element.forEach( function( e ) {
                  delete e.hairs
                  delete e.relations
                  idx = results.ids.indexOf(e.pit.id)
                  e.relation_type = rel_types[ idx ];
                  e.relation_org = rel_orgs[ idx ];
                  idx += 1;
                } );
              } );

              callback(err, concepts); 
            } );
          }
        });
  } else {
    callback('Please supply an `id`');
  }
};


exports.shortestPath = function(query, callback) {
	if (query.id) {
		graph.equivalentIDs(normalizeUri(query.id).normalized, ['_'], function(err, ids) {
          if (err) {
            callback(err);
          } else {
            callback(err, ids);
          }
        });
  } else {
    callback('Please supply an `id`');
  }
};


exports.equivalentIDs = function(query, callback) {
	if (query.id) {
		graph.equivalentIDs(normalizeUri(query.id).normalized, ['_'], function(err, ids) {
          if (err) {
            callback(err);
          } else {
            callback(err, ids);
          }
        });
  } else {
    callback('Please supply an `id`');
  }
};



// http://localhost:3001/equivalentNodes?id=shops/bert-bankras
exports.equivalentNodes = function(query, callback) {
	if (query.id) {
    ids = [normalizeUri(query.id).normalized]
    graph.expand(ids, function(err, concepts) {
      callback(err, concepts);
    } );
  } else {
    callback('Please supply an `id`');
  }
};




exports.peopleFromOrg = function(query, callback) {
  var results;
  var relations = ['tnl:related','tnl:member','tnl:boardmember','tnl:advisor','tnl:commissioner','tnl:employee','tnl:lobbyist'];
  
  return async.waterfall( [
    getpeopleFromOrg,
    expandGraph
  ], done );
  
  function getpeopleFromOrg( cb ) {
    graph.peopleFromOrg( normalizeUri( query.id ).normalized, relations, cb );
  }
  
  function expandGraph( r, cb ) {
    results = r;
    graph.expand( r.ids, cb );
  }
  
  function done( err, concepts ) {
    var idx = 0;
    rel_types = results.types;
    concepts.forEach( function( element ) {
      element.forEach( function( e ) {
        delete e.hairs
        delete e.relations
        idx = results.ids.indexOf(e.pit.id)
        e.relation_type = rel_types[ idx ];
      } );
    } );
    
    callback( null, concepts );
  }

};


// http://localhost:3001/orgsFromPerson?id=urn:hgid:dbpedia_sg/4y9XLJGcPHg
exports.orgsFromPerson = function(query, callback) {
  var results;
  var organizations = query.type || ["tnl:Organization","tnl:Public","tnl:PoliticalParty","tnl:Commercial","tnl:NonProfit"];
  var relations = ['tnl:related','tnl:member','tnl:boardmember','tnl:advisor','tnl:commissioner','tnl:employee','tnl:lobbyist'];
  
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
    var idx = 0;
    rel_types = results.types;
    if(concepts) {
      concepts.forEach( function( element ) {
        element.forEach( function( e ) {
          delete e.hairs
          delete e.relations
          idx = results.ids.indexOf(e.pit.id)
          e.relation_type = rel_types[ idx ];
        } );
      } );
    }
    callback( null, concepts );
  }
};
