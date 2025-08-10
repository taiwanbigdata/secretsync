const fs = require('fs');
const path = require('path');
const Colors = require('../utils/colors');

class Config {
  constructor(configPath = './secret-sync.config.js') {
    this.configPath = configPath;
    this.config = this.load();
  }

  /**
   * Load configuration from file or use defaults
   * @returns {Object} Configuration object
   */
  load() {
    if (fs.existsSync(this.configPath)) {
      try {
        delete require.cache[path.resolve(this.configPath)];
        const config = require(path.resolve(this.configPath));
        console.log(Colors.dim(`📁 Loaded config from ${this.configPath}`));
        return this.mergeWithDefaults(config);
      } catch (error) {
        console.warn(Colors.warning(`Warning: Could not load config file: ${error.message}`));
        console.log(Colors.dim('Using default configuration'));
        return this.getDefaults();
      }
    }

    return this.getDefaults();
  }

  /**
   * Get default configuration
   * @returns {Object} Default configuration
   */
  getDefaults() {
    return {
      platform: 'vercel',
      environments: {
        development: {
          file: '.env.local',
          target: 'development'
        },
        preview: {
          file: '.env.staging',
          target: 'preview'
        },
        production: {
          file: '.env.production',
          target: 'production'
        }
      },
      exclude: [
        'VERCEL_*',
        'CI',
        'NODE_ENV',
        'PWD',
        'HOME',
        'PATH',
        'USER',
        'SHELL'
      ],
      include: [],
      options: {
        confirmChanges: true,
        showDiffs: true,
        backupBeforeSync: false,
        sortKeys: true,
        addHeader: true
      }
    };
  }

  /**
   * Merge user config with defaults
   * @param {Object} userConfig - User configuration
   * @returns {Object} Merged configuration
   */
  mergeWithDefaults(userConfig) {
    const defaults = this.getDefaults();
    
    return {
      ...defaults,
      ...userConfig,
      environments: {
        ...defaults.environments,
        ...userConfig.environments
      },
      options: {
        ...defaults.options,
        ...userConfig.options
      }
    };
  }

  /**
   * Get environment configuration
   * @param {string} environment - Environment name
   * @returns {Object} Environment configuration
   */
  getEnvironment(environment) {
    const envConfig = this.config.environments[environment];
    
    if (!envConfig) {
      throw new Error(`Unknown environment: ${environment}. Available: ${Object.keys(this.config.environments).join(', ')}`);
    }

    return envConfig;
  }

  /**
   * Get file path for environment
   * @param {string} environment - Environment name
   * @returns {string} File path
   */
  getFilePath(environment) {
    const envConfig = this.getEnvironment(environment);
    return envConfig.file;
  }

  /**
   * Get platform target for environment
   * @param {string} environment - Environment name
   * @returns {string} Platform target
   */
  getTarget(environment) {
    const envConfig = this.getEnvironment(environment);
    return envConfig.target;
  }

  /**
   * Check if variable should be excluded
   * @param {string} key - Variable key
   * @returns {boolean} Should exclude
   */
  shouldExclude(key) {
    // Check include patterns first (more specific)
    if (this.config.include.length > 0) {
      const shouldInclude = this.config.include.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
          return regex.test(key);
        }
        return key === pattern;
      });
      
      if (!shouldInclude) return true;
    }

    // Check exclude patterns
    return this.config.exclude.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(key);
      }
      return key === pattern;
    });
  }

  /**
   * Filter environment variables based on include/exclude rules
   * @param {Object} envVars - Environment variables
   * @returns {Object} Filtered environment variables
   */
  filterVars(envVars) {
    const filtered = {};
    const excluded = [];

    Object.entries(envVars).forEach(([key, value]) => {
      if (this.shouldExclude(key)) {
        excluded.push(key);
      } else {
        filtered[key] = value;
      }
    });

    if (excluded.length > 0) {
      console.log(Colors.dim(`🔒 Excluded ${excluded.length} variables: ${excluded.join(', ')}`));
    }

    return filtered;
  }

  /**
   * Create default config file
   * @param {string} platform - Platform name
   */
  static createConfigFile(platform = 'vercel', configPath = './secret-sync.config.js') {
    const template = `module.exports = {
  // Platform: vercel, netlify, railway
  platform: '${platform}',

  // Environment mappings
  environments: {
    development: {
      file: '.env.local',
      target: 'development'
    },
    preview: {
      file: '.env.staging', 
      target: 'preview'
    },
    production: {
      file: '.env.production',
      target: 'production'
    }
  },

  // Variables to exclude (glob patterns supported)
  exclude: [
    'VERCEL_*',
    'CI',
    'NODE_ENV'
  ],

  // Variables to include (if specified, only these will be synced)
  include: [
    // 'NEXT_PUBLIC_*',
    // 'SUPABASE_*'
  ],

  // Sync options
  options: {
    confirmChanges: true,
    showDiffs: true,
    backupBeforeSync: false,
    sortKeys: true,
    addHeader: true
  }
};`;

    try {
      fs.writeFileSync(configPath, template, 'utf-8');
      console.log(Colors.checkmark(`Created config file: ${configPath}`));
    } catch (error) {
      console.error(Colors.error(`Error creating config file: ${error.message}`));
      throw error;
    }
  }
}

module.exports = Config;