const fs = require('fs');

module.exports.readVersion = function (contents) {
  const versions = Object.keys(JSON.parse(contents));
  return versions[versions.length - 1];
};

module.exports.writeVersion = function (contents, version) {
  const { minAppVersion } = JSON.parse(fs.readFileSync('manifest.json'));
  const json = JSON.parse(contents);
  json[version] = minAppVersion;
  return JSON.stringify(json, null, '\t');
};
