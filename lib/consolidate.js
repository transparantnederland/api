var config  = require('tnl-config');
var _ = require('underscore');

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

var ds_correct = config.api.ds_corrections || "_corrections_";
var ds_priority = config.api.priority;

  // make first element the preferred one
  // replace corrected pits with their corrections
  // remove hairs & relations

module.exports = function(concepts, results) {
  
  concepts.forEach( function( element ) {
    
    element.filter( function(e) {
      
      if( e.pit.dataset == ds_correct) {
        console.log(JSON.stringify(e.pit))
        var arrayFound = element.filter(function(item) {
            return item.pit.id == e.relations[0].to;
        });
        if(arrayFound[0]) {
          delete e.pit.id
          delete e.pit.dataset
          arrayFound[0].pit = _.extend(arrayFound[0].pit, e.pit);
        }
        return false;
      }
    
      delete e.hairs
      delete e.pit.validSinceTimestamp
      delete e.pit.validUntilTimestamp
    
      if( e.pit.validSince )
        e.pit.validSince = e.pit.validSince[0]
      if( e.pit.validUntil )
        e.pit.validUntil = e.pit.validUntil[0]
      if(results) { 
        var idx = results.ids.indexOf(e.pit.id)
        e.relation_type = results.types[ idx ];
        if(results.orgs)
          e.relation_org = results.orgs[ idx ];
        delete e.relations
      }
      return true;

    } );

  } );
  return concepts;
}


