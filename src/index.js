const Syncer = require('./core/syncer');
const Config = require('./core/config');
const VercelPlatform = require('./platforms/vercel');
const Colors = require('./utils/colors');

/**
 * Main SecretSync class
 */
class SecretSync {
  constructor(options = {}) {
    this.options = options;
    this.syncer = new Syncer(options);
    this.platform = null;
    this.config = new Config(options.config);
    
    // Initialize platform based on config or options
    this.initPlatform(options.platform || this.config.config.platform);
  }

  /**
   * Initialize platform instance
   * @param {string} platformName - Platform name
   */
  initPlatform(platformName) {
    switch (platformName.toLowerCase()) {
      case 'vercel':
        this.platform = new VercelPlatform(this.options);
        break;
      case 'netlify':
        // TODO: Implement Netlify platform
        throw new Error('Netlify platform not yet implemented');
      case 'railway':
        // TODO: Implement Railway platform
        throw new Error('Railway platform not yet implemented');
      default:
        throw new Error(`Unsupported platform: ${platformName}`);
    }

    this.syncer.setPlatform(this.platform);
  }

  /**
   * Initialize SecretSync in a project
   */
  async init() {
    console.log(Colors.rocket('Initializing SecretSync...'));

    // Check if config already exists
    if (require('fs').existsSync('./secret-sync.config.js')) {
      console.log(Colors.warning('Config file already exists: secret-sync.config.js'));
      return;
    }

    // Create default config
    Config.createConfigFile('vercel');
    
    console.log(Colors.checkmark('✅ SecretSync initialized successfully!'));
    console.log(Colors.info('\n📝 Next steps:'));
    console.log(Colors.dim('1. Edit secret-sync.config.js to customize settings'));
    console.log(Colors.dim('2. Run "secret-sync status" to check current state'));
    console.log(Colors.dim('3. Run "secret-sync push development" to sync your variables'));
  }

  /**
   * Push environment variables to platform
   * @param {string} environment - Target environment
   * @param {Object} options - Push options
   */
  async push(environment, options = {}) {
    try {
      // Initialize platform
      const initialized = await this.platform.init();
      if (!initialized) {
        return;
      }

      // For Vercel, check if project is linked
      if (this.platform.name === 'vercel' && !this.platform.isProjectLinked()) {
        return;
      }

      await this.syncer.push(environment, options);
    } catch (error) {
      console.error(Colors.error(`Push failed: ${error.message}`));
      if (this.options.debug) {
        console.error(error.stack);
      }
    }
  }

  /**
   * Pull environment variables from platform
   * @param {string} environment - Source environment
   * @param {Object} options - Pull options
   */
  async pull(environment, options = {}) {
    try {
      // Initialize platform
      const initialized = await this.platform.init();
      if (!initialized) {
        return;
      }

      // For Vercel, check if project is linked
      if (this.platform.name === 'vercel' && !this.platform.isProjectLinked()) {
        return;
      }

      await this.syncer.pull(environment, options);
    } catch (error) {
      console.error(Colors.error(`Pull failed: ${error.message}`));
      if (this.options.debug) {
        console.error(error.stack);
      }
    }
  }

  /**
   * Show sync status
   * @param {string} environment - Environment to check
   * @param {Object} options - Status options
   */
  async status(environment, options = {}) {
    try {
      // Initialize platform
      const initialized = await this.platform.init();
      if (!initialized) {
        return;
      }

      // For Vercel, check if project is linked
      if (this.platform.name === 'vercel' && !this.platform.isProjectLinked()) {
        return;
      }

      await this.syncer.status(environment, options);
    } catch (error) {
      console.error(Colors.error(`Status check failed: ${error.message}`));
      if (this.options.debug) {
        console.error(error.stack);
      }
    }
  }

  /**
   * Show detailed differences
   * @param {string} environment - Environment to compare
   * @param {Object} options - Diff options
   */
  async diff(environment, options = {}) {
    try {
      // Initialize platform
      const initialized = await this.platform.init();
      if (!initialized) {
        return;
      }

      // For Vercel, check if project is linked
      if (this.platform.name === 'vercel' && !this.platform.isProjectLinked()) {
        return;
      }

      await this.syncer.diff(environment, options);
    } catch (error) {
      console.error(Colors.error(`Diff failed: ${error.message}`));
      if (this.options.debug) {
        console.error(error.stack);
      }
    }
  }
}

module.exports = SecretSync;