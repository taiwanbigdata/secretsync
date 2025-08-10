const readline = require('readline');
const Colors = require('./colors');

class Prompts {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async question(query) {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }

  async confirm(message, defaultValue = false) {
    const defaultText = defaultValue ? 'Y/n' : 'y/N';
    const answer = await this.question(`${message} (${defaultText}) `);
    
    if (answer === '') return defaultValue;
    return answer.toLowerCase().startsWith('y');
  }

  async confirmChanges(summary) {
    console.log(`\n${Colors.info('📋 Change Summary:')}`);
    
    if (summary.toAdd.length > 0) {
      console.log(`\n${Colors.plus('Will add')} ${summary.toAdd.length} variables:`);
      summary.toAdd.forEach(key => console.log(`  ${Colors.plus(key)}`));
    }
    
    if (summary.toUpdate.length > 0) {
      console.log(`\n${Colors.tilde('Will update')} ${summary.toUpdate.length} variables:`);
      summary.toUpdate.forEach(key => console.log(`  ${Colors.tilde(key)}`));
    }
    
    if (summary.toRemove.length > 0) {
      console.log(`\n${Colors.minus('Will remove')} ${summary.toRemove.length} variables:`);
      summary.toRemove.forEach(key => console.log(`  ${Colors.minus(key)}`));
    }

    if (summary.protected && summary.protected.length > 0) {
      console.log(`\n${Colors.lock('Protected variables')} (${summary.protected.length}, won't be removed):`);
      summary.protected.forEach(key => console.log(`  ${Colors.lock(key)}`));
    }

    const total = summary.toAdd.length + summary.toUpdate.length + summary.toRemove.length;
    
    if (total === 0) {
      console.log(`\n${Colors.checkmark('No changes needed - everything is in sync')}`);
      return false;
    }

    return await this.confirm(`\nDo you want to proceed with these ${total} changes?`);
  }

  close() {
    this.rl.close();
  }
}

module.exports = Prompts;