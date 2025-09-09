/** @type {import("eslint").FlatConfig[]} */
const jsConfig = {
  files: ['**/*.js'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs',
  },
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
  },
};

// Use flat config "ignores" to exclude generated/non-source files
const ignoreConfig = {
  ignores: [
    'node_modules/**',
    'src/db/**',
    'post_process_status.lock',
    'dist/**',
    'build/**',
  ],
};

module.exports = [ignoreConfig, jsConfig];