import should = require('should')
var
  path = require('path'),
  glob = require('glob'),
  jsYaml = require('js-yaml');

const yamlPaths = glob.sync(path.join(__dirname, 'swaggers/**/yaml/*.yml'));

describe('Wireformat generator', () => {
  yamlPaths.forEach((yamlPath: any) => {
    it(`should generate a valid YAML doc for "${yamlPath}."`, (done) => {
      try {
        let yamlContent = jsYaml.safeLoad(yamlPath, { strict: true });
        should.exist(yamlContent);
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});