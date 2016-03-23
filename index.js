var url = require('url');
var express = require('express');
var cors = require('cors');
var schemas = require('histograph-schemas');
var io = require('tnl-io');
var stats = require('histograph-stats');
var config = require('histograph-config');
var query = require('./lib/query');
var rquery = require('./lib/rquery');
var reconcile = require('./lib/reconcile');
var params = require('./lib/params');
var bodyParser = require('body-parser');
var pkg = require('./package.json');

var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Mount Histograph IO
app.use('/', io);

// Mount Histograph Stats
app.use('/stats', stats);

var ontology;
schemas.ontology(function (err, results) {
  ontology = results;
});

app.use('*', function (req, res, next) {
  console.log('query: ' + req.originalUrl);
  next();
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

app.get('/', function (req, res) {
  res.send({
    name: 'Transparant Nederland API',
    version: pkg.version,
    message: pkg.description,
    docs: pkg.homepage,
    examples: exampleUrls.map(function (query) {
      return url.resolve(config.api.baseUrl, query);
    })
  });
});


app.get('/ontology', function (req, res) {
  res.set('Content-Type', 'text/turtle');
  res.send(ontology);
});

app.get('/schemas/:schema(pits|relations)', function (req, res) {
  res.send(schemas[req.params.schema]);
});

app.get('/search',
  params.preprocess,
  params.check,
  function (req, res) {
    query(req.processedQuery, function (err, results) {
      if (err) {
        res.status(err.status || 500).send({
          error: err.message || 'Unknown error'
        });
      } else {
        res.send(results);
      }
    });
  }
);

app.get('/peopleFromOrgsFromPerson',
  params.preprocess,
  params.check,
  function (req, res) {
    rquery.peopleFromOrgsFromPerson(req.processedQuery, function (err, results) {
      if (err) {
        res.status(err.status || 500).send({
          error: err.message || 'Unknown error'
        });
      } else {
        res.send(results);
      }
    });
  }
);

app.get('/peopleFromOrg',
  params.preprocess,
  params.check,
  function (req, res) {
    rquery.peopleFromOrg(req.processedQuery, function (err, results) {
      if (err) {
        res.status(err.status || 500).send({
          error: err.message || 'Unknown error'
        });
      } else {
        res.send(results);
      }
    });
  }
);

app.get('/orgsFromPerson',
  params.preprocess,
  params.check,
  function (req, res) {
    rquery.orgsFromPerson(req.processedQuery, function (err, results) {
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

app.get('/relations',
  params.preprocess,
  params.check,
  function (req, res) {
    rquery.relations(req.processedQuery, function (err, results) {
      if (err) {
        res.status(err.status || 500).send({
          error: err.message || 'Unknown error'
        });
      } else {
        res.send(results);
      }
    });
  }
);

app.get('/reconcile', function (req, res) {
  var jsonp = req.query.callback;
  var meta = {
    name: 'Transparant Nederland Reconciliation service',
    identifierSpace: 'http://rdf.transparantnederland.nl',
    schemaSpace: 'http://rdf.transparantnederland.nl',
    view: {
      url: 'https://browse.transparantnederland.nl/#{{id}}',
    },
  };
  var json = jsonp ? jsonp + '(' + JSON.stringify(meta) + ')' : JSON.stringify(meta);

  return res.send(json);
});

app.post('/reconcile', function (req, res) {
  reconcile(req.body, function (err, results) {
    return res.send(results);
  });
});

app.get('/equivalentNodes',
  params.preprocess,
  params.check,
  function (req, res) {
    rquery.equivalentNodes(req.processedQuery, function (err, results) {
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
  function (req, res) {
    rquery.equivalentIDs(req.processedQuery, function (err, results) {
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

app.listen(config.api.bindPort, function () {
  console.log(config.logo.join('\n'));
  console.log('Histograph API listening at port ' + config.api.bindPort);
});
