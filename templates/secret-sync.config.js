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
    'NODE_ENV',
    'PWD',
    'HOME',
    'PATH',
    'USER',
    'SHELL'
  ],

  // Variables to include (if specified, only these will be synced)
  include: [
    // 'NEXT_PUBLIC_*',
    // 'SUPABASE_*',
    // 'GOOGLE_*'
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