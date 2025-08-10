const Colors = require('../utils/colors');

/**
 * Base class for platform integrations
 */
class BasePlatform {
  constructor(options = {}) {
    this.options = options;
    this.name = 'base';
  }

  /**
   * Initialize platform (check CLI availability, auth, etc.)
   * @returns {Promise<boolean>} Initialization success
   */
  async init() {
    throw new Error('init() method must be implemented by platform subclass');
  }

  /**
   * List environment variables from platform
   * @param {string} environment - Environment name
   * @returns {Promise<Set<string>>} Set of variable names
   */
  async listRemoteVars(environment) {
    throw new Error('listRemoteVars() method must be implemented by platform subclass');
  }

  /**
   * Get environment variable value from platform
   * @param {string} key - Variable key
   * @param {string} environment - Environment name
   * @returns {Promise<string|null>} Variable value or null if not found
   */
  async getRemoteVar(key, environment) {
    throw new Error('getRemoteVar() method must be implemented by platform subclass');
  }

  /**
   * Set environment variable on platform
   * @param {string} key - Variable key
   * @param {string} value - Variable value
   * @param {string} environment - Environment name
   * @returns {Promise<boolean>} Success
   */
  async setRemoteVar(key, value, environment) {
    throw new Error('setRemoteVar() method must be implemented by platform subclass');
  }

  /**
   * Remove environment variable from platform
   * @param {string} key - Variable key
   * @param {string} environment - Environment name
   * @returns {Promise<boolean>} Success
   */
  async removeRemoteVar(key, environment) {
    throw new Error('removeRemoteVar() method must be implemented by platform subclass');
  }

  /**
   * Pull all environment variables from platform to local file
   * @param {string} environment - Environment name
   * @param {string} filePath - Local file path
   * @returns {Promise<boolean>} Success
   */
  async pullToFile(environment, filePath) {
    throw new Error('pullToFile() method must be implemented by platform subclass');
  }

  /**
   * Get platform-specific system variables that should be protected
   * @returns {Set<string>} Set of protected variable patterns
   */
  getSystemVars() {
    return new Set([
      'CI',
      'NODE_ENV',
      'PWD',
      'HOME',
      'PATH',
      'USER',
      'SHELL'
    ]);
  }

  /**
   * Check if variable should be protected from deletion
   * @param {string} key - Variable key
   * @returns {boolean} Is protected
   */
  isProtectedVar(key) {
    const systemVars = this.getSystemVars();
    
    for (const pattern of systemVars) {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(key)) return true;
      } else {
        if (key === pattern) return true;
      }
    }
    
    return false;
  }

  /**
   * Log platform-specific operation
   * @param {string} operation - Operation name
   * @param {string} key - Variable key
   * @param {string} environment - Environment name
   * @param {boolean} success - Operation success
   */
  logOperation(operation, key, environment, success = true) {
    const icon = success ? Colors.checkmark('') : Colors.cross('');
    const msg = `${operation} ${key} in ${environment}`;
    console.log(`  ${icon} ${msg}`);
  }

  /**
   * Validate environment name
   * @param {string} environment - Environment name
   * @returns {boolean} Is valid
   */
  validateEnvironment(environment) {
    const validEnvironments = this.getValidEnvironments();
    if (!validEnvironments.includes(environment)) {
      console.error(Colors.error(`Invalid environment: ${environment}`));
      console.log(Colors.info(`Valid environments for ${this.name}: ${validEnvironments.join(', ')}`));
      return false;
    }
    return true;
  }

  /**
   * Get valid environment names for this platform
   * @returns {string[]} Valid environment names
   */
  getValidEnvironments() {
    return ['development', 'preview', 'production'];
  }
}

module.exports = BasePlatform;