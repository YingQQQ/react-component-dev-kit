const { join } = require('path');

const PATHS = {
  app: join(__dirname, '../', 'src'),
  build: join(__dirname, '../', 'dist'),
  recordsPath: join(__dirname, '../', 'records.json')
};

module.exports = {
  PATHS
};
