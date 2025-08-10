const { execSync } = require('child_process');
const BasePlatform = require('./base');
const Colors = require('../utils/colors');

class VercelPlatform extends BasePlatform {
  constructor(options = {}) {
    super(options);
    this.name = 'vercel';
  }

  /**
   * Initialize Vercel platform
   * @returns {Promise<boolean>} Initialization success
   */
  async init() {
    try {
      execSync('vc --version', { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.error(Colors.error('❌ Vercel CLI not found'));
      console.log(Colors.info('Please install: npm i -g vercel'));
      return false;
    }
  }

  /**
   * List environment variables from Vercel
   * @param {string} environment - Environment name
   * @returns {Promise<Set<string>>} Set of variable names
   */
  async listRemoteVars(environment) {
    try {
      const output = execSync(`vc env ls ${environment}`, { encoding: 'utf-8' });
      const lines = output.split('\n').filter(line => line.trim());
      const envVars = new Set();

      lines.forEach(line => {
        const trimmed = line.trim();
        // Skip header and separator lines
        if (trimmed && !trimmed.startsWith('name') && !trimmed.startsWith('---')) {
          // Parse table format: variable name is first column
          const parts = trimmed.split(/\s+/);
          if (parts.length > 0 && parts[0] && !parts[0].includes('=')) {
            envVars.add(parts[0]);
          }
        }
      });

      console.log(Colors.dim(`📋 Found ${envVars.size} variables in ${environment}`));
      return envVars;
    } catch (error) {
      console.error(Colors.error(`Failed to list Vercel env vars: ${error.message}`));
      return new Set();
    }
  }

  /**
   * Set environment variable on Vercel
   * @param {string} key - Variable key
   * @param {string} value - Variable value
   * @param {string} environment - Environment name
   * @returns {Promise<boolean>} Success
   */
  async setRemoteVar(key, value, environment) {
    try {
      // First try to remove existing variable (for updates)
      try {
        execSync(`vc env rm ${key} ${environment} -y`, { stdio: 'pipe' });
        console.log(Colors.dim(`  - Removed old value: ${key}`));
      } catch (removeError) {
        // Ignore error if variable doesn't exist
      }

      // Add new variable
      execSync(`echo "${value}" | vc env add ${key} ${environment}`, { stdio: 'pipe' });
      this.logOperation('Set', key, environment);
      return true;
    } catch (error) {
      this.logOperation('Set', key, environment, false);
      console.log(Colors.dim(`    Error: ${error.message}`));
      console.log(Colors.dim(`    Tip: If this is a sensitive variable, update it manually in Vercel Dashboard`));
      return false;
    }
  }

  /**
   * Remove environment variable from Vercel
   * @param {string} key - Variable key
   * @param {string} environment - Environment name
   * @returns {Promise<boolean>} Success
   */
  async removeRemoteVar(key, environment) {
    try {
      execSync(`vc env rm ${key} ${environment} -y`, { stdio: 'pipe' });
      this.logOperation('Removed', key, environment);
      return true;
    } catch (error) {
      this.logOperation('Remove', key, environment, false);
      console.log(Colors.dim(`    Error: ${error.message}`));
      return false;
    }
  }

  /**
   * Pull all environment variables from Vercel to local file
   * @param {string} environment - Environment name
   * @param {string} filePath - Local file path
   * @returns {Promise<boolean>} Success
   */
  async pullToFile(environment, filePath) {
    try {
      execSync(`vc env pull ${filePath} --environment=${environment} --yes`, { stdio: 'inherit' });
      console.log(Colors.checkmark(`Pulled ${environment} variables to ${filePath}`));
      return true;
    } catch (error) {
      console.error(Colors.error(`Failed to pull from Vercel: ${error.message}`));
      return false;
    }
  }

  /**
   * Get Vercel-specific system variables
   * @returns {Set<string>} Set of protected variable patterns
   */
  getSystemVars() {
    const baseVars = super.getSystemVars();
    const vercelVars = new Set([
      'VERCEL*',
      'CI',
      'VERCEL_ENV',
      'VERCEL_TARGET_ENV',
      'VERCEL_URL',
      'VERCEL_BRANCH_URL',
      'VERCEL_PROJECT_PRODUCTION_URL',
      'VERCEL_REGION',
      'VERCEL_DEPLOYMENT_ID',
      'VERCEL_PROJECT_ID',
      'VERCEL_SKEW_PROTECTION_ENABLED',
      'VERCEL_AUTOMATION_BYPASS_SECRET',
      'VERCEL_OIDC_TOKEN',
      'VERCEL_GIT_PROVIDER',
      'VERCEL_GIT_REPO_SLUG',
      'VERCEL_GIT_REPO_OWNER',
      'VERCEL_GIT_REPO_ID',
      'VERCEL_GIT_COMMIT_REF',
      'VERCEL_GIT_COMMIT_SHA',
      'VERCEL_GIT_COMMIT_MESSAGE',
      'VERCEL_GIT_COMMIT_AUTHOR_LOGIN',
      'VERCEL_GIT_COMMIT_AUTHOR_NAME',
      'VERCEL_GIT_PREVIOUS_SHA',
      'VERCEL_GIT_PULL_REQUEST_ID',
      'NEXT_PUBLIC_VERCEL_URL',
      'NEXT_PUBLIC_VERCEL_ENV',
      'NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL',
      'NEXT_PUBLIC_VERCEL_BRANCH_URL',
      'NEXT_PUBLIC_VERCEL_GIT_PROVIDER',
      'NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG',
      'NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER',
      'NEXT_PUBLIC_VERCEL_GIT_REPO_ID',
      'NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF',
      'NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA',
      'NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE',
      'NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN',
      'NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME',
      'NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID'
    ]);

    return new Set([...baseVars, ...vercelVars]);
  }

  /**
   * Get valid environment names for Vercel
   * @returns {string[]} Valid environment names
   */
  getValidEnvironments() {
    return ['development', 'preview', 'production'];
  }

  /**
   * Check if Vercel project is linked
   * @returns {boolean} Is linked
   */
  isProjectLinked() {
    try {
      execSync('vc project ls', { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.error(Colors.error('❌ Vercel project not linked'));
      console.log(Colors.info('Please run: vc link'));
      return false;
    }
  }
}

module.exports = VercelPlatform;