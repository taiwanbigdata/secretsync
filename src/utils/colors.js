const chalk = require('chalk');

class Colors {
  static success(text) {
    return chalk.green(text);
  }

  static error(text) {
    return chalk.red(text);
  }

  static warning(text) {
    return chalk.yellow(text);
  }

  static info(text) {
    return chalk.blue(text);
  }

  static dim(text) {
    return chalk.gray(text);
  }

  static bold(text) {
    return chalk.bold(text);
  }

  static cyan(text) {
    return chalk.cyan(text);
  }

  static magenta(text) {
    return chalk.magenta(text);
  }

  // Shortcut methods with symbols
  static checkmark(text) {
    return chalk.green(`✓ ${text}`);
  }

  static cross(text) {
    return chalk.red(`✗ ${text}`);
  }

  static plus(text) {
    return chalk.green(`+ ${text}`);
  }

  static minus(text) {
    return chalk.red(`- ${text}`);
  }

  static tilde(text) {
    return chalk.yellow(`~ ${text}`);
  }

  static lock(text) {
    return chalk.gray(`🔒 ${text}`);
  }

  static rocket(text) {
    return chalk.blue(`🚀 ${text}`);
  }

  static gear(text) {
    return chalk.blue(`🔧 ${text}`);
  }
}

module.exports = Colors;