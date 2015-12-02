var fs = require('fs');
var path = require('path');
var config = require('histograph-config');
var request = require('request');
var neo4j = require('neo4j');

if (config.neo4j.user && config.neo4j.password) {
  var neo4jUrl = 'http://' + config.neo4j.user + ':' + config.neo4j.password + '@' +
    config.neo4j.host + ':' + config.neo4j.port;
} else {
  var neo4jUrl = 'http://' + config.neo4j.host + ':' + config.neo4j.port;
}

var graphDb = new neo4j.GraphDatabase(neo4jUrl);

var shortestPathQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'shortest-path.cypher'), {encoding: 'utf8'});
var relatedQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'related.cypher'), {encoding: 'utf8'});

var peopleFromOrgsFromPersonQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'peopleFromOrgsFromPerson.cypher'), {encoding: 'utf8'});
var orgsFromPersonQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'orgsFromPerson.cypher'), {encoding: 'utf8'});
var peopleFromOrgQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'peopleFromOrg.cypher'), {encoding: 'utf8'});
var equivalentQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'equivalent.cypher'), {encoding: 'utf8'});

function replaceRelations(query, relations) {
  return query.replace(/«relations»/g, relations.map(function(relation) {
    return '`' + relation + '`';
  }).join('|'));
}

function sanitize(body) {
  var ret = [];
  for (var i in body) {
    ret.push( body[i][0]["pit"] )
  }
  return ret;
}

exports.shortestPath = function(idsFrom, idsTo, relations, callback) {
  var query = replaceRelations(shortestPathQuery, relations);
  graphDb.cypher({
    query: query,
    params: {
      idsFrom: idsFrom,
      idsTo: idsTo
    }
  }, function(err, results) {
    var ids;
    if (results) {
      ids = results.map(function(result) {
        return result.id;
      });
    }
    callback(err, ids);
  });
};


// http://localhost:3001/equivalence?id=urn:hgid:overheidsorganisaties/2517
exports.equivalent = function(id, relations, callback) {
  var query = replaceRelations(equivalentQuery, relations);
  graphDb.cypher({
    query: query,
    params: {
      id: id
    }
  }, function(err, results) {
    var ids;
    if (results) {
        ids = results.map(function(result) {
          return result.ids;
        });
    }
    callback(err, ids);
  });
};


// http://localhost:3001/peopleFromOrg?id=nevenfuncties/Ny0H0O-BhGe
exports.peopleFromOrg = function(id, relations, callback) {
  var query = replaceRelations(peopleFromOrgQuery, relations);
  graphDb.cypher({
    query: query,
    params: {
      id: id
    }
  }, function(err, results) {
    var ids;
    if (results) {
      ids = results.map(function(result) {
		  return result.people.properties.id;
      });
    }
    callback(err, ids);
  });
};


// http://localhost:3001/orgsFromPerson?id=nevenfuncties/NyXL7RdbH2ze
exports.orgsFromPerson = function(id, relations, callback) {
  var query = replaceRelations(orgsFromPersonQuery, relations);
  graphDb.cypher({
    query: query,
    params: {
      id: id
    }
  }, function(err, results) {
    var ids;
    if (results) {
      ids = results.map(function(result) {
		  return result.orgs.properties.id;
      });
    }
    callback(err, ids);
  });
};


exports.peopleFromOrgsFromPerson = function(id, relations, callback) {
  var query = replaceRelations(peopleFromOrgsFromPersonQuery, relations);
  graphDb.cypher({
    query: query,
    params: {
      id: id
    }
  }, function(err, results) {
    var ids;
    if (results) {
      ids = results.map(function(result) {
		  return result.people.properties.id;
      });
    }
    callback(err, ids);
  });
};



exports.related = function(ids, relations, direction, callback) {
  var query = replaceRelations(relatedQuery, relations);

  if (direction === 'from') {
    query = query.replace('«directionFrom»', '-').replace('«directionTo»', '->');
  } else if (direction === 'to') {
    query = query.replace('«directionFrom»', '<-').replace('«directionTo»', '-');
  }
  
  graphDb.cypher({
    query: query,
    params: {
      ids: ids
    }
  }, function(err, results) {
    var ids;
    if (results) {
      ids = results.map(function(result) {
        return result.id;
      });
    }
    callback(err, ids);
  });
};

exports.expand = function(ids, callback) {
  var reqOptions = {
    uri: neo4jUrl + '/histograph/expand',
    method: 'POST',
    json: {
      ids: ids,
      equivalence: config.schemas.equivalence,
      hairs: config.api.hairRelations
    }
  };

  request(reqOptions, function(error, response) {
    if (!error && response.statusCode == 200) {
      try {
        callback(null, sanitize(response.body));
      } catch (e) {
        callback({
          message: 'Neo4j plugin returned incorrect JSON data'
        });
      }
    } else {
      callback(error);
    }
  });

};
