var config  = require('histograph-config');


  // make first element the preferred one
  // replace corrected pits with their corrections
  // remove hairs & relations

module.exports = function(concepts, results) {
  var idx;
  concepts.forEach( function( element ) {
    element.forEach( function( e ) {
      delete e.hairs
      delete e.relations
      idx = results.ids.indexOf(e.pit.id)
      e.relation_type = results.types[ idx ];
      if(results.orgs)
        e.relation_org = results.orgs[ idx ];
      idx += 1;
    } );
  } );
  return concepts;
}


