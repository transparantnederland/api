var fs = require('fs');
var path = require('path');
var config = require('histograph-config');
var request = require('request');
var neo4j = require('neo4j');

var neo4jUrl;

if (config.neo4j.user && config.neo4j.password) {
  neo4jUrl = 'http://' + config.neo4j.user + ':' + config.neo4j.password + '@' + config.neo4j.host + ':' + config.neo4j.port;
} else {
  neo4jUrl = 'http://' + config.neo4j.host + ':' + config.neo4j.port;
}

var graphDb = new neo4j.GraphDatabase(neo4jUrl);

var shortestPathQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'shortest-path.cypher'), { encoding: 'utf8' });
var relatedQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'related.cypher'), { encoding: 'utf8' });

var peopleFromOrgsFromPersonQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'peopleFromOrgsFromPerson.cypher'), { encoding: 'utf8' });
var peopleFromOrgsFromPersonQueryCC = fs.readFileSync(path.join(__dirname, '..', 'queries', 'peopleFromOrgsFromPerson.concurrent.cypher'), { encoding: 'utf8' });
var orgsFromPersonQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'orgsFromPerson.cypher'), { encoding: 'utf8' });
var peopleFromOrgQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'peopleFromOrg.cypher'), { encoding: 'utf8' });
var equivalentIDsQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'equivalentIDs.cypher'), { encoding: 'utf8' });
var equivalentNodesQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'equivalentNodes.cypher'), { encoding: 'utf8' });

function replaceRelations(query, relations) {
  return query.replace(/«relations»/g, relations.map(function (relation) {
    return '`' + relation + '`';
  }).join('|'));
}


function replaceOrganizations(query, organizations) {
  return query.replace(/«organizations»/g, organizations.map(function (org) {
    return '"' + org + '"';
  }).join(','));
}

exports.shortestPath = function (idsFrom, idsTo, relations, callback) {
  var query = replaceRelations(shortestPathQuery, relations);
  graphDb.cypher({
    query: query,
    params: {
      idsFrom: idsFrom,
      idsTo: idsTo
    }
  }, function (err, results) {
    var ids;
    if (results) {
      ids = results.map(function (result) {
        return result.id;
      });
    }
    callback(err, ids);
  });
};


// http://localhost:3001/equivalence?id=urn:hgid:overheidsorganisaties/2517
exports.equivalentIDs = function (id, relations, callback) {
  var query = replaceRelations(equivalentIDsQuery, relations);
  graphDb.cypher({
    query: query,
    params: {
      id: id
    }
  }, function (err, results) {
    var ids;
    if (results) {
      ids = results.map(function (result) {
        return result.ids;
      });
    }
    callback(err, ids);
  });
};

exports.equivalentNodes = function (id, relations, callback) {
  var query = replaceRelations(equivalentNodesQuery, relations);
  graphDb.cypher({
    query: query,
    params: {
      id: id
    }
  }, function (err, results) {
    var ids;
    if (results) {
      ids = results.map(function (result) {
        return result.found.properties.id;
      });
    }
    callback(err, ids);
  });
};


// http://localhost:3001/peopleFromOrg?id=nevenfuncties/Ny0H0O-BhGe
exports.peopleFromOrg = function (id, relations, callback) {
  var query = replaceRelations(peopleFromOrgQuery, relations);
  graphDb.cypher({
    query: query,
    params: {
      id: id
    }
  }, function (err, results) {
    callback(err, (results || []).reduce(function (response, result) {
      response.ids.push(result.id);
      response.types.push(result.type);
      response.since.push(result.since);
      response.until.push(result.until);
      return response;
    }, {
      ids: [],
      types: [],
      since: [],
      until: []
    }));
  });
};


// http://localhost:3001/orgsFromPerson?id=nevenfuncties/NyXL7RdbH2ze
exports.orgsFromPerson = function (id, relations, organizations, callback) {
  var query = replaceOrganizations(replaceRelations(orgsFromPersonQuery, relations), organizations);
  graphDb.cypher({
    query: query,
    params: {
      id: id
    }
  }, function (err, results) {
    var ids, types, since, until;
    if (results) {
      ids = results.map(function (result) {
        return result.orgs.properties.id;
      });
      types = results.map(function (result) {
        return result['r.type'];
      });
      since = results.map(function (result) {
        return result['since'];
      });
      until = results.map(function (result) {
        return result['until'];
      });
    }
    // return both ids and the type of relations
    callback(err, { 'ids': ids, 'types': types, 'since': since, 'until': until });
  });
};


exports.peopleFromOrgsFromPerson = function (id, relations, organizations, concurrent, callback) {
  var query;
  if(concurrent) {
    query = replaceOrganizations(replaceRelations(peopleFromOrgsFromPersonQueryCC, relations), organizations);
  } else {
    query = replaceOrganizations(replaceRelations(peopleFromOrgsFromPersonQuery, relations), organizations);
  }

  graphDb.cypher({
    query: query,
    params: {
      id: id
    }
  }, function (err, results) {
    var ids, orgs, types;
    if (results) {
      ids = results.map(function (result) {
        return result.people.properties.id;
      });
      orgs = results.map(function (result) {
        return { 'id': result.orgs.properties.id, 'name': result.orgs.properties.name };
      });
      types = results.map(function (result) {
        return result['r.type'];
      });
    }
    callback(err, { 'ids': ids, 'orgs': orgs, 'types': types });
  });
};

exports.related = function (ids, relations, direction, callback) {
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
  }, function (err, results) {
    var ids;
    if (results) {
      ids = results.map(function (result) {
        return result.id;
      });
    }
    callback(err, ids);
  });
};


exports.expand = function (ids, callback) {
  var reqOptions = {
    uri: neo4jUrl + '/histograph/expand',
    method: 'POST',
    json: {
      ids: ids,
      equivalence: config.schemas.equivalence,
      hairs: config.api.hairRelations
    }
  };

  request(reqOptions, function (error, response) {
    if (!error && response.statusCode === 200) {
      try {
        callback(null, response.body);
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
