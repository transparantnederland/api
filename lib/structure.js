var config = require('histograph-config');

// API structure

// Structure object defines query parameter structure of API:
//   - `search`: allow only one of the parameters specified by `search`,
//   - `filters`: enum values, or comma separated strings containing enum values
//   - `related`: name of parameter specifying path queries
//   - `modifiers`: global query modifiers, boolean parameters

module.exports = {
  query: {
    search: {
      q: {
        pattern: null
      },
      uri: {
        pattern: null
      },
      id: {
        pattern: null
      },
      name: {
        pattern: null
      }
    },
    filters: {
      type: {
        type: 'enum',
        enum: config.schemas.types
      },
      dataset: {
        type: 'enum'
      },
      before: {
        type: 'date'
      },
      after: {
        type: 'date'
      }
    },
    related: {
      enum: config.schemas.relations
    }
  },
  modifiers: {
    concurrent: {
      type: 'boolean',
      default: true
    },
    highlight: {
      type: 'boolean',
      default: false
    },
    exact: {
      type: 'boolean',
      default: false
    },
    geometry: {
      type: 'boolean',
      default: false
    },
    'simplify-geometry': {
      type: 'boolean',
      default: false
    }
  }
};
