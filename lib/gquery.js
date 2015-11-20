var graph = require('./graph');
var normalizeUri = require('./normalize-uri');

// module.exports = function(query, callback) {
// 	console.log(query)
// 	if (query.id) {
// 	  var ids = [query.id]
//       graph.expand(ids, function(err, concepts) {
//         callback(err, concepts);
//       });
//   } else {
//     callback('Please supply an `id`');
//   }
// };

// localhost:3001/r?id=overheidsorganisaties/124740
module.exports = function(query, callback) {
	if (query.id) {
		graph.tnlRelated(normalizeUri(query.id).normalized, ['tnl:related'], 'from', function(err, ids) {
          if (err) {
            callback(err);
          } else {
            graph.expand(ids, function(err, concepts) { callback(err, concepts); } );
          }
        });
  } else {
    callback('Please supply an `id`');
  }
};
