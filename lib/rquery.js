var graph = require('./graph');
var normalizeUri = require('./normalize-uri');
var async = require('async');
var fs = require('fs');
var consolidate = require('./consolidate');

/**
 * Wraps relations in an extra array as if they were concepts
 * to ensure backwards compatibility for deprecated endpoints
 * @param  {Array} relations Array of relation data
 * @return {Array}           Array of wrapped relation data
 */
function deprecatedRelations(relations) {
  return relations.map(function (relation) {
    return [relation];
  });
}

exports.peopleFromOrgsFromPerson = function (query, callback) {
  var organizations = query.type || ['tnl:Organization', 'tnl:Public', 'tnl:PoliticalParty', 'tnl:Commercial', 'tnl:NonProfit'];
  var relations = ['tnl:related', 'tnl:member', 'tnl:boardmember', 'tnl:advisor', 'tnl:commissioner', 'tnl:employee', 'tnl:lobbyist', 'tnl:spokesperson'];

  if (query.id) {
    graph.peopleFromOrgsFromPerson(normalizeUri(query.id).normalized, relations, organizations, query.concurrent, function (err, results) {
      if (err) {
        callback(err);
      } else {
        graph.expand(results.map(function (result) { return result.id; }), function (err, concepts) {
          callback(err, deprecatedRelations(consolidate(concepts, results)));
        });
      }
    });
  } else {
    callback('Please supply an `id`');
  }
};


exports.shortestPath = function (query, callback) {
  if (query.id && query['related.id']) {
    var relations;

    return async.waterfall([
      getShortestPath,
      expandGraph
    ], done);

    function getShortestPath(cb) {
      graph.shortestPath(normalizeUri(query.id).normalized, normalizeUri(query['related.id']).normalized, cb);
    }

    function expandGraph(result, cb) {
      console.log(result);
      relations = result.relations;
      graph.expand(result.ids, cb);
    }

    function done(err, concepts) {
      callback(err, consolidate(concepts, relations));
    }

    // graph.shortestPath(normalizeUri(query.id).normalized, normalizeUri(query['related.id']).normalized, function (err, ids) {
    //   if (err) {
    //     callback(err);
    //   } else {
    //     graph.expand(ids, callback);
    //   }
    // });
  } else {
    callback('Please supply a `id` and `related.id`');
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
    graph.expand(results.map(function (result) { return result.id; }), cb);
  }

  function done(err, concepts) {
    callback(err, deprecatedRelations(consolidate(concepts, results)));
  }
};

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
    graph.expand(results.map(function (result) { return result.id; }), cb);
  }

  function done(err, concepts) {
    callback(err, deprecatedRelations(consolidate(concepts, results)));
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
    graph.expand(results.map(function (result) { return result.id; }), cb);
  }

  function done(err, concepts) {
    callback(err, consolidate(concepts, results));
  }
};
