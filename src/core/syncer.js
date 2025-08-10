const fs = require('fs');
const EnvParser = require('./parser');
const Config = require('./config');
const Colors = require('../utils/colors');
const Prompts = require('../utils/prompts');

class Syncer {
  constructor(options = {}) {
    this.config = new Config(options.config);
    this.prompts = new Prompts();
    this.platform = null;
    this.options = {
      skipConfirmation: options.yes || false,
      showDiffs: true,
      ...options
    };
  }

  /**
   * Set platform instance
   * @param {BasePlatform} platform - Platform instance
   */
  setPlatform(platform) {
    this.platform = platform;
  }

  /**
   * Push environment variables from local to remote
   * @param {string} environment - Target environment
   * @param {Object} options - Push options
   */
  async push(environment, options = {}) {
    if (!this.platform) {
      throw new Error('Platform not set');
    }

    console.log(Colors.rocket(`Pushing to ${environment} environment...`));

    // Validate environment
    if (!this.platform.validateEnvironment(environment)) {
      return;
    }

    // Get file path
    const filePath = options.file || this.config.getFilePath(environment);
    const target = this.config.getTarget(environment);

    console.log(Colors.dim(`📁 Local file: ${filePath}`));
    console.log(Colors.dim(`🎯 Remote target: ${target}`));

    // Parse local file
    const localVars = EnvParser.parseFile(filePath);
    if (Object.keys(localVars).length === 0) {
      console.log(Colors.warning('No variables found in local file'));
      return;
    }

    // Filter variables based on config
    const filteredVars = this.config.filterVars(localVars);

    // Validate variables
    const validation = EnvParser.validate(filteredVars);
    if (validation.warnings.length > 0) {
      console.log(Colors.warning('⚠️  Warnings:'));
      validation.warnings.forEach(warning => {
        console.log(Colors.warning(`  - ${warning}`));
      });
    }

    if (!validation.isValid) {
      console.log(Colors.error('❌ Validation failed:'));
      validation.issues.forEach(issue => {
        console.log(Colors.error(`  - ${issue}`));
      });
      return;
    }

    // Get remote variables
    const remoteVars = await this.platform.listRemoteVars(target);

    // Calculate differences
    const changes = this.calculateChanges(filteredVars, remoteVars);

    // Show changes summary
    if (!this.options.skipConfirmation) {
      const shouldProceed = await this.prompts.confirmChanges(changes);
      if (!shouldProceed) {
        console.log(Colors.warning('❌ Push cancelled'));
        return;
      }
    }

    // Apply changes
    await this.applyChanges(changes, filteredVars, target);

    console.log(Colors.checkmark(`✅ Successfully pushed to ${environment}!`));
    this.prompts.close();
  }

  /**
   * Pull environment variables from remote to local
   * @param {string} environment - Source environment
   * @param {Object} options - Pull options
   */
  async pull(environment, options = {}) {
    if (!this.platform) {
      throw new Error('Platform not set');
    }

    console.log(Colors.rocket(`Pulling from ${environment} environment...`));

    // Validate environment
    if (!this.platform.validateEnvironment(environment)) {
      return;
    }

    // Get file path and target
    const filePath = options.file || this.config.getFilePath(environment);
    const target = this.config.getTarget(environment);

    console.log(Colors.dim(`🎯 Remote source: ${target}`));
    console.log(Colors.dim(`📁 Local file: ${filePath}`));

    // Use platform-specific pull method
    const success = await this.platform.pullToFile(target, filePath);

    if (success) {
      console.log(Colors.checkmark(`✅ Successfully pulled from ${environment}!`));
    } else {
      console.log(Colors.error('❌ Pull failed'));
    }
  }

  /**
   * Show sync status
   * @param {string} environment - Environment to check
   * @param {Object} options - Status options
   */
  async status(environment, options = {}) {
    if (!this.platform) {
      throw new Error('Platform not set');
    }

    if (environment) {
      await this.showEnvironmentStatus(environment);
    } else {
      // Show status for all environments
      for (const env of Object.keys(this.config.config.environments)) {
        await this.showEnvironmentStatus(env);
      }
    }
  }

