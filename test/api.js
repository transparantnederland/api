var chai = require('chai');
var chaiHttp = require('chai-http');
var config = require('histograph-config');
var pkg = require('../package.json');

var assert = chai.assert;
chai.use(chaiHttp);

describe('🚨  Test API 🚨', function () {
  var server;
  beforeEach(function () {
    // bust require cache to force the full 'server.js' reload
    delete require.cache[require.resolve('../index')];
    server = require('../index');
  });
  afterEach(function (done) {
    server.close(done);
  });

  it('/', function testSlash(done) {
    chai.request(server)
      .get('/')
      .end(function (res) {
        assert.equal(res.status, 200);
        assert.typeOf(res.body, 'object');
        assert.typeOf(res.body.name, 'string');
        assert.equal(res.body.version, pkg.version);
        assert.equal(res.body.docs, pkg.homepage);
        assert.typeOf(res.body.examples, 'array');
        done();
      });
  });

  it('/search', function testSlash(done) {
    chai.request(server)
      .get('/search')
      .query({ q: '*' })
      .end(function (res) {
        assert.equal(res.status, 200);
        assert.typeOf(res.body, 'array');
        res.body.forEach(function (concept) {
          assert.typeOf(concept, 'array');
          concept.forEach(function (item) {
            assert.typeOf(item, 'object');
            assert.typeOf(item.pit, 'object');
            assert.include(config.schemas.types, item.pit.type);
            assert.typeOf(item.pit.dataset, 'string');
            assert.typeOf(item.pit.name, 'string');
            assert.typeOf(item.pit.id, 'string');
          });
        });
        done();
      });
  });
});
