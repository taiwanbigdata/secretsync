#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const SecretSync = require('../src/index.js');

const program = new Command();

// ASCII Art Logo
console.log(chalk.cyan(`
  ____                      _   ____                      
 / ___|  ___  ___ _ __ ___ | |_/ ___| _   _ _ __   ___     
 \\___ \\ / _ \\/ __| '__/ _ \\| __\\___ \\| | | | '_ \\ / __|    
  ___) |  __/ (__| | |  __/| |_ ___) | |_| | | | | (__     
 |____/ \\___|\\___|_|  \\___| \\__|____/ \\__, |_| |_|\\___|    
                                     |___/                
`));

program
  .name('secret-sync')
  .description('🔐 Universal environment variables synchronization tool')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize SecretSync configuration in current project')
  .action(async () => {
    const sync = new SecretSync();
    await sync.init();
  });

program
  .command('push')
  .description('Push environment variables from local to remote')
  .argument('<environment>', 'Target environment (development, preview, production)')
  .option('-f, --file <file>', 'Specify env file path')
  .option('-p, --platform <platform>', 'Target platform (vercel, netlify)', 'vercel')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(async (environment, options) => {
    const sync = new SecretSync(options);
    await sync.push(environment, options);
  });

program
  .command('pull')
  .description('Pull environment variables from remote to local')
  .argument('<environment>', 'Source environment (development, preview, production)')
  .option('-f, --file <file>', 'Specify output env file path')
  .option('-p, --platform <platform>', 'Source platform (vercel, netlify)', 'vercel')
  .action(async (environment, options) => {
    const sync = new SecretSync(options);
    await sync.pull(environment, options);
  });

program
  .command('status')
  .description('Show sync status and differences')
  .argument('[environment]', 'Environment to check (optional)')
  .option('-p, --platform <platform>', 'Platform to check (vercel, netlify)', 'vercel')
  .action(async (environment, options) => {
    const sync = new SecretSync(options);
    await sync.status(environment, options);
  });

program
  .command('diff')
  .description('Show detailed differences between local and remote')
  .argument('<environment>', 'Environment to compare')
  .option('-p, --platform <platform>', 'Platform to compare (vercel, netlify)', 'vercel')
  .action(async (environment, options) => {
    const sync = new SecretSync(options);
    await sync.diff(environment, options);
  });

// Error handling
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('Run "secret-sync --help" for available commands.'));
  process.exit(1);
});

// Global error handler
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Unexpected error:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error(chalk.red('❌ Unhandled promise rejection:'), error.message);
  process.exit(1);
});

program.parse();