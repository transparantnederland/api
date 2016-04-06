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
var relationsQuery = fs.readFileSync(path.join(__dirname, '..', 'queries', 'relations.cypher'), { encoding: 'utf8' });

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

exports.shortestPath = function (idFrom, idTo, callback) {
  var query = shortestPathQuery;
  graphDb.cypher({
    query: query,
    params: {
      idFrom: idFrom,
      idTo: idTo
    }
  }, function (err, results) {
    // Let’s write some crazy HAXX! \o/
    //
    // Since our Neo4j data model doesn’t have proper relations and uses concepts,
    // using shortestPath results in also returning concept nodes.
    //
    // The rest of this function merges concept nodes, filters out relationship
    // nodes, and defines the correct relations between pits.

    // When a id or type is null, it is actually a concept, this method merges concept pits
    function consolidateResult(res) {
      var output = res.slice();
      var index = output.indexOf(null);

      while (index !== -1) {
        output = [].concat(output.slice(0, index - 1), output.slice(index + 1, output.length)).slice();
        index = output.indexOf(null);
      }

      return output;
    }

    var relationTypes = ['tnl:related', 'tnl:member', 'tnl:boardmember', 'tnl:advisor', 'tnl:commissioner', 'tnl:employee', 'tnl:lobbyist', 'tnl:spokesperson', 'tnl:parent'];
    var pitTypes = ['tnl:Organization', 'tnl:Public', 'tnl:PoliticalParty', 'tnl:Commercial', 'tnl:NonProfit', 'tnl:Sector', 'tnl:Person'];
    var result = results[0];
    var output = {
      ids: [],
      relations: [],
    };

    if (!result) {
      return callback(null, output);
    }

    var ids = consolidateResult(result.ids);
    var types = consolidateResult(result.types);
    var len = types.length;
    var i = 0;

    // First, merge all pits that are joined by a concept
    for (i; i < len; i++) {
      // Item is a pit
      if (pitTypes.indexOf(types[i]) !== -1) {
        // Add to ids
        output.ids.push(ids[i]);
        // The last pit won’t have a relation, so add an empty one
        if (i === len - 1) {
          output.relations.push({
            id: ids[i],
            to: null,
            type: null,
            since: '',
            until: '',
          });
        }
      // Item is a relation
      } else if (relationTypes.indexOf(types[i]) !== -1) {
        output.relations.push({
          id: ids[i - 1],
          to: ids[i + 1],
          type: types[i],
          until: '',
          since: '',
        });
      }
    }

    callback(err, output);
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
    callback(err, (results || []));
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
    callback(err, (results || []));
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
    callback(err, (results || []));
  });
};

exports.relations = function (id, callback) {
  var query = relationsQuery;

  graphDb.cypher({
    query: query,
    params: {
      id: id
    }
  }, function (err, results) {
    callback(err, (results || []));
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
