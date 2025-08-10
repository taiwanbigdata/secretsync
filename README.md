# 🔐 SecretSync

> Universal environment variables synchronization tool for modern web projects

SecretSync is a powerful CLI tool that keeps your environment variables in sync across different platforms (Vercel, Netlify, Railway) and environments (development, staging, production). Born from the need to manage complex environment variable workflows in modern web development.

## ✨ Features

- 🔄 **Bidirectional Sync**: Push from local to remote, or pull from remote to local
- 🎯 **Multi-Platform**: Support for Vercel (more platforms coming soon)
- 🛡️ **Smart Protection**: Automatically protects system variables from deletion
- ⚙️ **Flexible Configuration**: Powerful include/exclude rules with glob patterns
- 🎨 **Beautiful CLI**: Colorful output with clear change previews
- 📋 **Status Monitoring**: Check sync status across all environments
- 🔍 **Detailed Diffs**: See exactly what will change before applying

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g @taiwanbigdata/secret-sync

# Or use with npx (no installation needed)
npx @taiwanbigdata/secret-sync --help
```

### Initialize in Your Project

```bash
# Create configuration file
secret-sync init

# Check current status
secret-sync status

# Push local variables to development environment
secret-sync push development
```

## 📖 Usage

### Basic Commands

```bash
# Initialize SecretSync configuration
secret-sync init

# Push environment variables (local → remote)
secret-sync push <environment>
secret-sync push development --file .env.local
secret-sync push production --yes  # Skip confirmation

# Pull environment variables (remote → local)  
secret-sync pull <environment>
secret-sync pull production --file .env.production

# Check sync status
secret-sync status                    # All environments
secret-sync status development        # Specific environment

# Show detailed differences
secret-sync diff development
```

### Environment Mappings

By default, SecretSync maps environments as follows:

| Environment | Local File | Remote Target |
|-------------|------------|---------------|
| development | `.env.local` | development |
| preview | `.env.staging` | preview |
| production | `.env.production` | production |

## ⚙️ Configuration

SecretSync uses a `secret-sync.config.js` file for configuration:

```javascript
module.exports = {
  // Platform: vercel, netlify, railway
  platform: 'vercel',

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
    'NEXT_PUBLIC_*',
    'SUPABASE_*'
  ],

  // Sync options
  options: {
    confirmChanges: true,
    showDiffs: true,
    backupBeforeSync: false,
    sortKeys: true,
    addHeader: true
  }
};
```

### Include/Exclude Rules

- **Exclude patterns**: Variables matching these patterns will never be synced
- **Include patterns**: If specified, only variables matching these patterns will be synced
- **Glob patterns**: Use `*` for wildcards (e.g., `NEXT_PUBLIC_*`, `VERCEL_*`)
- **System protection**: Platform-specific system variables are automatically protected

## 🛡️ Safety Features

### Protected Variables

SecretSync automatically protects system variables from accidental deletion:

**Vercel Protected Variables:**
- `VERCEL_*` - All Vercel system variables
- `CI`, `NODE_ENV` - Common system variables
- Build and deployment related variables

### Confirmation Prompts

Before making changes, SecretSync shows you exactly what will happen:

```
📋 Change Summary:

+ Will add 3 variables:
  + SUPABASE_URL
  + SUPABASE_ANON_KEY  
  + GOOGLE_CLIENT_ID

~ Will update 2 variables:
  ~ DATABASE_URL
  ~ API_SECRET

- Will remove 1 variable:
  - OLD_UNUSED_VAR

🔒 Protected variables (5, won't be removed):
  🔒 VERCEL_URL
  🔒 VERCEL_ENV
  ...

Do you want to proceed with these 6 changes? (y/N)
```

## 🔧 Platform Integration

### Vercel

SecretSync integrates with the Vercel CLI:

1. **Prerequisites**: Install Vercel CLI and link your project
   ```bash
   npm i -g vercel
   vc link
   ```

2. **Authentication**: Use your existing Vercel CLI authentication

3. **Environment Mapping**: 
   - `development` → Vercel development environment
   - `preview` → Vercel preview environment  
   - `production` → Vercel production environment

### Coming Soon

- 🚧 **Netlify**: Full Netlify CLI integration
- 🚧 **Railway**: Railway platform support
- 🚧 **Custom Platforms**: Plugin system for custom integrations

## 📁 Project Structure

```
SecretSync/
├── bin/
│   └── secret-sync.js        # CLI entry point
├── src/
│   ├── core/
│   │   ├── config.js         # Configuration management
│   │   ├── parser.js         # .env file parsing
│   │   └── syncer.js         # Core sync logic
│   ├── platforms/
│   │   ├── base.js           # Platform base class
│   │   └── vercel.js         # Vercel integration
│   ├── utils/
│   │   ├── colors.js         # Terminal colors
│   │   └── prompts.js        # User interaction
│   └── index.js              # Main export
├── templates/
│   └── secret-sync.config.js # Default configuration
└── package.json
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/taiwanbigdata/secret-sync.git
cd secret-sync

# Install dependencies
npm install

# Run locally
npm run dev -- --help

# Test with example project
cd examples/next-app
../../bin/secret-sync.js status
```

## 📝 Examples

### Basic Workflow

```bash
# 1. Initialize in your Next.js project
secret-sync init

# 2. Edit your .env.local file
echo "NEXT_PUBLIC_API_URL=https://api.example.com" >> .env.local
echo "DATABASE_URL=postgresql://..." >> .env.local

# 3. Push to development
secret-sync push development

# 4. Check status across all environments  
secret-sync status

# 5. Pull production variables for debugging
secret-sync pull production --file .env.production.backup
```

### Advanced Configuration

```javascript
// secret-sync.config.js
module.exports = {
  platform: 'vercel',
  
  // Custom environment setup
  environments: {
    local: { file: '.env.local', target: 'development' },
    staging: { file: '.env.staging', target: 'preview' },
    prod: { file: '.env.prod', target: 'production' }
  },

  // Only sync specific variables
  include: [
    'NEXT_PUBLIC_*',
    'DATABASE_URL',
    'REDIS_URL'
  ],

  // Advanced options
  options: {
    confirmChanges: process.env.CI !== 'true', // Auto-confirm in CI
    sortKeys: true,
    addHeader: true
  }
};
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏢 About Taiwan Bigdata Inc.

SecretSync is developed and maintained by [Taiwan Bigdata Inc. (TBI)](https://github.com/taiwanbigdata), a leading data analytics and software development company specializing in modern web technologies and data-driven solutions.

---

**Made with ❤️ by Taiwan Bigdata Inc.**