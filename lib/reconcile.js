var _ = require('underscore');
var highland = require('highland');
var graph = require('./graph');
var elasticsearch = require('./elasticsearch');
var consolidate = require('./consolidate');

module.exports = function (params, callback) {
  var query = params.query;
  var queries = params.queries && JSON.parse(params.queries);

  if (!query && !queries) {
    return callback(null, null);
  }

  var esQueries = [];

  for (var q in queries) {
    esQueries.push(elasticsearch.searchQuery({
      name: queries[q].query,
      type: queries[q].type ? [queries[q].type] : false,
      exact: false,
      highlight: false,
    }));
  }

  var error = false;
  var qi = 0;

  highland(esQueries)
    .nfcall([])
    .series()
    .errors(function (err) { error = true; callback(err); })
    .map(function (result) {
      var response = {
        q: qi,
        results: result.filter(function (item) {
          return item.score > 3;
        }),
      };
      qi++;

      return response;
    })
    .toArray(function (results) {
      var queryMap = results.reduce(function (prev, next) {
        next.results.forEach(function (result) {
          prev[result.id] = next.q;
        });
        return prev;
      }, {});
      var scoreMap = results.reduce(function (prev, next) {
        next.results.forEach(function (result) {
          prev[result.id] = (result.score);
        });
        return prev;
      }, {});
      var ids = results.reduce(function (prev, next) {
        next.results.forEach(function (result) {
          prev.push(result.id);
        });
        return prev;
      }, []);
      if (!error) {
        graph.expand(ids, function (err, concepts) {
          var result = consolidate(concepts).map(function (concept) {
            var pit = _.find(concept, function (item) {
              return ids.indexOf(item.pit.id) > -1;
            });

            return {
              id: pit.pit.id,
              name: pit.pit.name,
              type: [pit.pit.type],
              score: scoreMap[pit.pit.id],
              match: scoreMap[pit.pit.id] === 1,
              q: queryMap[pit.pit.id],
            };
          }).reduce(function (prev, next) {
            var qi = next.q;
            delete next.q;
            prev['q' + qi] = prev['q' + qi] || { result: [] };
            prev['q' + qi].result.push(next);
            return prev;
          }, {});

          callback(null, result);
        });
      }
    });
};
