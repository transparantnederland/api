var url     = require('url');
var express = require('express');
var cors    = require('cors');
var schemas = require('tnl-schemas');
var io      = require('tnl-io');
var stats   = require('tnl-stats');
var config  = require('tnl-config');
var query   = require('./lib/query');
var rquery  = require('./lib/rquery');
var jsonld  = require('./lib/jsonld');
var geojson = require('./lib/geojson');
var params  = require('./lib/params');
var app     = express();

app.use(cors());

// Mount Histograph IO
app.use('/', io);

// Mount Histograph Stats
app.use('/stats', stats);

var ontology;
schemas.ontology(function(err, results) {
  ontology = results;
});

var exampleUrls = config.api.exampleUrls || [];

function formatError(err) {
  if (err && err.message && err.message.indexOf('IndexMissingException') === 0) {
    var match = err.message.match(/\[\[(.*?)\]/);
    if (match) {
      return 'Dataset not found: ' + match[1];
    }
  }
  return err;
}

app.use("*", function(req,res,next) {
  console.log("query: " + req.originalUrl);
  next();
});


app.get('/', function(req, res) {
  res.send({
    name: 'Transparant NL API',
    version: '0.0.1',
    message: 'Bestuurlijk Nederland in beeld',
    docs: 'https://github.com/waagsociety/tnl-api',
    examples: exampleUrls.map(function(query) {
      return url.resolve(config.api.baseUrl, query);
    })
  });
});


app.get('/ontology', function(req, res) {
  res.set('Content-Type', 'text/turtle');
  res.send(ontology);
});

app.get('/schemas/:schema(pits|relations)', function(req, res) {
  res.send(schemas[req.params.schema]);
});

app.get('/search',
  params.preprocess,
  params.check,
  function(req, res) {
    query(req.processedQuery, function(err, results) {
      if (err) {
        res.status(err.status || 400).send({
          message: formatError(err)
        });
      } else {
        results = jsonld(geojson(results, req.processedQuery), req.processedQuery);
        res.send(results);
      }
    });
  }
);

app.get('/peopleFromOrgsFromPerson',
  params.preprocess,
  params.check,
  function(req, res) {
    rquery.peopleFromOrgsFromPerson(req.processedQuery, function(err, results) {
      if (err) {
        res.status(err.status || 400).send({
          message: formatError(err)
        });
      } else {
        // results = jsonld(geojson(results, req.processedQuery), req.processedQuery);
        res.send(results);
      }
    });
  }
);

app.get('/peopleFromOrg',
  params.preprocess,
  params.check,
  function(req, res) {
    rquery.peopleFromOrg(req.processedQuery, function(err, results) {
      if (err) {
        res.status(err.status || 400).send({
          message: formatError(err)
        });
      } else {
        // results = jsonld(geojson(results, req.processedQuery), req.processedQuery);
        res.send(results);
      }
    });
  }
);


app.get('/orgsFromPerson',
  params.preprocess,
  params.check,
  function(req, res) {
    rquery.orgsFromPerson(req.processedQuery, function(err, results) {
      if (err) {
        res.status(err.status || 400).send({
          message: formatError(err)
        });
      } else {
        // results = jsonld(geojson(results, req.processedQuery), req.processedQuery);
        res.send(results);
      }
    });
  }
);

app.get('/equivalentNodes',
  params.preprocess,
  params.check,
  function(req, res) {
    rquery.equivalentNodes(req.processedQuery, function(err, results) {
      if (err) {
        res.status(err.status || 400).send({
          message: formatError(err)
        });
      } else {
        res.send(results);
      }
    });
  }
);


// app.get('/shortestPath',
//   params.preprocess,
//   params.check,
//   function(req, res) {
//     rquery.shortestPath(req.processedQuery, function(err, results) {
//       if (err) {
//         res.status(err.status || 400).send({
//           message: formatError(err)
//         });
//       } else {
//         res.send(results);
//       }
//     });
//   }
// );
//

app.get('/equivalentIDs',
  params.preprocess,
  params.check,
  function(req, res) {
    rquery.equivalentIDs(req.processedQuery, function(err, results) {
      if (err) {
        res.status(err.status || 400).send({
          message: formatError(err)
        });
      } else {
        res.send(results);
      }
    });
  }
);

app.listen(config.api.bindPort, function() {
  console.log(config.logo.join('\n'));
  console.log('Histograph API listening at port ' + config.api.bindPort);
});
