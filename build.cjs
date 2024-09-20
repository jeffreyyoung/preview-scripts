require('esbuild').build({
    entryPoints: ['src/**/*.jsx'],
    outdir: 'dist',
    bundle: true,
    jsx: 'automatic',  // This line is key
  }).catch(() => process.exit(1))