  /**
   * Show detailed differences
   * @param {string} environment - Environment to compare
   * @param {Object} options - Diff options
   */
  async diff(environment, options = {}) {
    if (!this.platform) {
      throw new Error('Platform not set');
    }

    console.log(Colors.rocket(`Comparing ${environment} environment...`));

    const filePath = this.config.getFilePath(environment);
    const target = this.config.getTarget(environment);

    // Parse local file
    const localVars = this.config.filterVars(EnvParser.parseFile(filePath));
    const remoteVars = await this.platform.listRemoteVars(target);

    const changes = this.calculateChanges(localVars, remoteVars);

    console.log(Colors.info(`\n📊 Detailed comparison for ${environment}:`));
    this.showDetailedChanges(changes, localVars);
  }

  /**
   * Show status for specific environment
   * @param {string} environment - Environment name
   */
  async showEnvironmentStatus(environment) {
    console.log(Colors.info(`\n📊 Status for ${environment}:`));

    const filePath = this.config.getFilePath(environment);
    const target = this.config.getTarget(environment);

    // Check if local file exists
    if (!fs.existsSync(filePath)) {
      console.log(Colors.warning(`  Local file not found: ${filePath}`));
      return;
    }

    const localVars = this.config.filterVars(EnvParser.parseFile(filePath));
    const remoteVars = await this.platform.listRemoteVars(target);

    const changes = this.calculateChanges(localVars, remoteVars);
    const total = changes.toAdd.length + changes.toUpdate.length + changes.toRemove.length;

    if (total === 0) {
      console.log(Colors.checkmark(`  ✅ In sync (${Object.keys(localVars).length} variables)`));
    } else {
      console.log(Colors.warning(`  ⚠️  ${total} changes needed`));
      console.log(Colors.dim(`    Add: ${changes.toAdd.length}, Update: ${changes.toUpdate.length}, Remove: ${changes.toRemove.length}`));
    }
  }

  /**
   * Calculate changes needed between local and remote
   * @param {Object} localVars - Local variables
   * @param {Set<string>} remoteVars - Remote variable names
   * @returns {Object} Changes summary
   */
  calculateChanges(localVars, remoteVars) {
    const toAdd = Object.keys(localVars).filter(key => !remoteVars.has(key));
    const toUpdate = Object.keys(localVars).filter(key => remoteVars.has(key));
    const toRemove = Array.from(remoteVars)
      .filter(key => !localVars.hasOwnProperty(key))
      .filter(key => !this.platform.isProtectedVar(key));

    const protected = Array.from(remoteVars)
      .filter(key => !localVars.hasOwnProperty(key))
      .filter(key => this.platform.isProtectedVar(key));

    return {
      toAdd,
      toUpdate,
      toRemove,
      protected
    };
  }

  /**
   * Apply changes to remote platform
   * @param {Object} changes - Changes to apply
   * @param {Object} localVars - Local variables
   * @param {string} target - Target environment
   */
  async applyChanges(changes, localVars, target) {
    console.log(Colors.gear('Applying changes...'));

    // Remove variables
    for (const key of changes.toRemove) {
      await this.platform.removeRemoteVar(key, target);
    }

    // Add and update variables
    for (const key of [...changes.toAdd, ...changes.toUpdate]) {
      await this.platform.setRemoteVar(key, localVars[key], target);
    }
  }

  /**
   * Show detailed changes
   * @param {Object} changes - Changes summary
   * @param {Object} localVars - Local variables for value preview
   */
  showDetailedChanges(changes, localVars) {
    if (changes.toAdd.length > 0) {
      console.log(Colors.plus(`\nWill add ${changes.toAdd.length} variables:`));
      changes.toAdd.forEach(key => {
        const value = localVars[key];
        const preview = value.length > 50 ? `${value.substring(0, 47)}...` : value;
        console.log(`  ${Colors.plus(key)} = ${Colors.dim(preview)}`);
      });
    }

    if (changes.toUpdate.length > 0) {
      console.log(Colors.tilde(`\nWill update ${changes.toUpdate.length} variables:`));
      changes.toUpdate.forEach(key => {
        const value = localVars[key];
        const preview = value.length > 50 ? `${value.substring(0, 47)}...` : value;
        console.log(`  ${Colors.tilde(key)} = ${Colors.dim(preview)}`);
      });
    }

    if (changes.toRemove.length > 0) {
      console.log(Colors.minus(`\nWill remove ${changes.toRemove.length} variables:`));
      changes.toRemove.forEach(key => {
        console.log(`  ${Colors.minus(key)}`);
      });
    }

    if (changes.protected.length > 0) {
      console.log(Colors.lock(`\nProtected variables (${changes.protected.length}, won't be removed):`));
      changes.protected.forEach(key => {
        console.log(`  ${Colors.lock(key)}`);
      });
    }
  }
}

module.exports = Syncer;