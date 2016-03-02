var config = require('histograph-config');
var _ = require('underscore');

var FIXED_FUTURE_DATE = '2099-12-31';

// in schema:
//   "ds_corrections": "string",
//   "ds-priority": {
//     "type": "array",
//     "items": {
//       "type": "object",
//       "properties": {
//         "type" : "string",
//         "dataset" : "string"
//       }
//     }
//   },

var ds_correct = config.api.ds_corrections || 'z_corrections_';
var ds_priority = config.api.priority;

// make first concept the preferred one
// replace corrected pits with their corrections
// remove hairs & relations

module.exports = function (concepts, results) {
  if (!(concepts && concepts.length)) {
    concepts = [];
  }

  return concepts.map(function (concept) {
    // Aggregate corrections in new object
    var correction = concept.filter(function (pit) {
      return pit.pit.dataset === ds_correct;
    }).reduce(function (prev, next) {
      prev.type = next.pit.type;
      return prev;
    }, {});

    // Filter corrections and apply correction object
    return concept.filter(function (pit) {
      return pit.pit.dataset !== ds_correct;
    }).map(function (pit) {
      pit.pit = _.extend(pit.pit, correction);

      // Remove unnecessary attributes
      delete pit.hairs;
      delete pit.pit.validSinceTimestamp;
      delete pit.pit.validUntilTimestamp;

      // Clean up time attributes
      if (pit.pit.validSince) {
        pit.pit.validSince = pit.pit.validSince[0];
      }
      if (pit.pit.validUntil) {
        pit.pit.validUntil = pit.pit.validUntil[0];
      }
      if (pit.pit.validUntil === FIXED_FUTURE_DATE) {
        pit.pit.validUntil = '';
      }

      if (results) {
        var idx = results.ids.indexOf(pit.pit.id);
        pit.relation = { 'type': results.types[idx] };
        if (results.since) {
          pit.relation.since = results.since[idx];
        }
        if (results.until) {
          pit.relation.until = results.until[idx];
        }
        if (pit.relation.until === FIXED_FUTURE_DATE) {
          pit.relation.until = '';
        }
        if (results.orgs) {
          pit.relation_org = results.orgs[idx];
        }
        if (results.to) {
          pit.relation.to = results.to[idx];
        }
        delete pit.relations;
      }

      return pit;
    });
  });
};
