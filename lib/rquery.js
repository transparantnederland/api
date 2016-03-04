var graph = require('./graph');
var normalizeUri = require('./normalize-uri');
var async = require('async');
var fs = require('fs');
var consolidate = require('./consolidate');

// http://localhost:3001/peopleFromOrgsFromPerson?id=dbpedia_sg/V1Y4VAZZtj8x
// http://localhost:3001/peopleFromOrgsFromPerson?id=nevenfuncties/E1ShlRdWS2ze

// https://api.transparantnederland.nl/peopleFromOrgsFromPerson?id=http://nl.dbpedia.org/resource/Rita_Verdonk

exports.peopleFromOrgsFromPerson = function (query, callback) {
  var organizations = query.type || ['tnl:Organization', 'tnl:Public', 'tnl:PoliticalParty', 'tnl:Commercial', 'tnl:NonProfit'];
  var relations = ['tnl:related', 'tnl:member', 'tnl:boardmember', 'tnl:advisor', 'tnl:commissioner', 'tnl:employee', 'tnl:lobbyist', 'tnl:spokesperson'];

  // console.log(JSON.stringify(query));

  if (query.id) {
    graph.peopleFromOrgsFromPerson(normalizeUri(query.id).normalized, relations, organizations, query.concurrent, function (err, results) {
      if (err) {
        callback(err);
      } else {
        graph.expand(results.ids, function (err, concepts) {
          callback(err, consolidate(concepts, results));
        });
      }
    });
  } else {
    callback('Please supply an `id`');
  }
};


exports.shortestPath = function (query, callback) {
  if (query.id) {
    graph.equivalentIDs(normalizeUri(query.id).normalized, ['_'], function (err, ids) {
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


exports.equivalentIDs = function (query, callback) {
  if (query.id) {
    graph.equivalentIDs(normalizeUri(query.id).normalized, ['_'], function (err, ids) {
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
exports.equivalentNodes = function (query, callback) {
  if (query.id) {
    ids = [normalizeUri(query.id).normalized];
    graph.expand(ids, function (err, concepts) {
      callback(err, concepts);
    });
  } else {
    callback('Please supply an `id`');
  }
};


exports.peopleFromOrg = function (query, callback) {
  var results;
  var relations = ['tnl:related', 'tnl:member', 'tnl:boardmember', 'tnl:advisor', 'tnl:commissioner', 'tnl:employee', 'tnl:lobbyist', 'tnl:spokesperson'];

  return async.waterfall([
    getpeopleFromOrg,
    expandGraph
  ], done);

  function getpeopleFromOrg(cb) {
    graph.peopleFromOrg(normalizeUri(query.id).normalized, relations, cb);
  }

  function expandGraph(r, cb) {
    results = r;
    graph.expand(r.ids, cb);
  }

  function done(err, concepts) {
    callback(err, consolidate(concepts, results));
  }
};


// http://localhost:3001/orgsFromPerson?id=urn:hgid:dbpedia_sg/4y9XLJGcPHg
exports.orgsFromPerson = function (query, callback) {
  var results;
  var organizations = query.type || ['tnl:Organization', 'tnl:Public', 'tnl:PoliticalParty', 'tnl:Commercial', 'tnl:NonProfit'];
  var relations = ['tnl:related', 'tnl:member', 'tnl:boardmember', 'tnl:advisor', 'tnl:commissioner', 'tnl:employee', 'tnl:lobbyist', 'tnl:spokesperson'];

  return async.waterfall([
    getOrgsFromPerson,
    expandGraph
  ], done);

  function getOrgsFromPerson(cb) {
    graph.orgsFromPerson(normalizeUri(query.id).normalized, relations, organizations, cb);
  }

  function expandGraph(r, cb) {
    results = r;
    graph.expand(results.ids, cb);
  }

  function done(err, concepts) {
    callback(err, consolidate(concepts, results));
  }
};

exports.relations = function (query, callback) {
  var results;

  return async.waterfall([
    getRelations,
    expandGraph
  ], done);

  function getRelations(cb) {
    graph.relations(normalizeUri(query.id).normalized, cb);
  }

  function expandGraph(r, cb) {
    results = r;
    graph.expand(results.ids, cb);
  }

  function done(err, concepts) {
    callback(err, consolidate(concepts, results));
  }
};
