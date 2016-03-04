var config = require('histograph-config');
var _ = require('underscore');

var ds_correct = config.api.ds_corrections || 'z_corrections_';

/**
 * Remove unnecessary attributes from pit
 * @param  {Object} pit Pit object
 * @return {Object}     Normalized pit object
 */
function normalizePit(pit) {
  return {
    id: pit.id,
    name: pit.name,
    type: pit.type,
    dataset: pit.dataset,
    data: pit.data || {}
  };
}

/**
 * Cleanup concepts
 * @param  {Array} concepts Array of concepts
 * @return {Array}          Array of concepts with normalized pits
 */
function cleanupConcepts(concepts) {
  if (!concepts || !concepts.length) {
    return [];
  }

  return concepts.map(function (concept) {
    return concept.map(function (pit) {
      return {
        pit: normalizePit(pit.pit)
      };
    });
  });
}

/**
 * Apply corrections to concept
 * @param  {Array} concepts Array of concepts
 * @return {Array}          Array of concepts with corrections applied
 */
function correctConcepts(concepts) {
  return concepts.map(function (concept) {
    var correction = concept.reduce(function (attributes, pit) {
      return pit.pit.dataset === ds_correct ? _.extend(attributes, { type: pit.pit.type }) : attributes;
    }, {});

    return concept.filter(function (pit) {
      return pit.pit.dataset !== ds_correct;
    }).map(function (pit) {
      return {
        pit: _.extend(pit.pit, correction)
      };
    });
  });
}

/**
 * Merge (concept) pits with relation data
 * @param  {Array} concepts  Array of concept data
 * @param  {Array} relations Array of relations data
 * @return {Array}           Array of relations
 */
function applyRelations(concepts, relations) {
  if (!relations) {
    return concepts;
  }
  var pits = _.flatten(concepts, true).map(function (wrapper) { return wrapper.pit; });
  var ids = pits.map(function (pit) { return pit.id; });

  return relations.map(function (relation) {
    return {
      pit: pits[ids.indexOf(relation.id)],
      relation: {
        type: relation.type,
        to: relation.to,
        since: relation.since,
        until: relation.until.replace('2099-12-31', '') // 2099-12-31 is our fixed future date
      }
    };
  });
}


/**
 * Consolidate data returned by the api
 * @param  {Array} concepts  Array of concept data
 * @param  {Array} relations Array of relation data
 * @return {Array}           Array of consolidated data
 */
module.exports = function (concepts, relations) {
  return applyRelations(correctConcepts(cleanupConcepts(concepts)), relations);
};
